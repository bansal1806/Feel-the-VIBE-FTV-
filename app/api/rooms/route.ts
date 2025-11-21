import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { haversineDistanceKm, formatDistance } from '@/lib/utils/geo'
import { scheduleRoomExpiryJob } from '@/lib/jobs/enqueue'

const createRoomSchema = z
  .object({
    name: z.string().min(3).max(80),
    description: z.string().max(300).optional().nullable(),
    location: z.string().min(2).max(160),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    type: z.enum(['STUDY', 'EVENT', 'SOCIAL']),
    durationMinutes: z.number().min(10).max(720),
    maxCapacity: z.number().min(2).max(200).optional().nullable(),
    tags: z.array(z.string().trim().min(1).max(32)).max(12).optional(),
    access: z.enum(['public', 'invite', 'campus']).default('public'),
  })
  .strict()

export async function GET() {
  try {
    const viewer = await requireUser()
    const rooms = await prisma.room.findMany({
      where: {
        active: true,
        OR: [{ campusId: viewer.campusId ?? undefined }, { campusId: null }],
      },
      include: {
        campus: true,
        members: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                alias: true,
                avatarUrl: true,
                major: true,
                year: true,
                interests: true,
              },
            },
          },
        },
      },
      orderBy: [{ expiresAt: 'asc' }],
      take: 30,
    })

    const payload = rooms.map((room) => {
      const viewerLocation =
        viewer.latitude != null && viewer.longitude != null
          ? { latitude: viewer.latitude, longitude: viewer.longitude }
          : null
      const distance =
        viewerLocation != null
          ? formatDistance(
              haversineDistanceKm(viewerLocation, { latitude: room.latitude, longitude: room.longitude }),
            )
          : null

      return {
        id: room.id,
        name: room.name,
        description: room.description,
        location: room.location,
        latitude: room.latitude,
        longitude: room.longitude,
        type: room.type,
        expiresAt: room.expiresAt.toISOString(),
        active: room.active,
        access: room.access,
        inviteCode: room.inviteCode,
        maxCapacity: room.maxCapacity,
        tags: room.tags,
        distance,
        campusName: room.campus?.name ?? null,
        isMember: room.members.some((member) => member.userId === viewer.id),
        participantCount: room.members.length,
        members: room.members.map((member) => ({
          id: member.user.id,
          alias: member.user.alias,
          avatarUrl: member.user.avatarUrl,
          major: member.user.major,
          year: member.user.year,
          interests: member.user.interests,
        })),
      }
    })

    return NextResponse.json({ rooms: payload })
  } catch (error) {
    console.error('[rooms] failed to list rooms', error)
    return NextResponse.json({ error: 'Failed to load rooms' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const viewer = await requireUser()
    const body = await request.json()
    const input = createRoomSchema.parse(body)

    const expiresAt = new Date(Date.now() + input.durationMinutes * 60 * 1000)

    const room = await prisma.$transaction(async (tx) => {
      const created = await tx.room.create({
        data: {
          name: input.name,
          description: input.description ?? null,
          location: input.location,
          latitude: input.latitude,
          longitude: input.longitude,
          type: input.type,
          expiresAt,
          creatorId: viewer.id,
          campusId: viewer.campusId,
          maxCapacity: input.maxCapacity ?? null,
          tags: input.tags ?? [],
          access: input.access,
          inviteCode: input.access === 'invite' ? generateInviteCode() : null,
        },
      })

      await tx.roomMember.create({
        data: {
          roomId: created.id,
          userId: viewer.id,
        },
      })

      await tx.user.update({
        where: { id: viewer.id },
        data: { createdRoomsCount: { increment: 1 } },
      })

      return created
    })

    try {
      await scheduleRoomExpiryJob({
        roomId: room.id,
        expiresAt: room.expiresAt.toISOString(),
      })
    } catch (jobError) {
      console.warn('[rooms] failed to schedule expiry job', jobError)
    }

    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid room payload', details: error.flatten() }, { status: 422 })
    }
    console.error('[rooms] failed to create room', error)
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
}

function generateInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

