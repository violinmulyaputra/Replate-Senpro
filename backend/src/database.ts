import { PrismaMssql } from '@prisma/adapter-mssql'
import { DuplicateEmailError, type NewUser, type PasswordResetStore, type UserStore } from './app.js'
import { PrismaClient } from './generated/prisma/client.js'

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
  return { prisma, users, passwordResets }
}
