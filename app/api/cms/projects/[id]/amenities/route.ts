import { NextResponse } from 'next/server'
import { AmenityService } from '@/server/services/AmenityService'

// GET project amenities
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const projectId = Number((await params).id)
    const amenities = await AmenityService.getProjectAmenities(projectId)
    return NextResponse.json(amenities)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT replaces all project amenities with a new set
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const projectId = Number((await params).id)
    const { amenityIds } = await request.json()
    await AmenityService.setProjectAmenities(projectId, amenityIds)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
