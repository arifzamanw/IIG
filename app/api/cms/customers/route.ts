import { NextResponse } from 'next/server'
import { CustomerService } from '@/server/services/CustomerService'

export async function GET() {
  try {
    const customers = await CustomerService.getAll()
    return NextResponse.json(customers)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const customer = await CustomerService.create(body)
    return NextResponse.json(customer, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
