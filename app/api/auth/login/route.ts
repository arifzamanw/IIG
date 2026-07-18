import { NextResponse } from 'next/server'
import { AuthService } from '@/server/services/AuthService'
import { z } from 'zod'
import { cookies } from 'next/headers'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = loginSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { email, password } = result.data

    const { token, user } = await AuthService.login(email, password)

    // Set HttpOnly cookie
    const cookieStore = await cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 2 * 60 * 60 // 2 hours
    })

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, email: user.email, name: user.name, roleId: user.roleId } 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 401 })
  }
}
