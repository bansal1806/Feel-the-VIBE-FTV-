import { NextRequest, NextResponse } from 'next/server'
import { generateOTP, storeOTP, checkRateLimit } from '@/lib/auth/otp'
import { validateStudentEmail, sendOTPEmail } from '@/lib/auth/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format and .edu domain
    const validation = validateStudentEmail(email)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(email)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many OTP requests. Please try again later.',
          retryAfter: rateLimit.remaining,
        },
        { status: 429 }
      )
    }

    // Generate and store OTP
    const otp = generateOTP()
    await storeOTP(email, otp)

    // Send OTP email
    try {
      await sendOTPEmail(email, otp)
    } catch (error) {
      console.error('Failed to send OTP email:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
      expiresIn: 600, // 10 minutes
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

