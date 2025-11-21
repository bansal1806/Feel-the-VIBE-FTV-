import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  mediaUrl: z.string().url().optional().nullable(),
  replyToId: z.string().cuid().optional(),
})

export async function GET(_: Request, { params }: { params: { conversationId: string } }) {
  try {
    const viewer = await requireUser()
    const hasAccess = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: params.conversationId,
        userId: viewer.id,
      },
    })

    if (!hasAccess) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: params.conversationId,
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            alias: true,
            avatarUrl: true,
          },
        },
      },
      take: 100,
    })

    return NextResponse.json({
      messages: messages.map((message) => ({
        id: message.id,
        content: message.content,
        mediaUrl: message.mediaUrl,
        createdAt: message.createdAt,
        sender: message.sender,
      })),
    })
  } catch (error) {
    console.error('[messages] list error', error)
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { conversationId: string } }) {
  try {
    const viewer = await requireUser()
    const body = await request.json()
    const input = sendMessageSchema.parse(body)

    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: params.conversationId,
        userId: viewer.id,
      },
    })

    if (!participant) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const message = await prisma.message.create({
      data: {
        conversationId: params.conversationId,
        senderId: viewer.id,
        content: input.content,
        mediaUrl: input.mediaUrl ?? null,
      },
      include: {
        sender: {
          select: {
            id: true,
            alias: true,
            avatarUrl: true,
          },
        },
      },
    })

    await prisma.conversation.update({
      where: { id: params.conversationId },
      data: { updatedAt: new Date() },
    })

    // Update trust level based on message count
    const connection = await prisma.connection.findFirst({
      where: {
        conversationId: params.conversationId,
      },
      include: {
        conversation: {
          include: {
            messages: {
              select: { id: true },
            },
          },
        },
      },
    })

    if (connection) {
      const messageCount = connection.conversation?.messages.length || 0
      // Trust progression: 0% -> 25% (Stage 1) -> 50% (Stage 2) -> 75% (Stage 3) -> 100% (Stage 4)
      // Increment trust based on meaningful interactions
      let newTrustLevel = connection.trustLevel
      
      if (messageCount >= 1 && connection.trustLevel < 25) {
        newTrustLevel = 25 // Stage 1: First message unlocks alias chat
      } else if (messageCount >= 5 && connection.trustLevel < 50) {
        newTrustLevel = 50 // Stage 2: Portfolio snapshots unlock
      } else if (messageCount >= 15 && connection.trustLevel < 75) {
        newTrustLevel = 75 // Stage 3: Academic details reveal
      } else if (messageCount >= 30 && connection.trustLevel < 100) {
        newTrustLevel = 100 // Stage 4: Full professional unlock
      }

      if (newTrustLevel !== connection.trustLevel) {
        await prisma.connection.update({
          where: { id: connection.id },
          data: {
            trustLevel: newTrustLevel,
            lastInteractionAt: new Date(),
          },
        })
      } else {
        // Still update lastInteractionAt even if trust doesn't change
        await prisma.connection.update({
          where: { id: connection.id },
          data: {
            lastInteractionAt: new Date(),
          },
        })
      }
    }

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid message payload', details: error.flatten() }, { status: 422 })
    }
    console.error('[messages] create error', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

