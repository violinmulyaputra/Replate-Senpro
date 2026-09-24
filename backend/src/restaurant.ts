import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import express, { type RequestHandler } from 'express'
import { z } from 'zod'

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)
const mediaUrl = z
  .string()
  .regex(/^\/uploads\/[1-9]\d*-[a-f0-9-]+\.(png|jpg|webp)$/)
const profileSchema = z.object({
  name: z.string().trim().min(2).max(150),
  address: z.string().trim().min(5).max(500),
  phone: z.string().trim().min(6).max(30),
  businessEmail: z.email().max(255).nullable().optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(8).optional(),
  logoUrl: mediaUrl.nullable().optional(),
  coverUrl: mediaUrl.nullable().optional(),
  pickupDirections: z.string().trim().max(1000).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  openingStart: time.nullable().optional(),
  openingEnd: time.nullable().optional(),
  pickupStart: time.nullable().optional(),
  pickupEnd: time.nullable().optional(),
  isOpen: z.boolean().optional(),
  notifyEmail: z.boolean().optional(),
  notifyPush: z.boolean().optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>
const patchSchema = profileSchema.partial()
export type ProfileChanges = z.infer<typeof patchSchema>
export type RestaurantRecord = ProfileInput & {
  restaurantId: number
  ownerId: number
  createdAt: Date
}
export type RestaurantStore = {
  list(ownerId: number): Promise<RestaurantRecord[]>
  create(ownerId: number, input: ProfileInput): Promise<RestaurantRecord>
  update(
    ownerId: number,
    restaurantId: number,
    input: ProfileChanges,
  ): Promise<RestaurantRecord | null>
}

function validHours(input: ProfileChanges) {
  return (
    (!input.openingStart ||
      !input.openingEnd ||
      input.openingStart < input.openingEnd) &&
    (!input.pickupStart ||
      !input.pickupEnd ||
      input.pickupStart < input.pickupEnd) &&
    (input.openingStart === undefined) === (input.openingEnd === undefined) &&
    (input.pickupStart === undefined) === (input.pickupEnd === undefined)
  )
}

function ownsMedia(input: ProfileChanges, ownerId: number) {
  return [input.logoUrl, input.coverUrl].every(
    (url) => !url || url.startsWith(`/uploads/${ownerId}-`),
  )
}

function imageExtension(bytes: Buffer, contentType: string) {
  if (
    contentType === 'image/png' &&
    bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))
  )
    return 'png'
  if (
    contentType === 'image/jpeg' &&
    bytes.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex'))
  )
    return 'jpg'
  if (
    contentType === 'image/webp' &&
    bytes.toString('ascii', 0, 4) === 'RIFF' &&
    bytes.toString('ascii', 8, 12) === 'WEBP'
  )
    return 'webp'
  return null
}

export function addRestaurantRoutes(
  app: express.Express,
  restaurants: RestaurantStore,
  ownerOnly: RequestHandler,
  uploadDir: string,
) {
  app.use(
    '/uploads',
    express.static(uploadDir, {
      dotfiles: 'deny',
      immutable: true,
      maxAge: '1y',
    }),
  )

  app.get(
    '/api/owner/restaurants',
    ownerOnly,
    async (_request, response, next) => {
      try {
        response.json(await restaurants.list(response.locals.ownerId as number))
      } catch (error) {
        next(error)
      }
    },
  )

  app.post(
    '/api/owner/restaurants',
    ownerOnly,
    async (request, response, next) => {
      try {
        const parsed = profileSchema.safeParse(request.body)
        const ownerId = response.locals.ownerId as number
        if (
          !parsed.success ||
          !validHours(parsed.data) ||
          !ownsMedia(parsed.data, ownerId)
        )
          return response
            .status(400)
            .json({ status: 400, title: 'Invalid restaurant data.' })
        return response
          .status(201)
          .json(await restaurants.create(ownerId, parsed.data))
      } catch (error) {
        next(error)
      }
    },
  )

  app.patch(
    '/api/owner/restaurants/:id',
    ownerOnly,
    async (request, response, next) => {
      try {
        const id = Number(request.params.id)
        const parsed = patchSchema.safeParse(request.body)
        if (
          !Number.isSafeInteger(id) ||
          id < 1 ||
          !parsed.success ||
          Object.keys(parsed.data).length === 0 ||
          !validHours(parsed.data) ||
          !ownsMedia(parsed.data, response.locals.ownerId as number)
        ) {
          return response
            .status(400)
            .json({ status: 400, title: 'Invalid restaurant data.' })
        }
        const updated = await restaurants.update(
          response.locals.ownerId as number,
          id,
          parsed.data,
        )
        if (!updated)
          return response
            .status(404)
            .json({ status: 404, title: 'Restaurant not found.' })
        return response.json(updated)
      } catch (error) {
        next(error)
      }
    },
  )

  app.post(
    '/api/owner/media',
    ownerOnly,
    express.raw({
      type: ['image/png', 'image/jpeg', 'image/webp'],
      limit: '5mb',
    }),
    async (request, response, next) => {
      try {
        if (!Buffer.isBuffer(request.body))
          return response
            .status(415)
            .json({ status: 415, title: 'Unsupported image type.' })
        const extension = imageExtension(
          request.body,
          request.header('Content-Type')?.split(';')[0] ?? '',
        )
        if (!extension)
          return response
            .status(400)
            .json({ status: 400, title: 'Invalid image.' })
        const filename = `${response.locals.ownerId as number}-${randomUUID()}.${extension}`
        await mkdir(uploadDir, { recursive: true })
        await writeFile(path.join(uploadDir, filename), request.body, {
          flag: 'wx',
        })
        return response.status(201).json({ url: `/uploads/${filename}` })
      } catch (error) {
        next(error)
      }
    },
  )
}
