import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

const joinSchema = z
  .object({
    inviteCode: z.string().min(4).max(12).optional(),
  })
  .optional()

export async function POST(request: Request, { params }: { params: { roomId: string } }) {
  try {
    const viewer = await requireUser()
    const body = await request.json().catch(() => ({}))
    const input = joinSchema.parse(body)

    const room = await prisma.room.findUnique({
      where: { id: params.roomId },
      include: {
        members: {
          where: { leftAt: null },
          select: { userId: true },
        },
      },
    })

    if (!room || !room.active) {
      return NextResponse.json({ error: 'Room is no longer active' }, { status: 404 })
    }

    if (room.access === 'invite' && room.inviteCode && input?.inviteCode !== room.inviteCode) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 403 })
    }

    if (room.maxCapacity && room.members.length >= room.maxCapacity) {
      return NextResponse.json({ error: 'Room is full' }, { status: 409 })
    }

    const isMember = room.members.some((member) => member.userId === viewer.id)
    if (isMember) {
      return NextResponse.json({ status: 'already-joined' })
    }

    const membership = await prisma.roomMember.create({
      data: {
        roomId: room.id,
        userId: viewer.id,
      },
      include: {
        room: true,
      },
    })

    await prisma.user.update({
      where: { id: viewer.id },
      data: {
        joinedRoomsCount: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({ status: 'joined', membership })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payload', details: error.flatten() }, { status: 422 })
    }
    console.error('[rooms] join error', error)
    return NextResponse.json({ error: 'Unable to join room' }, { status: 500 })
  }
}

