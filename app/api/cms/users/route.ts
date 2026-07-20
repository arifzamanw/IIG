import { NextResponse } from 'next/server'
import { UserService } from '@/server/services/UserService'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const users = await UserService.getAllUsers()
    return NextResponse.json(users)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, phone, roleId } = body
    if (!name || !email || !password || !roleId) {
      return NextResponse.json({ error: 'name, email, password, and roleId are required' }, { status: 400 })
    }
    const user = await UserService.createUser({ name, email, password, phone, roleId: Number(roleId) })
    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
