import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const roles = ['Customer', 'RestaurantOwner'] as const
export type Role = (typeof roles)[number]

export type JwtConfig = {
  secret: string
  issuer: string
  audience: string
  expiresMinutes: number
}

export type TokenUser = {
  userId: number
  name: string
  email: string
  role: Role
}

const dummyHash = bcrypt.hashSync('not-a-real-password', 12)

export function normalizeRole(value: string): Role | null {
  const role = value.trim().toLowerCase()
  if (role === 'customer') return 'Customer'
  if (['restaurantowner', 'restaurant_owner', 'restaurant owner'].includes(role)) return 'RestaurantOwner'
  return null
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export function verifyPassword(password: string, passwordHash?: string) {
  return bcrypt.compare(password, passwordHash ?? dummyHash)
}

export function createToken(user: TokenUser, config: JwtConfig) {
  const expiresAt = new Date(Date.now() + config.expiresMinutes * 60_000)
  const token = jwt.sign(
    { name: user.name, email: user.email, role: user.role },
    config.secret,
    {
      algorithm: 'HS256',
      subject: String(user.userId),
      issuer: config.issuer,
      audience: config.audience,
      expiresIn: config.expiresMinutes * 60,
      jwtid: crypto.randomUUID(),
    },
  )
  return { token, expiresAt }
}

export function readToken(token: string, config: JwtConfig) {
  const payload = jwt.verify(token, config.secret, {
    algorithms: ['HS256'],
    issuer: config.issuer,
    audience: config.audience,
  })
  if (typeof payload === 'string' || !roles.includes(payload.role as Role)) throw new Error('Invalid role')
  return payload as jwt.JwtPayload & { role: Role }
}
