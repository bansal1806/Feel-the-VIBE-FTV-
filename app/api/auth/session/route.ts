import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const payload = await getCurrentUser()
    
    if (!payload) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        alias: true,
        name: true,
        avatarUrl: true,
        emailVerified: true,
        onboardingAt: true,
        profileCompletedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      })
    }

    return NextResponse.json({
      authenticated: true,
      user,
    })
  } catch (error) {
    console.error('Get session error:', error)
    return NextResponse.json(
      { authenticated: false, user: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

