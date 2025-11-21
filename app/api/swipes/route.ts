import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { ConnectionStatus, ConversationType, SwipeDirection, SwipeTargetType } from '@prisma/client'

const swipeSchema = z.object({
  targetType: z.nativeEnum(SwipeTargetType),
  targetId: z.string().min(1),
  direction: z.nativeEnum(SwipeDirection),
})

export async function POST(request: Request) {
  try {
    const viewer = await requireUser()
    const payload = await request.json()
    const input = swipeSchema.parse(payload)

    const swipe = await prisma.swipe.upsert({
      where: {
        userId_targetType_targetId: {
          userId: viewer.id,
          targetType: input.targetType,
          targetId: input.targetId,
        },
      },
      update: {
        direction: input.direction,
        createdAt: new Date(),
      },
      create: {
        userId: viewer.id,
        targetType: input.targetType,
        targetId: input.targetId,
        direction: input.direction,
      },
    })

    if (input.direction === SwipeDirection.PASS) {
      return NextResponse.json({ swipe, status: 'ok' })
    }

    if (input.targetType === SwipeTargetType.USER && input.direction === SwipeDirection.LIKE) {
      const result = await handleUserLike(viewer.id, input.targetId)
      return NextResponse.json({ swipe, ...result })
    }

    if (input.targetType === SwipeTargetType.EVENT && input.direction === SwipeDirection.LIKE) {
      const existing = await prisma.eventAttendee.findUnique({
        where: {
          eventId_userId: {
            eventId: input.targetId,
            userId: viewer.id,
          },
        },
      })

      if (!existing) {
        await prisma.$transaction([
          prisma.eventAttendee.create({
            data: {
              eventId: input.targetId,
              userId: viewer.id,
              status: 'GOING',
            },
          }),
          prisma.event.update({
            where: { id: input.targetId },
            data: {
              rsvpCount: {
                increment: 1,
              },
            },
          }),
        ])
      } else if (existing.status !== 'GOING') {
        await prisma.$transaction([
          prisma.eventAttendee.update({
            where: { id: existing.id },
            data: {
              status: 'GOING',
              rsvpAt: new Date(),
            },
          }),
          prisma.event.update({
            where: { id: input.targetId },
            data: {
              rsvpCount: {
                increment: 1,
              },
            },
          }),
        ])
      }

      return NextResponse.json({ swipe, status: 'event-rsvp' })
    }

    return NextResponse.json({ swipe, status: 'ok' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid swipe payload', details: error.flatten() }, { status: 422 })
    }
    console.error('[swipe] error', error)
    return NextResponse.json({ error: 'Unable to record swipe' }, { status: 500 })
  }
}

async function handleUserLike(userId: string, targetId: string) {
  const existingConnection = await prisma.connection.findFirst({
    where: {
      OR: [
        { userId, peerId: targetId },
        { userId: targetId, peerId: userId },
      ],
    },
  })

  if (!existingConnection) {
    const connection = await prisma.connection.create({
      data: {
        userId,
        peerId: targetId,
        status: ConnectionStatus.PENDING,
        lastInteractionAt: new Date(),
      },
    })
    await prisma.notification.create({
      data: {
        userId: targetId,
        type: 'MATCH',
        payload: {
          initiatorId: userId,
          status: 'PENDING',
        },
      },
    })
    return { status: 'pending', connectionId: connection.id }
  }

  if (existingConnection.status === ConnectionStatus.CONNECTED) {
    return {
      status: 'already-connected',
      connectionId: existingConnection.id,
      conversationId: existingConnection.conversationId,
    }
  }

  if (existingConnection.userId === userId) {
    // current user already initiated; still pending
    return { status: 'pending', connectionId: existingConnection.id }
  }

  const updates = await prisma.$transaction(async (tx) => {
    const updated = await tx.connection.update({
      where: { id: existingConnection.id },
      data: {
        status: ConnectionStatus.CONNECTED,
        lastInteractionAt: new Date(),
      },
    })

    let conversationId = updated.conversationId
    if (!conversationId) {
      const conversation = await tx.conversation.create({
        data: {
          type: ConversationType.DIRECT,
          participants: {
            create: [
              { userId },
              { userId: targetId },
            ],
          },
        },
      })
      conversationId = conversation.id
      await tx.connection.update({
        where: { id: updated.id },
        data: { conversationId },
      })
    }

    await tx.notification.create({
      data: {
        userId: targetId,
        type: 'MATCH',
        payload: {
          initiatorId: userId,
          status: 'CONNECTED',
          conversationId,
        },
      },
    })

    await tx.notification.create({
      data: {
        userId,
        type: 'MATCH',
        payload: {
          initiatorId: targetId,
          status: 'CONNECTED',
          conversationId,
        },
      },
    })

    return { updated, conversationId }
  })

  return {
    status: 'connected',
    connectionId: updates.updated.id,
    conversationId: updates.conversationId,
  }
}

