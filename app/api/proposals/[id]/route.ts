import { NextResponse } from 'next/server'
import { ProposalService } from '@/server/services/ProposalService'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = Number((await params).id)
    const proposal = await ProposalService.getById(id)
    if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(proposal)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = Number((await params).id)
    const body = await request.json()

    // If only status is passed, do a simple status update
    if (Object.keys(body).length === 1 && body.status) {
      const proposal = await ProposalService.updateStatus(id, body.status)
      return NextResponse.json(proposal)
    }

    // Full edit update — update editable fields and rebuild snapshot with new tower/condition/paymentPlan
    const proposal = await ProposalService.update(id, body)
    return NextResponse.json(proposal)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = Number((await params).id)
    await ProposalService.delete(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
