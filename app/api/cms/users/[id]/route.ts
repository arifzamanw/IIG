import { NextResponse } from 'next/server'
import { UserService } from '@/server/services/UserService'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = Number((await params).id)
    const { isActive } = await request.json()
    const user = await UserService.toggleActive(id, Boolean(isActive))
    return NextResponse.json(user)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
