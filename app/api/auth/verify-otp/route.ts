import { NextRequest, NextResponse } from 'next/server'
import { verifyOTP } from '@/lib/auth/otp'
import { validateStudentEmail } from '@/lib/auth/email'
import { generateToken, setTokenCookie } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'
import { toSlug } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!otp || typeof otp !== 'string') {
      return NextResponse.json(
        { success: false, error: 'OTP is required' },
        { status: 400 }
      )
    }

    // Validate email
    const validation = validateStudentEmail(email)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    // Verify OTP
    const isValid = await verifyOTP(email.toLowerCase(), otp)
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Find or create user
    const normalizedEmail = email.toLowerCase()
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      // Generate initial alias from email
      const emailPrefix = normalizedEmail.split('@')[0]
      const initialAlias = toSlug(emailPrefix) || `student-${Date.now().toString(36)}`

      // Ensure alias is unique
      let alias = initialAlias
      let counter = 1
      while (await prisma.user.findUnique({ where: { alias } })) {
        alias = `${initialAlias}-${counter}`
        counter++
      }

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          alias,
          emailVerified: new Date(),
          intents: ['collab', 'study', 'social'],
          lookingFor: ['projects'],
          seeking: ['Product', 'Engineering'],
          profileVisibility: 'campus',
          allowMessagesFrom: 'campus',
          lastActiveAt: new Date(),
        },
      })
    } else {
      // Update last active and email verified if not already
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: user.emailVerified || new Date(),
          lastActiveAt: new Date(),
        },
      })
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email)

    // Set token in cookie
    await setTokenCookie(token)

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        alias: user.alias,
        name: user.name,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
      },
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

