'use client'

import { useQuery } from '@tanstack/react-query'

interface SessionUser {
  id: string
  email: string
  alias: string
  name?: string | null
  avatarUrl?: string | null
  emailVerified?: Date | null
  onboardingAt?: Date | null
  profileCompletedAt?: Date | null
}

interface SessionData {
  authenticated: boolean
  user: SessionUser | null
}

export function useSession() {
  const { data, isLoading, error } = useQuery<SessionData>({
    queryKey: ['session'],
    queryFn: async () => {
      const response = await fetch('/api/auth/session')
      if (!response.ok) {
        return { authenticated: false, user: null }
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  })

  return {
    user: data?.user ?? null,
    isAuthenticated: data?.authenticated ?? false,
    isLoading,
    error,
  }
}

