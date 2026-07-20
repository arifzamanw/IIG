import { NextResponse } from 'next/server'
import { ProposalService } from '@/server/services/ProposalService'
import { cookies } from 'next/headers'
import { AuthService } from '@/server/services/AuthService'

async function getCurrentUserId() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) throw new Error('Unauthorized')
  
  const payload = await AuthService.verifyToken(token)
  if (!payload || !payload.sub) throw new Error('Signature verification failed or invalid token')
  
  return Number(payload.sub)
}

export async function GET() {
  try {
    const proposals = await ProposalService.getAll()
    return NextResponse.json(proposals)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const createdById = await getCurrentUserId()
    const body = await request.json()
    const proposal = await ProposalService.create({ ...body, createdById })
    return NextResponse.json(proposal, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
