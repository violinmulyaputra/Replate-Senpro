import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import jwt from 'jsonwebtoken'
import request from 'supertest'
import { expect, it } from 'vitest'
import { createApp } from './app.js'
import type { RestaurantRecord, RestaurantStore } from './restaurant.js'

const jwtConfig = {
  secret: 'test-only-key-that-is-at-least-32-characters-long',
  issuer: 'Replate.Api',
  audience: 'Replate.Client',
  expiresMinutes: 60,
}

it('limits restaurant data and media upload to restaurant owners', async () => {
  const uploadDir = await mkdtemp(path.join(tmpdir(), 'replate-media-'))
  const records: RestaurantRecord[] = []
  const restaurants: RestaurantStore = {
    list: async (ownerId) =>
      records.filter((record) => record.ownerId === ownerId),
    create: async (ownerId, input) => {
      const record = {
        ...input,
        restaurantId: records.length + 1,
        ownerId,
        createdAt: new Date(),
      }
      records.push(record)
      return record
    },
    update: async (ownerId, id, input) => {
      const record = records.find(
        (item) => item.ownerId === ownerId && item.restaurantId === id,
      )
      return record ? Object.assign(record, input) : null
    },
  }
  const app = createApp({
    users: {
      findByEmail: async () => null,
      create: async () => {
        throw new Error('unused')
      },
    },
    restaurants,
    uploadDir,
    jwt: jwtConfig,
    frontendUrl: 'http://localhost:3000',
  })
  const token = (id: number, role = 'RestaurantOwner') =>
    jwt.sign({ role }, jwtConfig.secret, {
      subject: String(id),
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    })
  const owner1 = `Bearer ${token(1)}`
  const owner2 = `Bearer ${token(2)}`

  try {
    expect((await request(app).get('/api/owner/restaurants')).status).toBe(401)
    expect(
      (
        await request(app)
          .get('/api/owner/restaurants')
          .set('Authorization', `Bearer ${token(3, 'Customer')}`)
      ).status,
    ).toBe(403)
    expect(
      (
        await request(app)
          .post('/api/owner/restaurants')
          .set('Authorization', owner1)
          .send({
            name: 'Cafe',
            address: 'Jalan Utama 1',
            phone: '+62812345678',
            pickupStart: '19:00',
          })
      ).status,
    ).toBe(400)

    const created = await request(app)
      .post('/api/owner/restaurants')
      .set('Authorization', owner1)
      .send({
        name: 'Sunrise Cafe',
        address: 'Jalan Utama 1',
        phone: '+62812345678',
        pickupStart: '17:00',
        pickupEnd: '19:00',
        latitude: -7.7691,
        longitude: 110.3779,
      })
    expect(created.status).toBe(201)
    expect(
      (
        await request(app)
          .get('/api/owner/restaurants')
          .set('Authorization', owner1)
      ).body,
    ).toHaveLength(1)
    expect(
      (
        await request(app)
          .get('/api/owner/restaurants')
          .set('Authorization', owner2)
      ).body,
    ).toHaveLength(0)
    expect(
      (
        await request(app)
          .patch('/api/owner/restaurants/1')
          .set('Authorization', owner2)
          .send({ name: 'Taken' })
      ).status,
    ).toBe(404)

    const image = Buffer.from('89504e470d0a1a0a001122', 'hex')
    const uploaded = await request(app)
      .post('/api/owner/media')
      .set('Authorization', owner1)
      .set('Content-Type', 'image/png')
      .send(image)
    expect(uploaded.status).toBe(201)
    expect(uploaded.body.url).toMatch(/^\/uploads\/1-[a-f0-9-]+\.png$/)
    expect((await request(app).get(uploaded.body.url)).body).toEqual(image)
    expect(
      (
        await request(app)
          .patch('/api/owner/restaurants/1')
          .set('Authorization', owner1)
          .send({
            logoUrl: '/uploads/2-12345678-1234-1234-1234-123456789abc.png',
          })
      ).status,
    ).toBe(400)
    expect(
      (
        await request(app)
          .post('/api/owner/media')
          .set('Authorization', owner1)
          .set('Content-Type', 'image/png')
          .send(Buffer.from('bad'))
      ).status,
    ).toBe(400)
  } finally {
    await rm(uploadDir, { recursive: true, force: true })
  }
})
