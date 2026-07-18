import { NextResponse } from 'next/server'
import { UnitService } from '@/server/services/UnitService'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const projectId = Number((await params).id)
    const units = await UnitService.getProjectUnits(projectId)
    return NextResponse.json(units)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
