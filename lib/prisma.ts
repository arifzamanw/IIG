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
    connectionLimit: process.env.DB_CONNECTION_LIMIT ? Number(process.env.DB_CONNECTION_LIMIT) : 2,
    minimumIdle: 0,
    idleTimeout: 600,
    acquireTimeout: 30000,
    connectTimeout: 15000,
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? (globalForPrisma.prisma = createPrismaClient())

export function getPrisma(): PrismaClient {
  return prisma
}
