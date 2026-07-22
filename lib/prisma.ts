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
    password: decodeURIComponent(url.password),
    database: url.pathname.replace('/', ''),

    // --- Connection pool settings tuned for Hostinger shared MySQL ---
    // Keep max 1 connection to avoid exceeding max_connections_per_hour.
    connectionLimit: 1,

    // Do NOT proactively open connections at startup.
    // With minimumIdle > 0 the pool enters a retry loop on quota errors, burning
    // the quota further. With 0, it only opens a connection when a query arrives.
    minimumIdle: 0,

    // Keep idle connection alive for 8 hours so it is reused across requests.
    // The reaper only runs when idleTimeout > 0; 28800 seconds keeps the
    // connection for 8 hours before it is closed by the pool itself.
    idleTimeout: 28800,

    // Allow more time to acquire on slow shared hosts.
    acquireTimeout: 30000,

    // Socket handshake timeout.
    connectTimeout: 15000,

    // Skip round-trip validation when connection is returned to pool.
    // This avoids one extra DB query per request.
    noControlAfterUse: true,
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? (globalForPrisma.prisma = createPrismaClient())

export function getPrisma(): PrismaClient {
  return prisma
}
