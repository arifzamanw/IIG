import { NextResponse } from 'next/server'
import { DeveloperService } from '@/server/services/DeveloperService'

export async function GET() {
  try {
    const developers = await DeveloperService.getAllDevelopers()
    return NextResponse.json(developers)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const developer = await DeveloperService.createDeveloper(body)
    return NextResponse.json(developer, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
