import { CustomerRepository } from '../repositories/CustomerRepository'
import { Prisma } from '@prisma/client'

export class CustomerService {
  static async getAll(where?: Prisma.CustomerWhereInput) {
    return CustomerRepository.findAll(where)
  }

  static async getById(id: number) {
    return CustomerRepository.findById(id)
  }

  static async search(query: string, where?: { assignedToId?: number }) {
    return CustomerRepository.search(query, where)
  }

  static async create(data: Prisma.CustomerCreateInput) {
    return CustomerRepository.create(data)
  }

  static async update(id: number, data: Prisma.CustomerUpdateInput) {
    return CustomerRepository.update(id, data)
  }

  static async delete(id: number) {
    return CustomerRepository.delete(id)
  }
}
