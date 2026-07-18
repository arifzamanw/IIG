import { NextResponse } from 'next/server'
import { DeveloperService } from '@/server/services/DeveloperService'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = Number((await params).id)
    const developer = await DeveloperService.getDeveloper(id)
    if (!developer) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(developer)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = Number((await params).id)
    const body = await request.json()
    const developer = await DeveloperService.updateDeveloper(id, body)
    return NextResponse.json(developer)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = Number((await params).id)
    await DeveloperService.deleteDeveloper(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
