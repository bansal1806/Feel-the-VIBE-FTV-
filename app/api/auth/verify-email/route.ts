import { NextRequest, NextResponse } from 'next/server'
import { validateStudentEmail } from '@/lib/auth/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { valid: false, isEdu: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const validation = validateStudentEmail(email)
    return NextResponse.json(validation)
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json(
      { valid: false, isEdu: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

