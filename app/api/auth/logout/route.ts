import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { AuthService } from '@/server/services/AuthService'

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (token) {
    await AuthService.logout(token)
    cookieStore.delete('auth_token')
  }

  return NextResponse.json({ success: true })
}
