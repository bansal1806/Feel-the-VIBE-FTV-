import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getTokenFromCookie, verifyToken } from '@/lib/auth/jwt'

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/sign-in',
  '/sign-up',
  '/revenue',
  '/onboarding',
  '/api/auth',
]

// Routes that require authentication
const protectedRoutes = ['/app', '/api']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Get token from cookie
    const token = request.cookies.get('vibe_session')?.value

    if (!token) {
      // Redirect to sign-in if not authenticated
      if (pathname.startsWith('/app')) {
        const signInUrl = new URL('/sign-in', request.url)
        signInUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(signInUrl)
      }
      
      // For API routes, return 401
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    // Verify token
    if (token) {
      const payload = verifyToken(token)
      if (!payload) {
        // Invalid token, clear cookie and redirect
        const response = pathname.startsWith('/app')
          ? NextResponse.redirect(new URL('/sign-in', request.url))
          : NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        
        response.cookies.delete('vibe_session')
        return response
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
