import { UnitRepository } from '../repositories/UnitRepository'
import { Prisma } from '@prisma/client'

export class UnitService {
  static async getProjectUnits(projectId: number) {
    return UnitRepository.findAllByProjectId(projectId)
  }

  static async getUnit(id: number) {
    return UnitRepository.findById(id)
  }

  static async createUnit(data: Prisma.UnitUncheckedCreateInput) {
    return UnitRepository.create(data)
  }

  static async updateUnit(id: number, data: Prisma.UnitUncheckedUpdateInput) {
    return UnitRepository.update(id, data)
  }

  static async deleteUnit(id: number) {
    return UnitRepository.delete(id)
  }
}
