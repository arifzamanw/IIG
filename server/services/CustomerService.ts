import { CustomerRepository } from '../repositories/CustomerRepository'
import { Prisma } from '@prisma/client'

export class CustomerService {
  static async getAll() {
    return CustomerRepository.findAll()
  }

  static async getById(id: number) {
    return CustomerRepository.findById(id)
  }

  static async search(query: string) {
    return CustomerRepository.search(query)
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
