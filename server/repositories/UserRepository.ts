import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

export class UserRepository {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  }

  static async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: { role: { include: { permissions: true } } }
    })
  }

  static async findAll() {
    return prisma.user.findMany({
      select: {
        id: true, name: true, email: true, phone: true,
        isActive: true, createdAt: true, updatedAt: true,
        role: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  static async create(data: { name: string; email: string; password: string; phone?: string; roleId: number }) {
    const hashed = await bcrypt.hash(data.password, 10)
    return prisma.user.create({
      data: { ...data, password: hashed },
      select: { id: true, name: true, email: true, phone: true, isActive: true, createdAt: true, role: { select: { id: true, name: true } } }
    })
  }

  static async update(id: number, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data })
  }

  static async setActive(id: number, isActive: boolean) {
    return prisma.user.update({ where: { id }, data: { isActive } })
  }
}
