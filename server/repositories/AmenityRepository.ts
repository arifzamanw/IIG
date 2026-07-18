import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export class AmenityRepository {
  static async findAll() {
    return prisma.amenity.findMany({ orderBy: { name: 'asc' } })
  }

  static async findById(id: number) {
    return prisma.amenity.findUnique({ where: { id } })
  }

  static async create(data: Prisma.AmenityCreateInput) {
    return prisma.amenity.create({ data })
  }

  static async update(id: number, data: Prisma.AmenityUpdateInput) {
    return prisma.amenity.update({ where: { id }, data })
  }

  static async delete(id: number) {
    return prisma.amenity.delete({ where: { id } })
  }

  // Link amenities to a project
  static async setProjectAmenities(projectId: number, amenityIds: number[]) {
    // Delete all existing links first
    await prisma.projectAmenity.deleteMany({ where: { projectId } })
    // Re-create with new selection
    if (amenityIds.length > 0) {
      await prisma.projectAmenity.createMany({
        data: amenityIds.map(amenityId => ({ projectId, amenityId }))
      })
    }
  }

  static async findByProject(projectId: number) {
    return prisma.projectAmenity.findMany({
      where: { projectId },
      include: { amenity: true }
    })
  }
}
