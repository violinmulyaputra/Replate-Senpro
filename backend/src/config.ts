import { z } from 'zod'

const environmentSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_ISSUER: z.string().min(1).default('Replate.Api'),
  JWT_AUDIENCE: z.string().min(1).default('Replate.Client'),
  JWT_EXPIRES_MINUTES: z.coerce.number().int().min(1).max(1440).default(60),
  FRONTEND_URL: z.url().default('http://localhost:3000'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
})

export function loadConfig(environment: NodeJS.ProcessEnv = process.env) {
  const value = environmentSchema.parse(environment)
  return {
    databaseUrl: value.DATABASE_URL,
    frontendUrl: value.FRONTEND_URL,
    port: value.PORT,
    jwt: {
      secret: value.JWT_SECRET,
      issuer: value.JWT_ISSUER,
      audience: value.JWT_AUDIENCE,
      expiresMinutes: value.JWT_EXPIRES_MINUTES,
    },
  }
}
