import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export class CustomerRepository {
  static async findAll() {
    return prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { proposals: true } } }
    })
  }

  static async findById(id: number) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        proposals: {
          orderBy: { createdAt: 'desc' },
          include: { createdBy: { select: { name: true } } }
        }
      }
    })
  }

  static async search(query: string) {
    return prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } },
          { phone: { contains: query } },
        ]
      },
      take: 10,
      orderBy: { name: 'asc' }
    })
  }

  static async create(data: Prisma.CustomerCreateInput) {
    return prisma.customer.create({ data })
  }

  static async update(id: number, data: Prisma.CustomerUpdateInput) {
    return prisma.customer.update({ where: { id }, data })
  }

  static async delete(id: number) {
    return prisma.customer.delete({ where: { id } })
  }
}
