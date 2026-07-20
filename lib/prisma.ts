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
    connectionLimit: 3,   // shared host: keep connections low
    idleTimeout: 60,      // release idle connections after 60s
    acquireTimeout: 30000,
    connectTimeout: 10000,
  })
  return new PrismaClient({ adapter })
}

// Lazy getter — client is only instantiated on first access (request time, not build time)
let _prisma: PrismaClient | undefined

export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma
  if (!_prisma) {
    _prisma = createPrismaClient()
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = _prisma
  }
  return _prisma
}

// Convenience re-export for files that already import { prisma }
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return (getPrisma() as any)[prop]
  }
})
