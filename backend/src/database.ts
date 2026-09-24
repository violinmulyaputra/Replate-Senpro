import { PrismaMssql } from '@prisma/adapter-mssql'
import { DuplicateEmailError, type NewUser, type PasswordResetStore, type UserStore } from './app.js'
import { PrismaClient } from './generated/prisma/client.js'
import type { Prisma } from './generated/prisma/client.js'
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
      if (!await prisma.menu.findFirst({ where: { menuId, restaurant: { ownerId } }, select: { menuId: true } })) return null
      const record = await prisma.productionRecord.upsert({ where: { menuId_productionDate: { menuId, productionDate: new Date(`${date}T00:00:00.000Z`) } },
        create: { menuId, productionDate: new Date(`${date}T00:00:00.000Z`), ...input }, update: input })
      return productionRecord(record)
    },
    async gallery(ownerId) {
      const photos = await prisma.menuPhoto.findMany({ where: { menu: { restaurant: { ownerId } } }, select: { url: true }, distinct: ['url'] })
      return photos.map((photo) => photo.url)
    },
  }
  return { prisma, users, passwordResets, restaurants, menus }
}
