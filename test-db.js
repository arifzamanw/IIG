const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({ include: { role: true }})
  console.log('Users:', users.map(u => ({ id: u.id, email: u.email, role: u.role.name })))

  const customers = await prisma.customer.findMany()
  console.log('Customers:', customers.map(c => ({ id: c.id, name: c.name, assignedToId: c.assignedToId })))
}
main()
