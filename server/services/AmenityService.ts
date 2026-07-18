import { AmenityRepository } from '../repositories/AmenityRepository'
import { Prisma } from '@prisma/client'

export class AmenityService {
  static async getAll() {
    return AmenityRepository.findAll()
  }

  static async create(data: Prisma.AmenityCreateInput) {
    return AmenityRepository.create(data)
  }

  static async update(id: number, data: Prisma.AmenityUpdateInput) {
    return AmenityRepository.update(id, data)
  }

  static async delete(id: number) {
    return AmenityRepository.delete(id)
  }

  static async setProjectAmenities(projectId: number, amenityIds: number[]) {
    return AmenityRepository.setProjectAmenities(projectId, amenityIds)
  }

  static async getProjectAmenities(projectId: number) {
    return AmenityRepository.findByProject(projectId)
  }
}
