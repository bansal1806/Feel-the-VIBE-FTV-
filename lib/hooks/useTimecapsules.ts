'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export type TimecapsulePayload = {
  id: string
  title: string
  description: string | null
  mediaUrl: string | null
  coverImage: string | null
  unlockAt: string
  audience: string
  tags: string[]
  isPublished: boolean
  createdAt: string
  campus: { id: string; name: string } | null
  creator: {
    id: string
    alias: string
    avatarUrl: string | null
    major: string | null
    year: string | null
  }
  contributions: Array<{
    id: string
    message: string | null
    mediaUrl: string | null
    contributor: { id: string; alias: string; avatarUrl: string | null }
  }>
}

async function fetchTimecapsules(): Promise<TimecapsulePayload[]> {
  const response = await fetch('/api/timecapsules', { credentials: 'include' })
  if (!response.ok) {
    throw new Error('Failed to load timecapsules')
  }
  const data = await response.json()
  return data.capsules as TimecapsulePayload[]
}

export function useTimecapsules() {
  return useQuery({
    queryKey: ['timecapsules'],
    queryFn: fetchTimecapsules,
    staleTime: 120_000,
  })
}

export function useCreateTimecapsule() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      title: string
      description?: string | null
      mediaUrl?: string | null
      coverImage?: string | null
      unlockAt: string
      audience?: string
      isPublished?: boolean
      tags?: string[]
    }) => {
      const response = await fetch('/api/timecapsules', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unable to create timecapsule' }))
        throw new Error(error.error ?? 'Unable to create timecapsule')
      }
      return response.json()
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['timecapsules'] })
    },
  })
}

