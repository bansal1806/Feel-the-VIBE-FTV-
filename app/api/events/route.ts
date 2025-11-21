import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { haversineDistanceKm, formatDistance } from '@/lib/utils/geo'

const createEventSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(600).optional().nullable(),
  location: z.string().min(2).max(160),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional().nullable(),
  category: z.enum(['SOCIAL', 'ACADEMIC', 'CAREER', 'WELLNESS', 'SPORTS', 'OTHER']).default('OTHER'),
  coverImage: z.string().url().optional().nullable(),
  hostName: z.string().max(120).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(32)).max(16).optional(),
})

export async function GET() {
  try {
    const viewer = await requireUser()
    const now = new Date()

    const events = await prisma.event.findMany({
      where: {
        startTime: {
          gte: new Date(now.getTime() - 1000 * 60 * 60 * 24),
        },
        OR: [{ campusId: viewer.campusId ?? undefined }, { campusId: null }],
      },
      include: {
        attendees: true,
        campus: true,
      },
      orderBy: [{ startTime: 'asc' }],
      take: 30,
    })

    const payload = events.map((event) => {
      const viewerLocation =
        viewer.latitude != null && viewer.longitude != null ? { latitude: viewer.latitude, longitude: viewer.longitude } : null
      const distance =
        viewerLocation && event.latitude != null && event.longitude != null
          ? formatDistance(haversineDistanceKm(viewerLocation, { latitude: event.latitude, longitude: event.longitude }))
          : null
      const attendance = event.attendees.find((item) => item.userId === viewer.id)

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        startTime: event.startTime.toISOString(),
        endTime: event.endTime?.toISOString() ?? null,
        category: event.category,
        coverImage: event.coverImage,
        hostName: event.hostName,
        campusName: event.campus?.name ?? null,
        distance,
        rsvpCount: event.attendees.filter((a) => a.status === 'GOING').length || event.rsvpCount,
        isGoing: attendance?.status === 'GOING',
        isInterested: attendance?.status === 'INTERESTED',
        tags: event.tags,
      }
    })

    return NextResponse.json({ events: payload })
  } catch (error) {
    console.error('[events] list error', error)
    return NextResponse.json({ error: 'Failed to load events' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const viewer = await requireUser()
    const body = await request.json()
    const input = createEventSchema.parse(body)

    const event = await prisma.event.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        location: input.location,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        startTime: new Date(input.startTime),
        endTime: input.endTime ? new Date(input.endTime) : null,
        category: input.category,
        coverImage: input.coverImage ?? null,
        hostName: input.hostName ?? viewer.alias,
        tags: input.tags ?? [],
        campusId: viewer.campusId,
        createdById: viewer.id,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid event payload', details: error.flatten() }, { status: 422 })
    }
    console.error('[events] create error', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}

