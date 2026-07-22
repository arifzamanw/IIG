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
      include: { 
        role: { include: { permissions: true } },
        moduleAccess: true
      }
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

  static async updatePassword(id: number, newPassword: string) {
    const hashed = await bcrypt.hash(newPassword, 10)
    return prisma.user.update({ where: { id }, data: { password: hashed } })
  }

  static async setActive(id: number, isActive: boolean) {
    return prisma.user.update({ where: { id }, data: { isActive } })
  }

  static async delete(id: number) {
    return prisma.user.delete({ where: { id } })
  }

  static async updateModuleAccess(userId: number, overrides: { moduleName: string, accessLevel: 'VIEW' | 'EDIT' | 'RESTRICTED' }[]) {
    // We could use an interactive transaction to delete all overrides and recreate, or upsert.
    // Easiest is to delete all existing overrides for this user, then insert the new ones.
    return prisma.$transaction(async (tx) => {
      await tx.userModuleAccess.deleteMany({ where: { userId } })
      if (overrides.length > 0) {
        await tx.userModuleAccess.createMany({
          data: overrides.map(o => ({
            userId,
            moduleName: o.moduleName,
            accessLevel: o.accessLevel
          }))
        })
      }
    })
  }
}
