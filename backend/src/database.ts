import { PrismaMssql } from '@prisma/adapter-mssql'
import { DuplicateEmailError, type NewUser, type PasswordResetStore, type UserStore } from './app.js'
import { Prisma, PrismaClient } from './generated/prisma/client.js'
import type { ProfileChanges, RestaurantRecord, RestaurantStore } from './restaurant.js'

function restaurantData(input: ProfileChanges): Prisma.RestaurantUncheckedUpdateManyInput {
  const { tags, ...fields } = input
  const data = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined)) as Prisma.RestaurantUncheckedUpdateManyInput
  if (tags !== undefined) data.tagsJson = JSON.stringify(tags)
  return data
}

function restaurantRecord(record: Awaited<ReturnType<PrismaClient['restaurant']['findUnique']>>): RestaurantRecord {
  if (!record) throw new Error('Restaurant not found after write.')
  const { tagsJson, latitude, longitude, ...fields } = record
  return {
    ...fields,
    tags: JSON.parse(tagsJson) as string[],
    latitude: latitude?.toNumber() ?? null,
    longitude: longitude?.toNumber() ?? null,
  }
}

import type { MenuChanges, MenuRecord, MenuStore, ProductionRecord } from './menu-production.js'
import type { ListingRecord, ListingStore } from './surplus-listing.js'

function menuData(input: MenuChanges): Prisma.MenuUncheckedUpdateInput {
  const { allergens, dietTags, photos, ...fields } = input
  const data = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined)) as Prisma.MenuUncheckedUpdateInput
  if (allergens !== undefined) data.allergensJson = JSON.stringify(allergens)
  if (dietTags !== undefined) data.dietTagsJson = JSON.stringify(dietTags)
  if (photos !== undefined) data.photos = { deleteMany: {}, create: photos.map((url, sortOrder) => ({ url, sortOrder })) }
  return data
}

type MenuWithPhotos = Awaited<ReturnType<PrismaClient['menu']['findFirst']>> & { photos: { url: string; sortOrder: number }[] }
function menuRecord(menu: MenuWithPhotos): MenuRecord {
  const { allergensJson, dietTagsJson, normalPrice, photos, ...fields } = menu
  return { ...fields, normalPrice: normalPrice.toNumber(), allergens: JSON.parse(allergensJson) as string[],
    dietTags: JSON.parse(dietTagsJson) as string[], photos: photos.map((photo) => photo.url) }
}

function productionRecord(record: { productionRecordId: number; menuId: number; productionDate: Date; producedQuantity: number; soldQuantity: number; surplusQuantity: number; recordedAt: Date }): ProductionRecord {
  return { ...record, productionDate: record.productionDate.toISOString().slice(0, 10) }
}

type ListingWithMenu = Prisma.SurplusListingGetPayload<{ include: { productionRecord: { include: { menu: true } } } }>
function listingRecord(listing: ListingWithMenu): ListingRecord {
  const { productionRecord, rescuePrice, pickupStart, pickupEnd, ...fields } = listing
  return { ...fields, rescuePrice: rescuePrice.toNumber(), pickupStart: pickupStart.toISOString(),
    pickupEnd: pickupEnd.toISOString(), restaurantId: productionRecord.menu.restaurantId,
    menuId: productionRecord.menuId, menuName: productionRecord.menu.name,
    productionDate: productionRecord.productionDate.toISOString().slice(0, 10),
    normalPrice: productionRecord.menu.normalPrice.toNumber(),
    status: listing.status as ListingRecord['status'] }
}

const listingInclude = { productionRecord: { include: { menu: true } } } as const

export function createDatabase(databaseUrl: string) {
  const prisma = new PrismaClient({ adapter: new PrismaMssql(databaseUrl) })
  const users: UserStore = {
    async findByEmail(email) {
      const user = await prisma.user.findUnique({ where: { email } })
      return user ? { ...user, role: user.role as 'Customer' | 'RestaurantOwner' } : null
    },
    async create(input: NewUser) {
      try {
        const user = await prisma.user.create({ data: input })
        return { ...user, role: user.role as 'Customer' | 'RestaurantOwner' }
      } catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
          throw new DuplicateEmailError()
        }
        throw error
      }
    },
  }
  const passwordResets: PasswordResetStore = {
    async create(userId, tokenHash, expiresAt) {
      await prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } })
    },
    async consume(tokenHash, passwordHash, now) {
      return prisma.$transaction(async (tx) => {
        const token = await tx.passwordResetToken.findUnique({ where: { tokenHash } })
        if (!token || token.usedAt || token.expiresAt <= now) return false
        const consumed = await tx.passwordResetToken.updateMany({
          where: { passwordResetTokenId: token.passwordResetTokenId, usedAt: null, expiresAt: { gt: now } },
          data: { usedAt: now },
        })
        if (consumed.count !== 1) return false
        await tx.user.update({ where: { userId: token.userId }, data: { passwordHash } })
        return true
      })
    },
  }
  const restaurants: RestaurantStore = {
    async list(ownerId) {
      const records = await prisma.restaurant.findMany({ where: { ownerId }, orderBy: { createdAt: 'asc' } })
      return records.map(restaurantRecord)
    },
    async create(ownerId, input) {
      const record = await prisma.restaurant.create({ data: { ...restaurantData(input), ownerId, name: input.name, address: input.address, phone: input.phone } as Prisma.RestaurantUncheckedCreateInput })
      return restaurantRecord(record)
    },
    async update(ownerId, restaurantId, input) {
      const changed = await prisma.restaurant.updateMany({
        where: { ownerId, restaurantId },
        data: restaurantData(input),
      })
      if (changed.count === 0) return null
      return restaurantRecord(await prisma.restaurant.findUnique({ where: { restaurantId } }))
    },
  }
  const menus: MenuStore = {
    async list(ownerId, restaurantId) {
      if (!await prisma.restaurant.findFirst({ where: { restaurantId, ownerId }, select: { restaurantId: true } })) return null
      const records = await prisma.menu.findMany({ where: { restaurantId }, include: { photos: { orderBy: { sortOrder: 'asc' } } }, orderBy: { createdAt: 'desc' } })
      return records.map(menuRecord)
    },
    async create(ownerId, restaurantId, input) {
      if (!await prisma.restaurant.findFirst({ where: { restaurantId, ownerId }, select: { restaurantId: true } })) return null
      const { photos, allergens, dietTags, ...fields } = input
      const record = await prisma.menu.create({ data: { ...fields, restaurantId,
        allergensJson: JSON.stringify(allergens), dietTagsJson: JSON.stringify(dietTags),
        photos: { create: photos.map((url, sortOrder) => ({ url, sortOrder })) } },
      include: { photos: { orderBy: { sortOrder: 'asc' } } } })
      return menuRecord(record)
    },
    async update(ownerId, menuId, input) {
      return prisma.$transaction(async (tx) => {
        const current = await tx.menu.findFirst({ where: { menuId, restaurant: { ownerId } }, select: { menuId: true } })
        if (!current) return null
        const record = await tx.menu.update({ where: { menuId }, data: menuData(input), include: { photos: { orderBy: { sortOrder: 'asc' } } } })
        return menuRecord(record)
      })
    },
    async production(ownerId, restaurantId, date) {
      if (!await prisma.restaurant.findFirst({ where: { restaurantId, ownerId }, select: { restaurantId: true } })) return null
      const records = await prisma.productionRecord.findMany({ where: { menu: { restaurantId }, productionDate: new Date(`${date}T00:00:00.000Z`) } })
      return records.map(productionRecord)
    },
    async upsertProduction(ownerId, menuId, date, input) {
      return prisma.$transaction(async (tx) => {
        if (!await tx.menu.findFirst({ where: { menuId, restaurant: { ownerId } }, select: { menuId: true } })) return null
        const productionDate = new Date(`${date}T00:00:00.000Z`)
        const existing = await tx.productionRecord.findUnique({ where: { menuId_productionDate: { menuId, productionDate } }, select: { productionRecordId: true } })
        if (existing) {
          const listings = await tx.surplusListing.findMany({ where: { productionRecordId: existing.productionRecordId }, select: { initialQuantity: true, availableQuantity: true, status: true } })
          const reserved = listings.reduce((total, row) => total + (row.status === 'Active' ? row.initialQuantity : row.initialQuantity - row.availableQuantity), 0)
          if (input.surplusQuantity < reserved) return 'invalid'
        }
        const record = await tx.productionRecord.upsert({ where: { menuId_productionDate: { menuId, productionDate } },
          create: { menuId, productionDate, ...input }, update: input })
        return productionRecord(record)
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
    },
    async gallery(ownerId) {
      const photos = await prisma.menuPhoto.findMany({ where: { menu: { restaurant: { ownerId } } }, select: { url: true }, distinct: ['url'] })
      return photos.map((photo) => photo.url)
    },
  }
  const listings: ListingStore = {
    async list(ownerId, restaurantId) {
      if (!await prisma.restaurant.findFirst({ where: { restaurantId, ownerId }, select: { restaurantId: true } })) return null
      const rows = await prisma.surplusListing.findMany({ where: { productionRecord: { menu: { restaurantId } } }, include: listingInclude, orderBy: { createdAt: 'desc' } })
      return rows.map(listingRecord)
    },
    async get(ownerId, listingId) {
      const row = await prisma.surplusListing.findFirst({ where: { surplusListingId: listingId, productionRecord: { menu: { restaurant: { ownerId } } } }, include: listingInclude })
      return row ? listingRecord(row) : null
    },
    async create(ownerId, restaurantId, input) {
      return prisma.$transaction(async (tx) => {
        const production = await tx.productionRecord.findFirst({
          where: { productionRecordId: input.productionRecordId, menu: { restaurant: { restaurantId, ownerId }, isActive: true } },
          select: { surplusQuantity: true, menu: { select: { normalPrice: true } } },
        })
        if (!production) return null
        if (input.rescuePrice >= production.menu.normalPrice.toNumber()) return 'invalid'
        const existing = await tx.surplusListing.findMany({ where: { productionRecordId: input.productionRecordId }, select: { initialQuantity: true, availableQuantity: true, status: true } })
        const reserved = existing.reduce((total, row) => total + (row.status === 'Active' ? row.initialQuantity : row.initialQuantity - row.availableQuantity), 0)
        if (input.status !== 'Draft' && reserved + input.initialQuantity > production.surplusQuantity) return 'invalid'
        const row = await tx.surplusListing.create({ data: {
          productionRecordId: input.productionRecordId, rescuePrice: input.rescuePrice,
          initialQuantity: input.initialQuantity, availableQuantity: input.initialQuantity,
          pickupStart: new Date(input.pickupStart), pickupEnd: new Date(input.pickupEnd),
          pickupInstructions: input.pickupInstructions ?? null, status: input.status ?? 'Active',
        }, include: listingInclude })
        return listingRecord(row)
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
    },
    async update(ownerId, listingId, input) {
      return prisma.$transaction(async (tx) => {
        const current = await tx.surplusListing.findFirst({ where: { surplusListingId: listingId, productionRecord: { menu: { restaurant: { ownerId } } } }, include: listingInclude })
        if (!current) return null
        if (current.status === 'Closed') return 'invalid'
        if ((input.rescuePrice ?? current.rescuePrice.toNumber()) >= current.productionRecord.menu.normalPrice.toNumber()) return 'invalid'
        const sold = current.initialQuantity - current.availableQuantity
        if (sold > 0 && (input.pickupStart !== undefined || input.pickupEnd !== undefined)) return 'invalid'
        const initialQuantity = input.initialQuantity ?? current.initialQuantity
        if (initialQuantity < sold) return 'invalid'
        const start = input.pickupStart ?? current.pickupStart.toISOString()
        const end = input.pickupEnd ?? current.pickupEnd.toISOString()
        if (new Date(start).getTime() <= Date.now() || new Date(end).getTime() <= new Date(start).getTime()) return 'invalid'
        const siblings = await tx.surplusListing.findMany({ where: { productionRecordId: current.productionRecordId, surplusListingId: { not: listingId } }, select: { initialQuantity: true, availableQuantity: true, status: true } })
        const reserved = siblings.reduce((total, row) => total + (row.status === 'Active' ? row.initialQuantity : row.initialQuantity - row.availableQuantity), 0)
        const status = input.status ?? current.status
        if (status === 'Active' && reserved + initialQuantity > current.productionRecord.surplusQuantity) return 'invalid'
        const row = await tx.surplusListing.update({ where: { surplusListingId: listingId }, data: {
          ...(input.rescuePrice === undefined ? {} : { rescuePrice: input.rescuePrice }),
          initialQuantity, availableQuantity: initialQuantity - sold,
          pickupStart: new Date(start), pickupEnd: new Date(end),
          ...(input.pickupInstructions === undefined ? {} : { pickupInstructions: input.pickupInstructions }),
          status,
        }, include: listingInclude })
        return listingRecord(row)
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
    },
    async close(ownerId, listingId) {
      const result = await prisma.surplusListing.updateMany({ where: { surplusListingId: listingId, productionRecord: { menu: { restaurant: { ownerId } } } }, data: { status: 'Closed' } })
      if (!result.count) return null
      const row = await prisma.surplusListing.findUniqueOrThrow({ where: { surplusListingId: listingId }, include: listingInclude })
      return listingRecord(row)
    },
  }
  return { prisma, users, passwordResets, restaurants, menus, listings }
}
