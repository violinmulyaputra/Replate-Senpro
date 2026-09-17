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
  const store = {
    findByEmail: async (email: string) => users.find((user) => user.email === email) ?? null,
    create: async (input: NewUser) => {
      const user = { userId: users.length + 1, ...input, createdAt: new Date() }
      users.push(user)
      return user
    },
  }

  return {
    app: createApp({ users: store, jwt: jwtConfig, frontendUrl: 'http://localhost:3000', authRateLimit: 100 }),
    users,
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
