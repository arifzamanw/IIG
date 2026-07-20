import { UserRepository } from '../repositories/UserRepository'

export class UserService {
  static async getAllUsers() {
    return UserRepository.findAll()
  }

  static async createUser(data: { name: string; email: string; password: string; phone?: string; roleId: number }) {
    return UserRepository.create(data)
  }

  static async toggleActive(id: number, isActive: boolean) {
    return UserRepository.setActive(id, isActive)
  }
}
