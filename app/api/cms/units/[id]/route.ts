import { NextResponse } from 'next/server'
import { UnitService } from '@/server/services/UnitService'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = Number((await params).id)
    const unit = await UnitService.getUnit(id)
    if (!unit) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(unit)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = Number((await params).id)
    const body = await request.json()
    
    // Parse numeric fields
    if (body.bedrooms) body.bedrooms = Number(body.bedrooms)
    if (body.bathrooms) body.bathrooms = Number(body.bathrooms)
    if (body.size) body.size = Number(body.size)
    if (body.price) body.price = Number(body.price)
    if (body.projectId) body.projectId = Number(body.projectId)

    const unit = await UnitService.updateUnit(id, body)
    return NextResponse.json(unit)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = Number((await params).id)
    await UnitService.deleteUnit(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
