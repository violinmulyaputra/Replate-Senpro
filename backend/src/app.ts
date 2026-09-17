import cors from 'cors'
import express, { type RequestHandler } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { z } from 'zod'
import {
  createToken,
  hashPassword,
  normalizeRole,
  readToken,
  verifyPassword,
  type JwtConfig,
  type Role,
} from './auth.js'

export type User = {
  userId: number
  name: string
  email: string
  passwordHash: string
  role: Role
  createdAt: Date
}

export type NewUser = Omit<User, 'userId' | 'createdAt'>

export type UserStore = {
  findByEmail(email: string): Promise<User | null>
  create(input: NewUser): Promise<User>
}

export class DuplicateEmailError extends Error {}

type Dependencies = {
  users: UserStore
  jwt: JwtConfig
  frontendUrl: string
  authRateLimit?: number
}

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(255),
  password: z.string().min(8).max(128),
  role: z.string(),
})

const loginSchema = z.object({
  email: z.email().max(255),
  password: z.string().min(8).max(128),
})

function problem(status: number, title: string) {
  return { status, title }
}

function authResponse(user: User, jwtConfig: JwtConfig) {
  const { token, expiresAt } = createToken(user, jwtConfig)
  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
    expiresAt,
  }
}

export function createApp({ users, jwt: jwtConfig, frontendUrl, authRateLimit = 10 }: Dependencies) {
  if (Buffer.byteLength(jwtConfig.secret, 'utf8') < 32) throw new Error('JWT_SECRET must contain at least 32 bytes.')
  if (!jwtConfig.issuer || !jwtConfig.audience || jwtConfig.expiresMinutes < 1 || jwtConfig.expiresMinutes > 1440) {
    throw new Error('JWT issuer, audience, or expiry configuration is invalid.')
  }

  const app = express()
  app.use(helmet())
  app.use(cors({ origin: frontendUrl }))
  app.use(express.json({ limit: '16kb' }))

  app.get('/api/health', (_request, response) => response.json({ status: 'ok' }))

  const authLimiter = rateLimit({
    windowMs: 60_000,
    limit: authRateLimit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  })

  app.post('/api/auth/register', authLimiter, async (request, response, next) => {
    try {
      const parsed = registerSchema.safeParse(request.body)
      if (!parsed.success) return response.status(400).json(problem(400, 'Invalid registration data.'))

      const role = normalizeRole(parsed.data.role)
      if (!role) return response.status(400).json(problem(400, 'Role must be Customer or RestaurantOwner.'))

      const email = parsed.data.email.trim().toLowerCase()
      if (await users.findByEmail(email)) {
        return response.status(409).json(problem(409, 'Email is already registered.'))
      }

      const user = await users.create({
        name: parsed.data.name,
        email,
        passwordHash: await hashPassword(parsed.data.password),
        role,
      })
      return response.status(201).json(authResponse(user, jwtConfig))
    } catch (error) {
      if (error instanceof DuplicateEmailError) {
        return response.status(409).json(problem(409, 'Email is already registered.'))
      }
      next(error)
    }
  })

  app.post('/api/auth/login', authLimiter, async (request, response) => {
    const parsed = loginSchema.safeParse(request.body)
    if (!parsed.success) return response.status(400).json(problem(400, 'Invalid login data.'))

    const user = await users.findByEmail(parsed.data.email.trim().toLowerCase())
    const validPassword = await verifyPassword(parsed.data.password, user?.passwordHash)
    if (!user || !validPassword) {
      return response.status(401).json(problem(401, 'Invalid email or password.'))
    }
    return response.json(authResponse(user, jwtConfig))
  })

  const requireRole = (role: Role): RequestHandler => (request, response, next) => {
    const [scheme, token] = request.header('Authorization')?.split(' ') ?? []
    if (scheme !== 'Bearer' || !token) return response.status(401).json(problem(401, 'Unauthorized.'))
    try {
      const payload = readToken(token, jwtConfig)
      if (payload.role !== role) return response.status(403).json(problem(403, 'Forbidden.'))
      next()
    } catch {
      return response.status(401).json(problem(401, 'Unauthorized.'))
    }
  }

  app.get('/api/access/customer', requireRole('Customer'), (_request, response) => {
    response.json({ role: 'Customer' })
  })
  app.get('/api/access/restaurant-owner', requireRole('RestaurantOwner'), (_request, response) => {
    response.json({ role: 'RestaurantOwner' })
  })

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    if (error instanceof SyntaxError && 'status' in error && error.status === 400) {
      return response.status(400).json(problem(400, 'Invalid JSON.'))
    }
    response.status(500).json(problem(500, 'An unexpected error occurred.'))
  })

  return app
}
