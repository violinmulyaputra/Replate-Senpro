import jwt from 'jsonwebtoken'
import request from 'supertest'
import { expect, it } from 'vitest'
import { createApp, type UserStore } from './app.js'
import type { CustomerOrder, MarketplaceListing, MarketplaceStore } from './marketplace.js'

const config = {
  secret: 'test-only-key-that-is-at-least-32-characters-long',
  issuer: 'Replate.Api',
  audience: 'Replate.Client',
  expiresMinutes: 60,
}
const users: UserStore = { findByEmail: async () => null, create: async () => { throw new Error('unused') } }
const auth = (id: number, role: 'Customer' | 'RestaurantOwner') =>
  `Bearer ${jwt.sign({ role }, config.secret, { subject: String(id), issuer: config.issuer, audience: config.audience })}`

it('lists public listings and scopes checkout and order history to the customer', async () => {
  const listing: MarketplaceListing = {
    surplusListingId: 3, menuId: 2, menuName: 'Veggie Bowl', description: 'Fresh meal', category: 'Lunch',
    normalPrice: 30000, rescuePrice: 15000, discountPercent: 50, photos: ['/menu-uploads/1-image.png'],
    allergens: [], dietTags: ['Vegetarian'], allergenNote: null,
    restaurant: { restaurantId: 1, name: 'Dapur Pagi', address: 'Jl. Pagi', latitude: null, longitude: null, logoUrl: null },
    availableQuantity: 3, pickupStart: '2026-09-26T10:00:00.000Z', pickupEnd: '2026-09-26T12:00:00.000Z', pickupDirections: null,
  }
  const order: CustomerOrder = {
    orderId: 7, status: 'Pending', totalAmount: 30000, orderedAt: '2026-09-25T10:00:00.000Z',
    pickupCode: 'A1B2C3D4', estimatedPickupAt: listing.pickupStart,
    items: [{ menuName: listing.menuName, quantity: 2, unitPrice: listing.rescuePrice, subtotal: 30000 }],
  }
  const store: MarketplaceStore = {
    listListings: async (filter) => filter.category && filter.category !== listing.category ? [] : [listing],
    getListing: async (listingId) => listingId === listing.surplusListingId ? listing : null,
    createOrder: async (customerId, items) => customerId === 1 && items.every((item) => [3, 4].includes(item.surplusListingId) && item.quantity <= 3)
      ? { ...order, totalAmount: items.reduce((sum, item) => sum + item.quantity * listing.rescuePrice, 0), items: items.map((item) => ({ ...order.items[0]!, quantity: item.quantity, subtotal: item.quantity * listing.rescuePrice })) }
      : null,
    listOrders: async (customerId) => customerId === 1 ? [order] : [],
    getOrder: async (customerId, orderId) => customerId === 1 && orderId === 7 ? order : null,
  }
  const app = createApp({ users, jwt: config, frontendUrl: 'http://localhost:3000', marketplace: store })

  const list = await request(app).get('/api/marketplace/listings?q=veggie&category=Lunch')
  expect(list.status).toBe(200)
  expect(list.body[0]).toMatchObject({ menuName: 'Veggie Bowl', discountPercent: 50 })
  expect((await request(app).get('/api/marketplace/listings/999')).status).toBe(404)
  expect((await request(app).post('/api/customer/orders').send({ surplusListingId: 3, quantity: 1 })).status).toBe(401)
  expect((await request(app).post('/api/customer/orders').set('Authorization', auth(2, 'RestaurantOwner')).send({ surplusListingId: 3, quantity: 1 })).status).toBe(403)
  expect((await request(app).post('/api/customer/orders').set('Authorization', auth(1, 'Customer')).send({ items: [{ surplusListingId: 3, quantity: 0 }] })).status).toBe(400)
  expect((await request(app).post('/api/customer/orders').set('Authorization', auth(1, 'Customer')).send({ items: [{ surplusListingId: 3, quantity: 1 }, { surplusListingId: 3, quantity: 1 }] })).status).toBe(400)

  const checkout = await request(app).post('/api/customer/orders').set('Authorization', auth(1, 'Customer')).send({ items: [{ surplusListingId: 3, quantity: 1 }, { surplusListingId: 4, quantity: 1 }] })
  expect(checkout.status).toBe(201)
  expect(checkout.body).toMatchObject({ orderId: 7, totalAmount: 30000, pickupCode: 'A1B2C3D4' })
  expect(checkout.body.items).toHaveLength(2)
  expect((await request(app).get('/api/customer/orders').set('Authorization', auth(2, 'Customer'))).body).toEqual([])
  expect((await request(app).get('/api/customer/orders/7').set('Authorization', auth(2, 'Customer'))).status).toBe(404)
  expect((await request(app).get('/api/customer/orders/7').set('Authorization', auth(1, 'Customer'))).body.orderId).toBe(7)
})
