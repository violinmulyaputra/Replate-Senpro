import { createApp } from './app.js'
import { loadConfig } from './config.js'
import { createDatabase } from './database.js'

const config = loadConfig()
const { prisma, users } = createDatabase(config.databaseUrl)
const app = createApp({ users, jwt: config.jwt, frontendUrl: config.frontendUrl })
const server = app.listen(config.port, () => {
  console.log(`Replate API listening on port ${config.port}`)
})

async function shutdown() {
  server.close()
  await prisma.$disconnect()
}

process.once('SIGTERM', shutdown)
process.once('SIGINT', shutdown)
