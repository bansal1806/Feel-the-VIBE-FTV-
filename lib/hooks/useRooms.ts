'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export type RoomPayload = {
  id: string
  name: string
  description: string | null
  location: string
  latitude: number
  longitude: number
  type: 'STUDY' | 'EVENT' | 'SOCIAL'
  expiresAt: string
  active: boolean
  access: string
  inviteCode: string | null
  maxCapacity: number | null
  tags: string[]
  distance: string | null
  campusName: string | null
  isMember: boolean
  participantCount: number
  members: Array<{
    id: string
    alias: string
    avatarUrl: string | null
    major: string | null
    year: string | null
    interests: string[]
  }>
}

async function fetchRooms(): Promise<RoomPayload[]> {
  const response = await fetch('/api/rooms', { credentials: 'include' })
  if (!response.ok) {
    throw new Error('Failed to load rooms')
  }
  const data = await response.json()
  return data.rooms as RoomPayload[]
}

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}

async function joinRoomRequest(roomId: string, inviteCode?: string) {
  const response = await fetch(`/api/rooms/${roomId}/join`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inviteCode }),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unable to join room' }))
    throw new Error(error.error ?? 'Unable to join room')
  }
  return response.json()
}

export function useJoinRoom() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ roomId, inviteCode }: { roomId: string; inviteCode?: string }) => joinRoomRequest(roomId, inviteCode),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['rooms'] })
      void client.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export function useCreateRoom() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      name: string
      description?: string | null
      location: string
      latitude: number
      longitude: number
      type: 'STUDY' | 'EVENT' | 'SOCIAL'
      durationMinutes: number
      maxCapacity?: number | null
      tags?: string[]
      access?: 'public' | 'invite' | 'campus'
    }) => {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unable to create room' }))
        throw new Error(error.error ?? 'Unable to create room')
      }
      return response.json()
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['rooms'] })
      void client.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

