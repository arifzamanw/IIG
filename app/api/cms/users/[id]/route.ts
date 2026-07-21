import { checkPermission, AccessLevel } from '@/server/utils/permissions'
import { getCurrentUser } from '@/server/utils/auth'
import { NextResponse } from 'next/server'
import { UserService } from '@/server/services/UserService'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!checkPermission(user, 'Users', AccessLevel.EDIT)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const id = Number((await params).id)
    const { isActive } = await request.json()
    const updatedUser = await UserService.toggleActive(id, Boolean(isActive))
    return NextResponse.json(updatedUser)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!checkPermission(user, 'Users', AccessLevel.EDIT)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const id = Number((await params).id)
    await UserService.deleteUser(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
