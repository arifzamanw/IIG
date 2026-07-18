import { MediaRepository } from '../repositories/MediaRepository'
import { Prisma } from '@prisma/client'
import path from 'path'
import fs from 'fs'

export class MediaService {
  static async getProjectMedia(projectId: number) {
    return MediaRepository.findByProject(projectId)
  }

  static async create(data: Prisma.MediaUncheckedCreateInput) {
    return MediaRepository.create(data)
  }

  static async delete(id: number, url?: string) {
    // Delete physical file if it's a local upload
    if (url && url.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', url)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }
    return MediaRepository.delete(id)
  }
}
