import { checkPermission, AccessLevel } from '@/server/utils/permissions'
import { getCurrentUser } from '@/server/utils/auth'
import { NextResponse } from 'next/server'
import { UnitService } from '@/server/services/UnitService'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!checkPermission(user, 'Units', AccessLevel.EDIT)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    // Parse numeric fields
    if (body.bedrooms) body.bedrooms = Number(body.bedrooms)
    if (body.bathrooms) body.bathrooms = Number(body.bathrooms)
    if (body.size) body.size = Number(body.size)
    if (body.price) body.price = Number(body.price)
    if (body.projectId) body.projectId = Number(body.projectId)
    
    const unit = await UnitService.createUnit(body)
    return NextResponse.json(unit, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
