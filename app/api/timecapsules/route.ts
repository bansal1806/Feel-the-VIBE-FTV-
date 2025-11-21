import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

const createTimecapsuleSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().max(800).optional().nullable(),
  mediaUrl: z.string().url().optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  unlockAt: z.string().datetime(),
  audience: z.enum(['campus', 'class', 'friends', 'public']).default('campus'),
  isPublished: z.boolean().optional(),
  tags: z.array(z.string().trim().min(1).max(32)).max(16).optional(),
})

export async function GET() {
  try {
    const viewer = await requireUser()

    const capsules = await prisma.timecapsule.findMany({
      where: {
        OR: [
          { campusId: viewer.campusId ?? undefined },
          { audience: 'public' },
        ],
      },
      include: {
        creator: {
          select: {
            id: true,
            alias: true,
            avatarUrl: true,
            major: true,
            year: true,
          },
        },
        contributions: {
          include: {
            contributor: {
              select: {
                id: true,
                alias: true,
                avatarUrl: true,
              },
            },
          },
        },
        campus: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ unlockAt: 'asc' }],
      take: 40,
    })

    return NextResponse.json({ capsules })
  } catch (error) {
    console.error('[timecapsules] list error', error)
    return NextResponse.json({ error: 'Failed to load timecapsules' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const viewer = await requireUser()
    const body = await request.json()
    const input = createTimecapsuleSchema.parse(body)

    const capsule = await prisma.timecapsule.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        mediaUrl: input.mediaUrl ?? null,
        coverImage: input.coverImage ?? null,
        unlockAt: new Date(input.unlockAt),
        audience: input.audience,
        tags: input.tags ?? [],
        isPublished: input.isPublished ?? false,
        creatorId: viewer.id,
        campusId: viewer.campusId,
      },
      include: {
        creator: {
          select: {
            id: true,
            alias: true,
            avatarUrl: true,
          },
        },
      },
    })

    return NextResponse.json(capsule, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid timecapsule payload', details: error.flatten() }, { status: 422 })
    }
    console.error('[timecapsules] create error', error)
    return NextResponse.json({ error: 'Failed to create timecapsule' }, { status: 500 })
  }
}

