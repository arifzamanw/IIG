import { CustomerRepository } from './server/repositories/CustomerRepository'

async function run() {
  try {
    const res = await CustomerRepository.search('a')
    console.log('Result (undefined where):', res)
    const res2 = await CustomerRepository.search('a', { assignedToId: 1 })
    console.log('Result (with where):', res2)
  } catch (e) {
    console.error('Error:', e)
  }
}
run()
