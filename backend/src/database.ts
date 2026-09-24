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
  return { prisma, users, passwordResets, restaurants }
}
