import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp, type NewUser, type User } from './app.js'

const jwtConfig = {
  secret: 'test-only-key-that-is-at-least-32-characters-long',
  issuer: 'Replate.Api',
  audience: 'Replate.Client',
  expiresMinutes: 60,
}

function setup() {
  const users: User[] = []
  const resetTokens = new Map<string, { userId: number; expiresAt: Date; used: boolean }>()
  const resetEmails: { email: string; url: string }[] = []
  const store = {
    findByEmail: async (email: string) => users.find((user) => user.email === email) ?? null,
    create: async (input: NewUser) => {
      const user = { userId: users.length + 1, ...input, createdAt: new Date() }
      users.push(user)
      return user
    },
  }

  return {
    app: createApp({
      users: store,
      passwordResets: {
        create: async (userId, tokenHash, expiresAt) => { resetTokens.set(tokenHash, { userId, expiresAt, used: false }) },
        consume: async (tokenHash, passwordHash, now) => {
          const token = resetTokens.get(tokenHash)
          if (!token || token.used || token.expiresAt <= now) return false
          token.used = true
          users.find((user) => user.userId === token.userId)!.passwordHash = passwordHash
          return true
        },
      },
      sendPasswordReset: async (email, url) => { resetEmails.push({ email, url }) },
      jwt: jwtConfig,
      frontendUrl: 'http://localhost:3000',
      authRateLimit: 100,
    }),
    users,
    resetTokens,
    resetEmails,
  }
}

describe('Replate API', () => {
  it('reports its health', async () => {
    const { app } = setup()

    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
  })

  it('registers and logs in without exposing the password hash', async () => {
    const { app, users } = setup()
    const registration = {
      name: 'Customer Test',
      email: 'CUSTOMER@example.com',
      password: 'secure-password',
      role: 'customer',
    }

    const registered = await request(app).post('/api/auth/register').send(registration)

    expect(registered.status).toBe(201)
    expect(registered.body.email).toBe('customer@example.com')
    expect(registered.body.role).toBe('Customer')
    expect(registered.body.phone).toBeNull()
    expect(registered.body).not.toHaveProperty('passwordHash')
    expect(await bcrypt.compare(registration.password, users[0]!.passwordHash)).toBe(true)
    expect(jwt.verify(registered.body.token, jwtConfig.secret).sub).toBe('1')

    const loggedIn = await request(app).post('/api/auth/login').send({
      email: registration.email,
      password: registration.password,
    })

    expect(loggedIn.status).toBe(200)
    expect(loggedIn.body.userId).toBe(1)
  })

  it('stores a phone number without requiring one for existing clients', async () => {
    const { app, users } = setup()
    const response = await request(app).post('/api/auth/register').send({
      name: 'Owner Test', email: 'owner@example.com', password: 'secure-password', role: 'RestaurantOwner', phone: '+628123456789',
    })
    expect(response.status).toBe(201)
    expect(response.body.phone).toBe('+628123456789')
    expect(users[0]!.phone).toBe('+628123456789')
  })

  it('resets a password with a one-time expiring emailed token', async () => {
    const { app, resetEmails, resetTokens } = setup()
    const email = 'customer@example.com'
    await request(app).post('/api/auth/register').send({ name: 'Customer', email, password: 'old-password', role: 'Customer' })
    const unknown = await request(app).post('/api/auth/forgot-password').send({ email: 'absent@example.com' })
    const known = await request(app).post('/api/auth/forgot-password').send({ email })
    expect(unknown.status).toBe(202)
    expect(known.status).toBe(202)
    expect(known.body).toEqual(unknown.body)
    expect(resetEmails).toHaveLength(1)
    const token = new URL(resetEmails[0]!.url).searchParams.get('token')!
    expect(resetTokens.has(token)).toBe(false)

    const first = await request(app).post('/api/auth/reset-password').send({ token, password: 'new-password' })
    const replay = await request(app).post('/api/auth/reset-password').send({ token, password: 'other-password' })
    expect(first.status).toBe(204)
    expect(replay.status).toBe(400)
    expect((await request(app).post('/api/auth/login').send({ email, password: 'old-password' })).status).toBe(401)
    expect((await request(app).post('/api/auth/login').send({ email, password: 'new-password' })).status).toBe(200)

    await request(app).post('/api/auth/forgot-password').send({ email })
    const secondToken = new URL(resetEmails[1]!.url).searchParams.get('token')!
    for (const entry of resetTokens.values()) if (!entry.used) entry.expiresAt = new Date(0)
    expect((await request(app).post('/api/auth/reset-password').send({ token: secondToken, password: 'expired-password' })).status).toBe(400)
  })

  it('rejects malformed registration, unknown roles, and duplicate email', async () => {
    const { app } = setup()

    expect((await request(app).post('/api/auth/register').send({})).status).toBe(400)
    expect((await request(app).post('/api/auth/register').send({
      name: 'Test User', email: 'test@example.com', password: 'secure-password', role: 'Admin',
    })).status).toBe(400)

    const valid = { name: 'Test User', email: 'test@example.com', password: 'secure-password', role: 'customer' }
    expect((await request(app).post('/api/auth/register').send(valid)).status).toBe(201)
    expect((await request(app).post('/api/auth/register').send(valid)).status).toBe(409)
  })

  it('rejects malformed JSON as a bad request', async () => {
    const { app } = setup()

    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email":')

    expect(response.status).toBe(400)
  })

  it('returns the same response for an unknown email and a wrong password', async () => {
    const { app } = setup()
    await request(app).post('/api/auth/register').send({
      name: 'Test User', email: 'test@example.com', password: 'secure-password', role: 'customer',
    })

    const unknown = await request(app).post('/api/auth/login').send({
      email: 'unknown@example.com', password: 'secure-password',
    })
    const wrong = await request(app).post('/api/auth/login').send({
      email: 'test@example.com', password: 'wrong-password',
    })

    expect(unknown.status).toBe(401)
    expect(wrong.status).toBe(401)
    expect(unknown.body.title).toBe('Invalid email or password.')
    expect(wrong.body.title).toBe(unknown.body.title)
  })

  it.each([
    ['Customer', '/api/access/customer', 200],
    ['Customer', '/api/access/restaurant-owner', 403],
    ['RestaurantOwner', '/api/access/restaurant-owner', 200],
    ['RestaurantOwner', '/api/access/customer', 403],
  ])('enforces %s access to %s', async (role, path, expectedStatus) => {
    const { app } = setup()
    const token = jwt.sign({ role }, jwtConfig.secret, {
      subject: '1', issuer: jwtConfig.issuer, audience: jwtConfig.audience, expiresIn: '5m',
    })

    expect((await request(app).get('/api/access/customer')).status).toBe(401)
    expect((await request(app).get(path).set('Authorization', `Bearer ${token}`)).status).toBe(expectedStatus)
  })
})
