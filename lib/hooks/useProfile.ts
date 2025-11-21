'use client'

import { useQuery } from '@tanstack/react-query'

export type ProfileResponse = {
  id: string
  alias: string
  name: string | null
  headline: string | null
  pronouns: string | null
  hometown: string | null
  bio: string | null
  major: string | null
  year: string | null
  avatarUrl: string | null
  interests: string[]
  intents: string[]
  seeking: string[]
  lookingFor: string[]
  skillCreds: number
  dualIdentityMode: boolean
  discoverable: boolean
  recruiterOptIn: boolean
  shareAnalytics: boolean
  profileVisibility: string | null
  allowMessagesFrom: string | null
  campus?: { id: string; name: string | null } | null
  stats?: {
    activeRooms: number
    createdRooms: number
    eventsGoing: number
    timecapsules: number
  }
}

async function fetchProfile(): Promise<ProfileResponse> {
  const res = await fetch('/api/profile', {
    cache: 'no-store',
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error('Failed to load profile')
  }
  return res.json()
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 60_000,
  })
}

