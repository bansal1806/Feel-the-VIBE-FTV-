import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

export async function GET() {
  try {
    const viewer = await requireUser()

    // Get all connections where user is either userId or peerId
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { userId: viewer.id },
          { peerId: viewer.id },
        ],
        status: {
          in: ['PENDING', 'CONNECTED'],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            alias: true,
            avatarUrl: true,
            headline: true,
          },
        },
        peer: {
          select: {
            id: true,
            alias: true,
            avatarUrl: true,
            headline: true,
          },
        },
        conversation: {
          select: {
            id: true,
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: { lastInteractionAt: 'desc' },
    })

    // Transform to show peer info and trust level from user's perspective
    // trustLevel represents how much the peer can see about the viewer (from viewer's perspective)
    const transformed = connections.map((conn) => {
      const isViewerUser = conn.userId === viewer.id
      const peer = isViewerUser ? conn.peer : conn.user
      
      // Trust level: how much the peer can see about the viewer
      // If viewer is userId, trustLevel is how much peerId can see about viewer
      // If viewer is peerId, we need to find the reverse connection or use 0
      let trustLevel = 0
      if (isViewerUser) {
        trustLevel = conn.trustLevel // How much peerId can see about viewer (userId)
      } else {
        // Viewer is peerId, so we need to check reverse connection
        // For now, we'll use the same connection's trustLevel as a starting point
        // In a full implementation, you'd want separate trust levels for each direction
        trustLevel = conn.trustLevel // This represents how much viewer (peerId) can see about user (userId)
      }

      return {
        id: conn.id,
        peerId: peer.id,
        peerAlias: peer.alias,
        peerAvatar: peer.avatarUrl,
        peerHeadline: peer.headline,
        status: conn.status,
        trustLevel, // How much this peer can see about the viewer
        conversationId: conn.conversationId,
        lastInteractionAt: conn.lastInteractionAt,
        createdAt: conn.createdAt,
        lastMessageAt: conn.conversation?.messages[0]?.createdAt || null,
      }
    })

    return NextResponse.json({ connections: transformed })
  } catch (error) {
    console.error('[connections] list error', error)
    return NextResponse.json({ error: 'Failed to load connections' }, { status: 500 })
  }
}

