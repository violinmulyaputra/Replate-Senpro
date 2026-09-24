import jwt from 'jsonwebtoken'
import request from 'supertest'
import { expect, it } from 'vitest'
import { createApp, type UserStore } from './app.js'
import type { ListingRecord, ListingStore } from './surplus-listing.js'

const jwtConfig = {
  secret: 'test-only-key-that-is-at-least-32-characters-long',
  issuer: 'Replate.Api',
  audience: 'Replate.Client',
  expiresMinutes: 60,
}
const users: UserStore = {
  findByEmail: async () => null,
  create: async () => { throw new Error('unused') },
}
const token = (ownerId: number, role = 'RestaurantOwner') =>
  `Bearer ${jwt.sign({ role }, jwtConfig.secret, { subject: String(ownerId), issuer: jwtConfig.issuer, audience: jwtConfig.audience })}`

it('validates listing windows, quantities, ownership, and close state', async () => {
  const records: ListingRecord[] = []
  const store: ListingStore = {
    list: async (ownerId, restaurantId) => ownerId === restaurantId ? records : null,
    get: async (ownerId, listingId) => records.find((row) => row.restaurantId === ownerId && row.surplusListingId === listingId) ?? null,
    create: async (ownerId, restaurantId, input) => {
      if (ownerId !== restaurantId || input.productionRecordId !== 1) return null
      if (input.initialQuantity > 5 || input.rescuePrice >= 30000) return 'invalid'
      const row: ListingRecord = { ...input, surplusListingId: records.length + 1, restaurantId, menuId: 1, menuName: 'Nasi', productionDate: '2026-09-24', normalPrice: 30000, availableQuantity: input.initialQuantity, status: input.status ?? 'Active', createdAt: new Date() }
      records.push(row)
      return row
    },
    update: async (ownerId, listingId, input) => {
      const row = records.find((item) => item.restaurantId === ownerId && item.surplusListingId === listingId)
      if (!row) return null
      if (row.status === 'Closed' || (input.initialQuantity ?? 0) > 5 || (input.rescuePrice ?? 0) >= row.normalPrice) return 'invalid'
      Object.assign(row, input)
      return row
    },
    close: async (ownerId, listingId) => {
      const row = records.find((item) => item.restaurantId === ownerId && item.surplusListingId === listingId)
      if (!row) return null
      row.status = 'Closed'
      return row
    },
  }
  const app = createApp({ users, jwt: jwtConfig, frontendUrl: 'http://localhost:3000', listings: store })
  const start = new Date(Date.now() + 60_000).toISOString()
  const end = new Date(Date.now() + 3_600_000).toISOString()
  const data = { productionRecordId: 1, rescuePrice: 15000, initialQuantity: 5, pickupStart: start, pickupEnd: end }

  expect((await request(app).get('/api/owner/restaurants/1/listings')).status).toBe(401)
  expect((await request(app).get('/api/owner/restaurants/1/listings').set('Authorization', token(1, 'Customer'))).status).toBe(403)
  expect((await request(app).post('/api/owner/restaurants/2/listings').set('Authorization', token(1)).send(data)).status).toBe(404)
  expect((await request(app).post('/api/owner/restaurants/1/listings').set('Authorization', token(1)).send({ ...data, pickupEnd: start })).status).toBe(400)
  expect((await request(app).post('/api/owner/restaurants/1/listings').set('Authorization', token(1)).send({ ...data, initialQuantity: 6 })).status).toBe(400)
  expect((await request(app).post('/api/owner/restaurants/1/listings').set('Authorization', token(1)).send({ ...data, rescuePrice: 30000 })).status).toBe(400)
  const created = await request(app).post('/api/owner/restaurants/1/listings').set('Authorization', token(1)).send(data)
  expect(created.status).toBe(201)
  expect(created.body.availableQuantity).toBe(5)
  expect((await request(app).get('/api/owner/listings/1').set('Authorization', token(2))).status).toBe(404)
  expect((await request(app).patch('/api/owner/listings/1').set('Authorization', token(2)).send({ rescuePrice: 10000 })).status).toBe(404)
  expect((await request(app).patch('/api/owner/listings/1').set('Authorization', token(1)).send({ rescuePrice: 10000 })).status).toBe(200)
  expect((await request(app).delete('/api/owner/listings/1').set('Authorization', token(1))).body.status).toBe('Closed')
  expect((await request(app).patch('/api/owner/listings/1').set('Authorization', token(1)).send({ rescuePrice: 9000 })).status).toBe(400)
  const draft = await request(app).post('/api/owner/restaurants/1/listings').set('Authorization', token(1)).send({ ...data, status: 'Draft', pickupInstructions: 'Bawa tas sendiri' })
  expect(draft.status).toBe(201)
  expect(draft.body.status).toBe('Draft')
  expect((await request(app).patch('/api/owner/listings/2').set('Authorization', token(1)).send({ status: 'Active' })).body.status).toBe('Active')
})
