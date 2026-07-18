import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export class PaymentPlanRepository {
  static async findByProject(projectId: number) {
    return prisma.paymentPlan.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' }
    })
  }

  static async findById(id: number) {
    return prisma.paymentPlan.findUnique({ where: { id } })
  }

  static async create(data: Prisma.PaymentPlanUncheckedCreateInput) {
    return prisma.paymentPlan.create({ data })
  }

  static async update(id: number, data: Prisma.PaymentPlanUncheckedUpdateInput) {
    return prisma.paymentPlan.update({ where: { id }, data })
  }

  static async delete(id: number) {
    return prisma.paymentPlan.delete({ where: { id } })
  }
}
