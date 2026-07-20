import { prisma } from './lib/prisma'

async function main() {
  const units = await prisma.unit.findMany()
  console.log('UNITS:', units)
  process.exit(0)
}
main()
