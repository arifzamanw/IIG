const fs = require('fs')
const envContent = fs.readFileSync('.env', 'utf-8')
const dbUrlMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/)
if (dbUrlMatch) {
  process.env.DATABASE_URL = dbUrlMatch[1]
}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function test() {
  const customers = await prisma.customer.findMany({ take: 5 })
  console.log('Customers in DB:', customers.length)
  console.log(customers)
}
test().catch(console.error).finally(() => prisma.$disconnect())
