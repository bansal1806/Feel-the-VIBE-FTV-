import { NextResponse } from 'next/server'
import { clearTokenCookie } from '@/lib/auth/jwt'

export async function POST() {
  try {
    await clearTokenCookie()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

