'use client'

import { useQuery } from '@tanstack/react-query'

export type ConnectionPayload = {
  id: string
  peerId: string
  peerAlias: string
  peerAvatar: string | null
  peerHeadline: string | null
  status: 'PENDING' | 'CONNECTED' | 'BLOCKED'
  trustLevel: number // 0-100
  conversationId: string | null
  lastInteractionAt: string
  createdAt: string
  lastMessageAt: string | null
}

async function fetchConnections(): Promise<ConnectionPayload[]> {
  const response = await fetch('/api/connections', { credentials: 'include' })
  if (!response.ok) {
    throw new Error('Failed to load connections')
  }
  const data = await response.json()
  return data.connections as ConnectionPayload[]
}

export function useConnections() {
  return useQuery({
    queryKey: ['connections'],
    queryFn: fetchConnections,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })
}

export function getTrustStage(trustLevel: number): { stage: number; label: string; unlocked: boolean } {
  if (trustLevel >= 75) {
    return { stage: 4, label: 'Full professional unlock + mutual intros', unlocked: true }
  } else if (trustLevel >= 50) {
    return { stage: 3, label: 'Academic details reveal', unlocked: true }
  } else if (trustLevel >= 25) {
    return { stage: 2, label: 'Portfolio snapshots unlock', unlocked: true }
  } else if (trustLevel > 0) {
    return { stage: 1, label: 'Alias chat & vibes', unlocked: true }
  }
  return { stage: 0, label: 'Not started', unlocked: false }
}

