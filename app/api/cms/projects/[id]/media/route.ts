import { NextResponse } from 'next/server'
import { MediaService } from '@/server/services/MediaService'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const projectId = Number((await params).id)
    const media = await MediaService.getProjectMedia(projectId)
    return NextResponse.json(media)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const projectId = Number((await params).id)
    const body = await request.json()
    const media = await MediaService.create({ ...body, projectId })
    return NextResponse.json(media, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
