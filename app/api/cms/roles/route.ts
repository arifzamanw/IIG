import { checkPermission, AccessLevel } from '@/server/utils/permissions'
import { getCurrentUser } from '@/server/utils/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!checkPermission(user, 'Settings', AccessLevel.VIEW)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const roles = await prisma.role.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json(roles)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
