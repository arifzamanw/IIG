import { checkPermission, AccessLevel } from '@/server/utils/permissions'
import { getCurrentUser } from '@/server/utils/auth'
import { NextResponse } from 'next/server'
import { UserService } from '@/server/services/UserService'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  if (!checkPermission(user, 'Users', AccessLevel.EDIT)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const id = Number((await params).id)
    const { newPassword } = await request.json()

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    await UserService.updatePassword(id, newPassword)
    return NextResponse.json({ success: true, message: 'User password updated successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update user password' }, { status: 500 })
  }
}
