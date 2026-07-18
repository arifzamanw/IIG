import { NextResponse } from 'next/server'
import { AmenityService } from '@/server/services/AmenityService'

export async function GET() {
  try {
    const amenities = await AmenityService.getAll()
    return NextResponse.json(amenities)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const amenity = await AmenityService.create(body)
    return NextResponse.json(amenity, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
