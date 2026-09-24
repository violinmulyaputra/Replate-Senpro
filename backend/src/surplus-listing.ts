import express, { type RequestHandler } from 'express'
import { z } from 'zod'

const listingInput = z.object({
  productionRecordId: z.number().int().positive(),
  rescuePrice: z.number().finite().positive().max(1_000_000_000),
  initialQuantity: z.number().int().positive(),
  pickupStart: z.iso.datetime({ offset: true }),
  pickupEnd: z.iso.datetime({ offset: true }),
  pickupInstructions: z.string().trim().max(250).nullable().optional(),
  status: z.enum(['Active', 'Draft']).optional(),
})
const listingChanges = listingInput.omit({ productionRecordId: true }).partial()

export type ListingInput = z.infer<typeof listingInput>
export type ListingChanges = z.infer<typeof listingChanges>
export type ListingRecord = Omit<ListingInput, 'status'> & {
  surplusListingId: number
  restaurantId: number
  menuId: number
  menuName: string
  productionDate: string
  normalPrice: number
  availableQuantity: number
  status: 'Active' | 'Draft' | 'Closed'
  createdAt: Date
}
export type ListingStore = {
  list(ownerId: number, restaurantId: number): Promise<ListingRecord[] | null>
  get(ownerId: number, listingId: number): Promise<ListingRecord | null>
  create(ownerId: number, restaurantId: number, input: ListingInput): Promise<ListingRecord | null | 'invalid'>
  update(ownerId: number, listingId: number, input: ListingChanges): Promise<ListingRecord | null | 'invalid'>
  close(ownerId: number, listingId: number): Promise<ListingRecord | null>
}

function id(value: string | undefined) {
  const number = Number(value)
  return Number.isSafeInteger(number) && number > 0 ? number : null
}

function validWindow(start: string, end: string) {
  return new Date(start).getTime() > Date.now() && new Date(end).getTime() > new Date(start).getTime()
}

export function addListingRoutes(app: express.Express, store: ListingStore, ownerOnly: RequestHandler) {
  app.get('/api/owner/restaurants/:restaurantId/listings', ownerOnly, async (request, response, next) => {
    try {
      const restaurantId = id(request.params.restaurantId as string)
      if (!restaurantId) return response.status(400).json({ title: 'Invalid restaurant ID.' })
      const listings = await store.list(response.locals.ownerId as number, restaurantId)
      return listings ? response.json(listings) : response.status(404).json({ title: 'Restaurant not found.' })
    } catch (error) { next(error) }
  })

  app.get('/api/owner/listings/:listingId', ownerOnly, async (request, response, next) => {
    try {
      const listingId = id(request.params.listingId as string)
      if (!listingId) return response.status(400).json({ title: 'Invalid listing ID.' })
      const listing = await store.get(response.locals.ownerId as number, listingId)
      return listing ? response.json(listing) : response.status(404).json({ title: 'Listing not found.' })
    } catch (error) { next(error) }
  })

  app.post('/api/owner/restaurants/:restaurantId/listings', ownerOnly, async (request, response, next) => {
    try {
      const restaurantId = id(request.params.restaurantId as string)
      const parsed = listingInput.safeParse(request.body)
      if (!restaurantId || !parsed.success || !validWindow(parsed.data.pickupStart, parsed.data.pickupEnd))
        return response.status(400).json({ title: 'Invalid listing data.' })
      const listing = await store.create(response.locals.ownerId as number, restaurantId, parsed.data)
      if (listing === 'invalid') return response.status(400).json({ title: 'Quantity exceeds available surplus or menu is inactive.' })
      return listing ? response.status(201).json(listing) : response.status(404).json({ title: 'Restaurant or production record not found.' })
    } catch (error) { next(error) }
  })

  app.patch('/api/owner/listings/:listingId', ownerOnly, async (request, response, next) => {
    try {
      const listingId = id(request.params.listingId as string)
      const parsed = listingChanges.safeParse(request.body)
      if (!listingId || !parsed.success || Object.keys(parsed.data).length === 0)
        return response.status(400).json({ title: 'Invalid listing data.' })
      const listing = await store.update(response.locals.ownerId as number, listingId, parsed.data)
      if (listing === 'invalid') return response.status(400).json({ title: 'Invalid quantity, price, pickup window, or listing status.' })
      return listing ? response.json(listing) : response.status(404).json({ title: 'Listing not found.' })
    } catch (error) { next(error) }
  })

  app.delete('/api/owner/listings/:listingId', ownerOnly, async (request, response, next) => {
    try {
      const listingId = id(request.params.listingId as string)
      if (!listingId) return response.status(400).json({ title: 'Invalid listing ID.' })
      const listing = await store.close(response.locals.ownerId as number, listingId)
      return listing ? response.json(listing) : response.status(404).json({ title: 'Listing not found.' })
    } catch (error) { next(error) }
  })
}
