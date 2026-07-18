import { NextResponse } from 'next/server'
import { UnitService } from '@/server/services/UnitService'

export async function POST(request: Request) {
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
