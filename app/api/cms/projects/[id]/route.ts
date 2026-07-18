import { NextResponse } from 'next/server'
import { ProjectService } from '@/server/services/ProjectService'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = Number((await params).id)
    const project = await ProjectService.getProject(id)
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(project)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = Number((await params).id)
    const body = await request.json()
    if (body.completionDate) {
      body.completionDate = new Date(body.completionDate)
    }
    const project = await ProjectService.updateProject(id, body)
    return NextResponse.json(project)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = Number((await params).id)
    await ProjectService.deleteProject(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
