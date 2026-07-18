import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { AuthService } from '@/server/services/AuthService'
import { UserRepository } from '@/server/repositories/UserRepository'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await AuthService.verifyToken(token)
  if (!payload || !payload.sub) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const user = await UserRepository.findById(Number(payload.sub))
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  })
}
