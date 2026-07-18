import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: { name: 'Super Admin' }
  })

  const marketingRole = await prisma.role.upsert({
    where: { name: 'Marketing' },
    update: {},
    create: { name: 'Marketing' }
  })

  const salesRole = await prisma.role.upsert({
    where: { name: 'Sales' },
    update: {},
    create: { name: 'Sales' }
  })

  const password = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@investgeorgia.com' },
    update: {},
    create: {
      email: 'admin@investgeorgia.com',
      name: 'Super Admin',
      password,
      roleId: adminRole.id
    }
  })

  console.log('Database Seeded:')
  console.log({ admin })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
