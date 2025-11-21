import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { ConversationType } from '@prisma/client'

const createConversationSchema = z.object({
  peerId: z.string().cuid(),
})

export async function GET() {
  try {
    const viewer = await requireUser()
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: viewer.id },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                alias: true,
                avatarUrl: true,
                headline: true,
                major: true,
                year: true,
              },
            },
          },
        },
        messages: {
          take: 30,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                alias: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: [{ updatedAt: 'desc' }],
      take: 25,
    })

    return NextResponse.json({
      conversations: conversations.map((conversation) => ({
        id: conversation.id,
        type: conversation.type,
        participants: conversation.participants.map((participant) => ({
          id: participant.user.id,
          alias: participant.user.alias,
          avatarUrl: participant.user.avatarUrl,
          headline: participant.user.headline,
          major: participant.user.major,
          year: participant.user.year,
        })),
        messages: conversation.messages
          .slice()
          .reverse()
          .map((message) => ({
            id: message.id,
            content: message.content,
            mediaUrl: message.mediaUrl,
            createdAt: message.createdAt,
            sender: message.sender,
          })),
      })),
    })
  } catch (error) {
    console.error('[conversations] list error', error)
    return NextResponse.json({ error: 'Failed to load conversations' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const viewer = await requireUser()
    const body = await request.json()
    const input = createConversationSchema.parse(body)

    const conversation = await prisma.conversation.findFirst({
      where: {
        type: ConversationType.DIRECT,
        participants: {
          every: {
            userId: {
              in: [viewer.id, input.peerId],
            },
          },
        },
      },
      include: {
        participants: true,
      },
    })

    if (conversation) {
      return NextResponse.json({ conversationId: conversation.id, status: 'existing' })
    }

    const created = await prisma.conversation.create({
      data: {
        type: ConversationType.DIRECT,
        participants: {
          create: [{ userId: viewer.id }, { userId: input.peerId }],
        },
      },
    })

    return NextResponse.json({ conversationId: created.id, status: 'created' }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payload', details: error.flatten() }, { status: 422 })
    }
    console.error('[conversations] create error', error)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}

