import { NextResponse } from 'next/server'
import { PaymentPlanService } from '@/server/services/PaymentPlanService'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const projectId = Number((await params).id)
    const plans = await PaymentPlanService.getProjectPlans(projectId)
    return NextResponse.json(plans)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const projectId = Number((await params).id)
    const body = await request.json()
    const plan = await PaymentPlanService.create({ ...body, projectId })
    return NextResponse.json(plan, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
