import { NextResponse } from 'next/server'
import { MediaService } from '@/server/services/MediaService'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = Number((await params).id)
    const media = await prisma.media.findUnique({ where: { id } })
    await MediaService.delete(id, media?.url)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
