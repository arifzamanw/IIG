import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export class DeveloperRepository {
  static async findAll() {
    return prisma.developer.findMany({
      orderBy: { createdAt: 'desc' }
    })
  }

  static async findById(id: number) {
    return prisma.developer.findUnique({
      where: { id },
      include: { projects: true }
    })
  }

  static async create(data: Prisma.DeveloperCreateInput) {
    return prisma.developer.create({ data })
  }

  static async update(id: number, data: Prisma.DeveloperUpdateInput) {
    return prisma.developer.update({ where: { id }, data })
  }

  static async delete(id: number) {
    return prisma.developer.delete({ where: { id } })
  }
}
