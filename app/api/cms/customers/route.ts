import { checkPermission, AccessLevel } from '@/server/utils/permissions'
import { NextResponse } from 'next/server'
import { CustomerService } from '@/server/services/CustomerService'
import { getCurrentUser } from '@/server/utils/auth'
import { isRestricted } from '@/server/utils/roles'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const where = isRestricted(user) ? { assignedToId: user.id } : {}
    const customers = await CustomerService.getAll(where)
    return NextResponse.json(customers)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    // if sales team creates a customer, auto-assign to them
    if (user.role.name === 'Sales') {
      body.assignedToId = user.id
    }

    const customer = await CustomerService.create(body)
    return NextResponse.json(customer, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
