import { NextResponse } from 'next/server'
import { getCurrentUser, generateToken, setTokenCookie } from '@/lib/auth/jwt'

export async function POST() {
  try {
    const payload = await getCurrentUser()
    
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Generate new token
    const newToken = generateToken(payload.userId, payload.email)
    await setTokenCookie(newToken)

    return NextResponse.json({
      success: true,
      token: newToken,
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

