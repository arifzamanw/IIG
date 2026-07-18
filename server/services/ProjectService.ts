import { ProjectRepository } from '../repositories/ProjectRepository'
import { Prisma } from '@prisma/client'

export class ProjectService {
  static async getAllProjects() {
    return ProjectRepository.findAll()
  }

  static async getProject(id: number) {
    return ProjectRepository.findById(id)
  }

  static async createProject(data: Prisma.ProjectUncheckedCreateInput) {
    return ProjectRepository.create(data)
  }

  static async updateProject(id: number, data: Prisma.ProjectUncheckedUpdateInput) {
    return ProjectRepository.update(id, data)
  }

  static async deleteProject(id: number) {
    // Optional: Add logic to delete cover images from storage before deleting
    return ProjectRepository.delete(id)
  }
}
