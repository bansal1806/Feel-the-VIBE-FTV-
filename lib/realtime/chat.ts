'use client'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { getRealtimeChannel, removeRealtimeChannel } from '@/lib/realtime'

export type ConversationMessageRow = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  media_url: string | null
  created_at: string
}

export function subscribeToConversationMessages(
  conversationId: string,
  callbacks: {
    onInsert(message: ConversationMessageRow): void
  },
) {
  const supabase = getSupabaseBrowserClient()
  const channel = supabase
    .channel(`conversation:${conversationId}:messages`)
    .on<ConversationMessageRow>(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => callbacks.onInsert(payload.new),
    )
  channel.subscribe()

  return () => channel.unsubscribe()
}

export type TypingSignal = {
  userId: string
  alias: string
}

export function registerTypingIndicator(
  conversationId: string,
  payload: TypingSignal,
  callbacks: {
    onTyping(users: TypingSignal[]): void
  },
) {
  const topic = `conversation:${conversationId}:typing`
  const channel = getRealtimeChannel(topic)

  channel.on('broadcast', { event: 'typing' }, (event) => {
    callbacks.onTyping(event.payload.users as TypingSignal[])
  })

  channel.subscribe()

  let timeout: ReturnType<typeof setTimeout> | null = null

  function emitTyping() {
    if (timeout) {
      clearTimeout(timeout)
    }
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { users: [payload] },
    })
    timeout = setTimeout(() => {
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { users: [] },
      })
    }, 2500)
  }

  return {
    emitTyping,
    unsubscribe: () => {
      if (timeout) clearTimeout(timeout)
      channel.unsubscribe()
      removeRealtimeChannel(topic)
    },
  }
}

export async function sendConversationMessage(input: {
  conversationId: string
  senderId: string
  content: string
  mediaUrl?: string
}) {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.from('messages').insert({
    conversation_id: input.conversationId,
    sender_id: input.senderId,
    content: input.content,
    media_url: input.mediaUrl ?? null,
  })
  if (error) {
    throw error
  }
}

