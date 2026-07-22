import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error('DATABASE_URL environment variable is not set')

  const url = new URL(dbUrl)
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.replace('/', ''),
    // Keep exactly 1 connection alive permanently so it is reused across requests
    // rather than being torn down and re-opened (which burns max_connections_per_hour)
    connectionLimit: 1,
    minimumIdle: 1,
    // 0 = never evict idle connections — the one persistent connection lives forever
    idleTimeout: 0,
    acquireTimeout: 30000,
    connectTimeout: 15000,
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? (globalForPrisma.prisma = createPrismaClient())

export function getPrisma(): PrismaClient {
  return prisma
}
