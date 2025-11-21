import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

const visibilityOptions = ['everyone', 'campus', 'connections'] as const
const messageOptions = ['everyone', 'campus', 'connections'] as const

const updateProfileSchema = z
  .object({
    alias: z.string().min(3).max(32),
    name: z.string().max(120).optional().nullable(),
    bio: z.string().max(2000).optional().nullable(),
    headline: z.string().max(120).optional().nullable(),
    pronouns: z.string().max(60).optional().nullable(),
    hometown: z.string().max(120).optional().nullable(),
    major: z.string().max(80).optional().nullable(),
    year: z.string().max(40).optional().nullable(),
    avatarUrl: z.string().url().optional().nullable(),
    interests: z.array(z.string().trim().min(1).max(32)).max(50).optional(),
    lookingFor: z.array(z.string().trim().min(1).max(32)).max(16).optional(),
    intents: z.array(z.string().trim().min(1).max(24)).max(12).optional(),
    seeking: z.array(z.string().trim().min(1).max(32)).max(16).optional(),
    dualIdentityMode: z.boolean().optional(),
    discoverable: z.boolean().optional(),
    recruiterOptIn: z.boolean().optional(),
    shareAnalytics: z.boolean().optional(),
    profileVisibility: z.enum(visibilityOptions).optional(),
    allowMessagesFrom: z.enum(messageOptions).optional(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    campusId: z.string().cuid().optional().nullable(),
  })
  .refine(
    (data) => {
      if ((data.latitude == null) !== (data.longitude == null)) {
        return false
      }
      return true
    },
    {
      message: 'Latitude and longitude must both be provided',
      path: ['longitude'],
    },
  )

export async function GET() {
  try {
    const user = await requireUser()
    const record = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        campus: true,
        rooms: {
          where: { leftAt: null },
          select: { id: true },
        },
        createdRooms: {
          select: { id: true },
        },
        eventRsvps: {
          select: { status: true },
        },
        timecapsules: {
          select: { id: true },
        },
      },
    })
    if (!record) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }
    const stats = {
      activeRooms: record.rooms.length,
      createdRooms: record.createdRooms.length,
      eventsGoing: record.eventRsvps.filter((r) => r.status === 'GOING').length,
      timecapsules: record.timecapsules.length,
    }
    return NextResponse.json({ ...record, stats })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PATCH(request: Request) {
  try {
    const dbUser = await requireUser()
    const payload = await request.json()
    const input = updateProfileSchema.parse(payload)

    const updateData: Prisma.UserUpdateInput = {
      alias: input.alias,
      onboardingAt: dbUser.onboardingAt ?? new Date(),
      profileCompletedAt: new Date(),
      lastActiveAt: new Date(),
    }

    if (input.name !== undefined) {
      updateData.name = input.name ?? null
    }
    if (input.bio !== undefined) {
      updateData.bio = input.bio ?? null
    }
    if (input.headline !== undefined) {
      updateData.headline = input.headline ?? null
    }
    if (input.pronouns !== undefined) {
      updateData.pronouns = input.pronouns ?? null
    }
    if (input.hometown !== undefined) {
      updateData.hometown = input.hometown ?? null
    }
    if (input.major !== undefined) {
      updateData.major = input.major ?? null
    }
    if (input.year !== undefined) {
      updateData.year = input.year ?? null
    }
    if (input.interests !== undefined) {
      updateData.interests = input.interests
    }
    if (input.lookingFor !== undefined) {
      updateData.lookingFor = input.lookingFor
    }
    if (input.intents !== undefined) {
      updateData.intents = input.intents
    }
    if (input.seeking !== undefined) {
      updateData.seeking = input.seeking
    }
    if (input.dualIdentityMode !== undefined) {
      updateData.dualIdentityMode = input.dualIdentityMode
    }
    if (input.discoverable !== undefined) {
      updateData.discoverable = input.discoverable
    }
    if (input.recruiterOptIn !== undefined) {
      updateData.recruiterOptIn = input.recruiterOptIn
    }
    if (input.shareAnalytics !== undefined) {
      updateData.shareAnalytics = input.shareAnalytics
    }
    if (input.profileVisibility !== undefined) {
      updateData.profileVisibility = input.profileVisibility
    }
    if (input.allowMessagesFrom !== undefined) {
      updateData.allowMessagesFrom = input.allowMessagesFrom
    }
    if (input.avatarUrl !== undefined) {
      updateData.avatarUrl = input.avatarUrl ?? null
    }
    if (input.latitude !== undefined && input.longitude !== undefined) {
      updateData.latitude = input.latitude
      updateData.longitude = input.longitude
    }
    if (input.campusId !== undefined) {
      updateData.campus = input.campusId
        ? {
            connect: {
              id: input.campusId,
            },
          }
        : { disconnect: true }
    }

    await prisma.user.update({
      where: { id: dbUser.id },
      data: updateData,
    })

    const refreshed = await prisma.user.findUnique({
      where: { id: dbUser.id },
      include: {
        campus: true,
      },
    })

    return NextResponse.json(refreshed)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.flatten() },
        { status: 422 },
      )
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

