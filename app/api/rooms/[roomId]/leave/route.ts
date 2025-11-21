import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

export async function POST(_: Request, { params }: { params: { roomId: string } }) {
  try {
    const viewer = await requireUser()

    const membership = await prisma.roomMember.findFirst({
      where: {
        roomId: params.roomId,
        userId: viewer.id,
        leftAt: null,
      },
    })

    if (!membership) {
      return NextResponse.json({ status: 'not-member' })
    }

    await prisma.roomMember.update({
      where: { id: membership.id },
      data: {
        leftAt: new Date(),
      },
    })

    return NextResponse.json({ status: 'left' })
  } catch (error) {
    console.error('[rooms] leave error', error)
    return NextResponse.json({ error: 'Unable to leave room' }, { status: 500 })
  }
}

