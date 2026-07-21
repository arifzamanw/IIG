const { PrismaClient } = require('@prisma/client')

// Mock prisma without actually connecting to the DB just to check syntax
// Wait, Prisma validates queries at runtime before sending to DB. 
// We need a real DB connection. 
// I'll read the DATABASE_URL from .env.
const fs = require('fs')
const envContent = fs.readFileSync('.env', 'utf-8')
const dbUrlMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/)
if (dbUrlMatch) {
  process.env.DATABASE_URL = dbUrlMatch[1]
}

const prisma = new PrismaClient()

async function main() {
  try {
    const query = 'test'
    const where = undefined
    
    const res = await prisma.customer.findMany({
      where: {
        AND: [
          // Apply ownership filter if provided
          ...(where ? [where] : []),
          {
            OR: [
              { name: { contains: query } },
              { email: { contains: query } },
              { phone: { contains: query } },
            ],
          },
        ],
      },
      take: 10,
      orderBy: { name: 'asc' }
    })
    console.log('Success!', res)
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
