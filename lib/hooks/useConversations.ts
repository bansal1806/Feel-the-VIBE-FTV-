'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export type ConversationPayload = {
  id: string
  type: 'DIRECT' | 'ROOM'
  participants: Array<{
    id: string
    alias: string
    avatarUrl: string | null
    headline: string | null
    major: string | null
    year: string | null
  }>
  messages: Array<{
    id: string
    content: string
    mediaUrl: string | null
    createdAt: string
    sender: {
      id: string
      alias: string
      avatarUrl: string | null
    }
  }>
}

export type ConversationMessagePayload = {
  id: string
  content: string
  mediaUrl: string | null
  createdAt: string
  sender: {
    id: string
    alias: string
    avatarUrl: string | null
  }
}

async function fetchConversations(): Promise<ConversationPayload[]> {
  const response = await fetch('/api/conversations', { credentials: 'include' })
  if (!response.ok) {
    throw new Error('Failed to load conversations')
  }
  const data = await response.json()
  return data.conversations as ConversationPayload[]
}

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}

export function useCreateConversation() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (peerId: string) => {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peerId }),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unable to start conversation' }))
        throw new Error(error.error ?? 'Unable to start conversation')
      }
      return response.json()
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useSendMessage(conversationId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input: { content: string; mediaUrl?: string | null; replyToId?: string }) => {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unable to send message' }))
        throw new Error(error.error ?? 'Unable to send message')
      }
      return response.json()
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['conversations'] })
      void client.invalidateQueries({ queryKey: ['conversations', conversationId, 'messages'] })
    },
  })
}

export function useConversationMessages(conversationId: string) {
  return useQuery({
    enabled: Boolean(conversationId),
    queryKey: ['conversations', conversationId, 'messages'],
    queryFn: async (): Promise<ConversationMessagePayload[]> => {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, { credentials: 'include' })
      if (!response.ok) {
        throw new Error('Failed to load messages')
      }
      const payload = await response.json()
      return Array.isArray(payload?.messages) ? (payload.messages as ConversationMessagePayload[]) : []
    },
    staleTime: 5_000,
    refetchInterval: 5_000, // Poll every 5 seconds for new messages
  })
}

