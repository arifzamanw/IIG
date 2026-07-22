import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export class CustomerRepository {
  static async findAll(where?: Prisma.CustomerWhereInput) {
    return prisma.customer.findMany({
      where,
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

  static async search(query: string, where?: { assignedToId?: number }) {
    const trimmed = (query || '').trim()
    const searchPattern = `%${trimmed}%`
    const assignedId = where?.assignedToId

    if (trimmed === '') {
      if (assignedId !== undefined) {
        return prisma.$queryRaw`
          SELECT id, name, email, phone, nationality, source, notes, assignedToId, createdAt, updatedAt
          FROM Customer
          WHERE assignedToId = ${assignedId}
          ORDER BY createdAt DESC
          LIMIT 20
        ` as Promise<any[]>
      }
      return prisma.$queryRaw`
        SELECT id, name, email, phone, nationality, source, notes, assignedToId, createdAt, updatedAt
        FROM Customer
        ORDER BY createdAt DESC
        LIMIT 20
      ` as Promise<any[]>
    }

    if (assignedId !== undefined) {
      return prisma.$queryRaw`
        SELECT id, name, email, phone, nationality, source, notes, assignedToId, createdAt, updatedAt
        FROM Customer
        WHERE (name LIKE ${searchPattern} OR email LIKE ${searchPattern} OR phone LIKE ${searchPattern})
          AND assignedToId = ${assignedId}
        ORDER BY name ASC
        LIMIT 20
      ` as Promise<any[]>
    }

    return prisma.$queryRaw`
      SELECT id, name, email, phone, nationality, source, notes, assignedToId, createdAt, updatedAt
      FROM Customer
      WHERE (name LIKE ${searchPattern} OR email LIKE ${searchPattern} OR phone LIKE ${searchPattern})
      ORDER BY name ASC
      LIMIT 20
    ` as Promise<any[]>
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
