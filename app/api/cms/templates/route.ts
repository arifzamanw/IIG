import { NextResponse } from 'next/server'
import { TemplateService } from '@/server/services/TemplateService'

export async function GET() {
  try {
    const templates = await TemplateService.getAll()
    return NextResponse.json(templates)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const template = await TemplateService.create(body)
    return NextResponse.json(template, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
