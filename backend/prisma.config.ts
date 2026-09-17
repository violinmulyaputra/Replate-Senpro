import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? 'sqlserver://localhost:1433;database=Replate;user=sa;password=local-only;encrypt=true;trustServerCertificate=true',
  },
})
