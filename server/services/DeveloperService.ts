import { DeveloperRepository } from '../repositories/DeveloperRepository'
import { Prisma } from '@prisma/client'

export class DeveloperService {
  static async getAllDevelopers() {
    return DeveloperRepository.findAll()
  }

  static async getDeveloper(id: number) {
    return DeveloperRepository.findById(id)
  }

  static async createDeveloper(data: Prisma.DeveloperCreateInput) {
    return DeveloperRepository.create(data)
  }

  static async updateDeveloper(id: number, data: Prisma.DeveloperUpdateInput) {
    return DeveloperRepository.update(id, data)
  }

  static async deleteDeveloper(id: number) {
    // Optional: Add logic to delete logo files from storage before deleting the record
    return DeveloperRepository.delete(id)
  }
}
