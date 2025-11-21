'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

export type FeedItem =
  | {
      type: 'user'
      id: string
      alias: string
      name: string | null
      avatarUrl: string | null
      headline: string | null
      major: string | null
      year: string | null
      bio: string | null
      compatibilityScore: number
      sharedInterests: string[]
      sharedIntents: string[]
      proximity: string | null
      lastActiveAt: string | null
      campusName: string | null
      unlockLevel: number
      stats: {
        activeRooms: number
        mutualRooms: number
      }
      isConnected: boolean
      isPendingConnection: boolean
      alreadyLiked: boolean
    }
  | {
      type: 'room'
      id: string
      name: string
      description: string | null
      location: string
      expiresAt: string
      participants: number
      typeLabel: string
      distance: string | null
      tags: string[]
      inviteCode: string | null
      campusName: string | null
      isMember: boolean
      maxCapacity: number | null
    }
  | {
      type: 'event'
      id: string
      title: string
      description: string | null
      startTime: string
      endTime: string | null
      location: string
      hostName: string | null
      category: string
      coverImage: string | null
      campusName: string | null
      distance: string | null
      rsvpCount: number
      isGoing: boolean
      isInterested: boolean
    }

async function fetchFeed(): Promise<FeedItem[]> {
  const response = await fetch('/api/feed', {
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error('Failed to load feed')
  }
  const data = await response.json()
  return data.items as FeedItem[]
}

export function useFeed() {
  return useQuery({
    queryKey: ['feed'],
    queryFn: fetchFeed,
    staleTime: 1000 * 60,
  })
}

export function useFeedPrefetch() {
  const client = useQueryClient()
  return () =>
    client.prefetchQuery({
      queryKey: ['feed'],
      queryFn: fetchFeed,
    })
}

