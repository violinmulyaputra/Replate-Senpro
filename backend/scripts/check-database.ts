import { lookup } from 'node:dns/promises'
import { createDatabase } from '../src/database.js'

// Read-only diagnostic: never print connection strings, credentials, or raw errors.
const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is missing. Configure backend/.env locally.')
  process.exitCode = 1
} else {
  const host = url.replace(/^sqlserver:\/\//, '').split(';')[0]?.split(':')[0]
  try {
    if (!host) throw new Error('Invalid SQL Server address')
    await lookup(host)
    const { prisma } = createDatabase(url)
    try {
      await prisma.$queryRaw`SELECT 1 AS ok`
      console.log('Database connection: OK (read-only SELECT 1).')
    } finally { await prisma.$disconnect() }
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'UNKNOWN'
    console.error(`Database connection: FAILED (${code}).`)
    if (code === 'ENOTFOUND') console.error('SQL Server hostname did not resolve. Check the active team server and DATABASE_URL locally.')
    process.exitCode = 1
  }
}
