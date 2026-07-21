import { checkPermission, AccessLevel } from '@/server/utils/permissions'
import { getCurrentUser } from '@/server/utils/auth'
import { NextResponse } from 'next/server'
import { UnitService } from '@/server/services/UnitService'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!checkPermission(user, 'Projects', AccessLevel.VIEW)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const projectId = Number((await params).id)
    const units = await UnitService.getProjectUnits(projectId)
    return NextResponse.json(units)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
