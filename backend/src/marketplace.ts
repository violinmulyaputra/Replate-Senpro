import { randomBytes } from 'node:crypto'
import express, { type RequestHandler } from 'express'
import { z } from 'zod'

export type MarketplaceListing = {
  surplusListingId: number
  menuId: number
  menuName: string
  description: string
  category: string
  normalPrice: number
  rescuePrice: number
  discountPercent: number
  photos: string[]
  allergens: string[]
  dietTags: string[]
  allergenNote: string | null
  restaurant: {
    restaurantId: number
    name: string
    address: string
    latitude: number | null
    longitude: number | null
    logoUrl: string | null
  }
  availableQuantity: number
  pickupStart: string
  pickupEnd: string
  pickupDirections: string | null
}

export type CustomerOrder = {
  orderId: number
  status: string
  totalAmount: number
  orderedAt: string
  pickupCode: string | null
  estimatedPickupAt: string | null
  items: Array<{
    menuName: string
    quantity: number
    unitPrice: number
    subtotal: number
  }>
}

export type OwnerOrder = CustomerOrder & {
  customerName: string
  restaurantName: string
  pickupStatus: string | null
  verifiedAt: string | null
}

export type MarketplaceStore = {
  listListings(filter: { search?: string; category?: string }, now: Date): Promise<MarketplaceListing[]>
  getListing(listingId: number, now: Date): Promise<MarketplaceListing | null>
  createOrder(customerId: number, items: Array<{ surplusListingId: number; quantity: number }>, now: Date): Promise<CustomerOrder | null>
  listOrders(customerId: number): Promise<CustomerOrder[]>
  getOrder(customerId: number, orderId: number): Promise<CustomerOrder | null>
  listOwnerOrders(ownerId: number): Promise<OwnerOrder[]>
  verifyPickup(ownerId: number, orderId: number, pickupCode: string, now: Date): Promise<'not-found' | 'invalid-code' | 'already-verified' | 'invalid-status' | OwnerOrder>
}

const checkoutSchema = z.object({
  items: z.array(z.object({ surplusListingId: z.number().int().positive(), quantity: z.number().int().min(1).max(100) })).min(1).max(10),
}).refine(({ items }) => new Set(items.map((item) => item.surplusListingId)).size === items.length)
const id = (value: string | undefined) => {
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}

export function addMarketplaceRoutes(app: express.Express, store: MarketplaceStore, customerOnly: RequestHandler, ownerOnly: RequestHandler) {
  app.get('/api/marketplace/listings', async (request, response, next) => {
    try {
      const search = typeof request.query.q === 'string' ? request.query.q.trim().slice(0, 100) : undefined
      const category = typeof request.query.category === 'string' ? request.query.category.trim().slice(0, 80) : undefined
      const filter: { search?: string; category?: string } = {}
      if (search) filter.search = search
      if (category) filter.category = category
      response.json(await store.listListings(filter, new Date()))
    } catch (error) {
      next(error)
    }
  })
  app.get('/api/marketplace/listings/:listingId', async (request, response, next) => {
    try {
      const listingId = id(request.params.listingId as string)
      if (!listingId) return response.status(400).json({ title: 'Invalid listing ID.' })
      const listing = await store.getListing(listingId, new Date())
      return listing ? response.json(listing) : response.status(404).json({ title: 'Listing not found.' })
    } catch (error) {
      next(error)
    }
  })
  app.post('/api/customer/orders', customerOnly, async (request, response, next) => {
    try {
      const parsed = checkoutSchema.safeParse(request.body)
      if (!parsed.success) return response.status(400).json({ title: 'Invalid order data.' })
      const order = await store.createOrder(response.locals.ownerId as number, parsed.data.items, new Date())
      return order ? response.status(201).json(order) : response.status(409).json({ title: 'Listing is unavailable or has insufficient stock.' })
    } catch (error) {
      next(error)
    }
  })
  app.get('/api/customer/orders', customerOnly, async (_request, response, next) => {
    try {
      response.json(await store.listOrders(response.locals.ownerId as number))
    } catch (error) {
      next(error)
    }
  })
  app.get('/api/customer/orders/:orderId', customerOnly, async (request, response, next) => {
    try {
      const orderId = id(request.params.orderId as string)
      if (!orderId) return response.status(400).json({ title: 'Invalid order ID.' })
      const order = await store.getOrder(response.locals.ownerId as number, orderId)
      return order ? response.json(order) : response.status(404).json({ title: 'Order not found.' })
    } catch (error) {
      next(error)
    }
  })
  app.get('/api/owner/orders', ownerOnly, async (_request, response, next) => {
    try {
      response.json(await store.listOwnerOrders(response.locals.ownerId as number))
    } catch (error) {
      next(error)
    }
  })
  app.post('/api/owner/orders/:orderId/verify-pickup', ownerOnly, async (request, response, next) => {
    try {
      const orderId = id(request.params.orderId as string)
      const pickupCode = typeof request.body?.pickupCode === 'string' ? request.body.pickupCode.trim() : ''
      if (!orderId || !/^[a-f0-9]{12}$/i.test(pickupCode)) {
        return response.status(400).json({ title: 'Invalid order ID or pickup code.' })
      }
      const result = await store.verifyPickup(response.locals.ownerId as number, orderId, pickupCode.toUpperCase(), new Date())
      if (result === 'not-found') return response.status(404).json({ title: 'Order not found.' })
      if (result === 'invalid-code') return response.status(400).json({ title: 'Pickup code is invalid.' })
      if (result === 'already-verified') return response.status(409).json({ title: 'Pickup was already verified.' })
      if (result === 'invalid-status') return response.status(409).json({ title: 'Order cannot be verified in its current status.' })
      return response.json(result)
    } catch (error) {
      next(error)
    }
  })
}

export function createPickupCode() {
  return randomBytes(6).toString('hex').toUpperCase()
}
