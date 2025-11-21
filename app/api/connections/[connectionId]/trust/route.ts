import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

const updateTrustSchema = z.object({
  trustLevel: z.number().min(0).max(100),
})

export async function GET(_: Request, { params }: { params: { connectionId: string } }) {
  try {
    const viewer = await requireUser()

    const connection = await prisma.connection.findFirst({
      where: {
        id: params.connectionId,
        OR: [
          { userId: viewer.id },
          { peerId: viewer.id },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            alias: true,
          },
        },
        peer: {
          select: {
            id: true,
            alias: true,
          },
        },
      },
    })

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    // Trust level from user's perspective
    const isUser = connection.userId === viewer.id
    const trustLevel = connection.trustLevel

    return NextResponse.json({
      connectionId: connection.id,
      trustLevel,
      peer: isUser ? connection.peer : connection.user,
    })
  } catch (error) {
    console.error('[trust] get error', error)
    return NextResponse.json({ error: 'Failed to load trust level' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { connectionId: string } }) {
  try {
    const viewer = await requireUser()
    const body = await request.json()
    const input = updateTrustSchema.parse(body)

    const connection = await prisma.connection.findFirst({
      where: {
        id: params.connectionId,
        OR: [
          { userId: viewer.id },
          { peerId: viewer.id },
        ],
      },
    })

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    const updated = await prisma.connection.update({
      where: { id: connection.id },
      data: {
        trustLevel: Math.min(100, Math.max(0, input.trustLevel)),
        lastInteractionAt: new Date(),
      },
    })

    return NextResponse.json({
      connectionId: updated.id,
      trustLevel: updated.trustLevel,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid trust level', details: error.flatten() }, { status: 422 })
    }
    console.error('[trust] update error', error)
    return NextResponse.json({ error: 'Failed to update trust level' }, { status: 500 })
  }
}

