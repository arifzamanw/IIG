import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export class TemplateService {
  static async getAll() {
    return prisma.proposalTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    })
  }

  static async getById(id: number) {
    return prisma.proposalTemplate.findUnique({
      where: { id }
    })
  }

  static async create(data: Prisma.ProposalTemplateCreateInput) {
    if (data.isDefault) {
      await prisma.proposalTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      })
    }
    return prisma.proposalTemplate.create({ data })
  }

  static async update(id: number, data: Prisma.ProposalTemplateUpdateInput) {
    if (data.isDefault) {
      await prisma.proposalTemplate.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false }
      })
    }
    return prisma.proposalTemplate.update({
      where: { id },
      data
    })
  }

  static async delete(id: number) {
    return prisma.proposalTemplate.delete({
      where: { id }
    })
  }
}
