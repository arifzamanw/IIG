import { NextResponse } from 'next/server'
import { CustomerService } from '@/server/services/CustomerService'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const customers = await CustomerService.search(q)
    return NextResponse.json(customers)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
