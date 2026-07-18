import { PaymentPlanRepository } from '../repositories/PaymentPlanRepository'
import { Prisma } from '@prisma/client'

export class PaymentPlanService {
  static async getProjectPlans(projectId: number) {
    return PaymentPlanRepository.findByProject(projectId)
  }

  static async create(data: Prisma.PaymentPlanUncheckedCreateInput) {
    return PaymentPlanRepository.create(data)
  }

  static async update(id: number, data: Prisma.PaymentPlanUncheckedUpdateInput) {
    return PaymentPlanRepository.update(id, data)
  }

  static async delete(id: number) {
    return PaymentPlanRepository.delete(id)
  }
}
