import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import jwt from 'jsonwebtoken'
import request from 'supertest'
import { expect, it, onTestFinished } from 'vitest'
import { createApp, type UserStore } from './app.js'
import type {
  MenuRecord,
  MenuStore,
  ProductionRecord,
} from './menu-production.js'

const config = {
  secret: 'test-only-key-that-is-at-least-32-characters-long',
  issuer: 'Replate.Api',
  audience: 'Replate.Client',
  expiresMinutes: 60,
}
const users: UserStore = {
  findByEmail: async () => null,
  create: async () => {
    throw new Error('unused')
  },
}
const auth = (id: number) =>
  `Bearer ${jwt.sign({ role: 'RestaurantOwner' }, config.secret, { subject: String(id), issuer: config.issuer, audience: config.audience })}`

it('scopes menu writes to the owner and rejects surplus beyond production', async () => {
  const uploadDir = await mkdtemp(path.join(tmpdir(), 'replate-menu-test-'))
  onTestFinished(() => rm(uploadDir, { recursive: true, force: true }))
  const menus: MenuRecord[] = []
  const records: ProductionRecord[] = []
  const store: MenuStore = {
    list: async (ownerId, restaurantId) =>
      ownerId === restaurantId
        ? menus.filter((menu) => menu.restaurantId === restaurantId)
        : null,
    create: async (ownerId, restaurantId, input) => {
      if (ownerId !== restaurantId) return null
      const menu = {
        ...input,
        menuId: menus.length + 1,
        restaurantId,
        createdAt: new Date(),
      }
      menus.push(menu)
      return menu
    },
    update: async (ownerId, menuId, input) => {
      const menu = menus.find(
        (item) => item.menuId === menuId && item.restaurantId === ownerId,
      )
      if (!menu) return null
      Object.assign(menu, input)
      return menu
    },
    production: async (ownerId, restaurantId) =>
      ownerId === restaurantId ? records : null,
    upsertProduction: async (ownerId, menuId, date, input) => {
      if (
        !menus.some(
          (menu) => menu.menuId === menuId && menu.restaurantId === ownerId,
        )
      )
        return null
      const record = {
        ...input,
        productionRecordId: 1,
        menuId,
        productionDate: date,
        recordedAt: new Date(),
      }
      records.push(record)
      return record
    },
    gallery: async () => [],
  }
  const app = createApp({
    users,
    jwt: config,
    frontendUrl: 'http://localhost:3000',
    menus: store,
    menuUploadDir: uploadDir,
  })
  const data = {
    name: 'Veggie Bowl',
    description: 'Nasi dan sayuran',
    category: 'Salad',
    normalPrice: 35000,
    allergens: [],
    dietTags: ['Vegetarian'],
    allergenNote: null,
    isActive: true,
    photos: [],
  }
  expect(
    (
      await request(app)
        .post('/api/owner/restaurants/2/menus')
        .set('Authorization', auth(1))
        .send(data)
    ).status,
  ).toBe(404)
  const created = await request(app)
    .post('/api/owner/restaurants/1/menus')
    .set('Authorization', auth(1))
    .send(data)
  expect(created.status).toBe(201)
  expect(
    (
      await request(app)
        .patch('/api/owner/menus/1')
        .set('Authorization', auth(2))
        .send({ name: 'Stolen' })
    ).status,
  ).toBe(404)
  expect(menus[0]?.name).toBe('Veggie Bowl')
  expect(
    (
      await request(app)
        .put('/api/owner/menus/1/production/2026-09-24')
        .set('Authorization', auth(1))
        .send({ producedQuantity: 10, soldQuantity: 8, surplusQuantity: 3 })
    ).status,
  ).toBe(400)
  expect(
    (
      await request(app)
        .put('/api/owner/menus/1/production/2026-09-24')
        .set('Authorization', auth(2))
        .send({ producedQuantity: 10, soldQuantity: 8, surplusQuantity: 2 })
    ).status,
  ).toBe(404)
  expect(
    (
      await request(app)
        .put('/api/owner/menus/1/production/2026-09-24')
        .set('Authorization', auth(1))
        .send({ producedQuantity: 10, soldQuantity: 8, surplusQuantity: 2 })
    ).status,
  ).toBe(200)
  expect(records).toHaveLength(1)

  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9uN1sAAAAASUVORK5CYII=',
    'base64',
  )
  expect(
    (await request(app).post('/api/owner/menu-media').set('Content-Type', 'image/png').send(png)).status,
  ).toBe(401)
  const uploaded = await request(app)
    .post('/api/owner/menu-media')
    .set('Authorization', auth(1))
    .set('Content-Type', 'image/png')
    .send(png)
  expect(uploaded.status).toBe(201)
  expect(uploaded.body.url).toMatch(/^\/menu-uploads\/1-[a-f0-9-]+\.png$/)
  expect((await request(app).get(uploaded.body.url)).body).toEqual(png)
  expect(
    (
      await request(app)
        .post('/api/owner/menu-media')
        .set('Authorization', auth(1))
        .set('Content-Type', 'image/png')
        .send(Buffer.from('not a png'))
    ).status,
  ).toBe(400)
  expect(
    (
      await request(app)
        .post('/api/owner/menu-media')
        .set('Authorization', auth(1))
        .set('Content-Type', 'image/png')
        .send(Buffer.concat([png, Buffer.alloc(5 * 1024 * 1024)]))
    ).status,
  ).toBe(413)
  expect(
    (
      await request(app)
        .post('/api/owner/restaurants/1/menus')
        .set('Authorization', auth(1))
        .send({ ...data, photos: [uploaded.body.url.replace('/1-', '/2-')] })
    ).status,
  ).toBe(400)
})
