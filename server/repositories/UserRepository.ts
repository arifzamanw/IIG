import { prisma } from '@/lib/prisma'
import { User, Prisma } from '@prisma/client'

export class UserRepository {
  static async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } })
  }

  static async findById(id: number) {
    return prisma.user.findUnique({ 
      where: { id },
      include: { role: { include: { permissions: true } } }
    })
  }

  static async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data })
  }
}
