import { NextResponse } from 'next/server'
import { ProjectService } from '@/server/services/ProjectService'

export async function GET() {
  try {
    const projects = await ProjectService.getAllProjects()
    return NextResponse.json(projects)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Convert date strings to Date objects if necessary
    if (body.completionDate) {
      body.completionDate = new Date(body.completionDate)
    }
    const project = await ProjectService.createProject(body)
    return NextResponse.json(project, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
