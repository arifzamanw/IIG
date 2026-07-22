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
    connectionLimit: process.env.DB_CONNECTION_LIMIT ? Number(process.env.DB_CONNECTION_LIMIT) : 5,
    minimumIdle: 0,       // Do not open 10 connections simultaneously on startup; open on-demand
    idleTimeout: 60,      // release idle connections after 60s
    acquireTimeout: 30000, // 30s acquire timeout for shared hosts
    connectTimeout: 15000,
  })
  return new PrismaClient({ adapter })
}

// Lazy getter — client is only instantiated on first access (request time, not build time)
let _prisma: PrismaClient | undefined

export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma
  if (!_prisma) {
    _prisma = createPrismaClient()
    globalForPrisma.prisma = _prisma
  }
  return _prisma
}

// Convenience re-export for files that already import { prisma }
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return (getPrisma() as any)[prop]
  }
})
