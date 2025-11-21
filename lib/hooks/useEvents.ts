'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export type EventPayload = {
  id: string
  title: string
  description: string | null
  location: string
  startTime: string
  endTime: string | null
  category: string
  coverImage: string | null
  hostName: string | null
  campusName: string | null
  distance: string | null
  rsvpCount: number
  isGoing: boolean
  isInterested: boolean
  tags: string[]
}

async function fetchEvents(): Promise<EventPayload[]> {
  const response = await fetch('/api/events', { credentials: 'include' })
  if (!response.ok) {
    throw new Error('Failed to load events')
  }
  const data = await response.json()
  return data.events as EventPayload[]
}

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 60_000,
  })
}

export function useCreateEvent() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      title: string
      description?: string | null
      location: string
      latitude?: number | null
      longitude?: number | null
      startTime: string
      endTime?: string | null
      category?: string
      coverImage?: string | null
      hostName?: string | null
      tags?: string[]
    }) => {
      const response = await fetch('/api/events', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unable to create event' }))
        throw new Error(error.error ?? 'Unable to create event')
      }
      return response.json()
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['events'] })
      void client.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

