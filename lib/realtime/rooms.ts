'use client'

import { getRealtimeChannel, removeRealtimeChannel } from '@/lib/realtime'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export type RoomPresenceMeta = {
  userId: string
  alias: string
  avatarUrl?: string | null
}

export type RoomPresenceState = Record<string, RoomPresenceMeta[]>

type PresenceCallbacks = {
  onSync?(state: RoomPresenceState): void
  onJoin?(payload: RoomPresenceMeta): void
  onLeave?(payload: RoomPresenceMeta): void
}

export function joinRoomPresence(
  roomId: string,
  meta: RoomPresenceMeta,
  callbacks: PresenceCallbacks = {},
) {
  const topic = `room:${roomId}:presence`
  const channel = getRealtimeChannel(topic)

  channel.on('presence', { event: 'sync' }, () => {
    callbacks.onSync?.(channel.presenceState<RoomPresenceMeta>())
  })
  channel.on('presence', { event: 'join' }, ({ newPresences }) => {
    newPresences.forEach((presence) => callbacks.onJoin?.(presence as unknown as RoomPresenceMeta))
  })
  channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
    leftPresences.forEach((presence) => callbacks.onLeave?.(presence as unknown as RoomPresenceMeta))
  })

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      channel.track(meta)
    }
  })

  return () => {
    void channel.untrack()
    channel.unsubscribe()
    removeRealtimeChannel(topic)
  }
}

export type RoomMessageRow = {
  id: string
  room_id: string
  sender_id: string
  content: string
  media_url: string | null
  created_at: string
}

export function subscribeToRoomMessages(
  roomId: string,
  callbacks: {
    onInsert(message: RoomMessageRow): void
  },
) {
  const supabase = getSupabaseBrowserClient()
  const channel = supabase
    .channel(`room:${roomId}:messages`)
    .on<RoomMessageRow>(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'room_messages',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => callbacks.onInsert(payload.new),
    )
  channel.subscribe()

  return () => {
    channel.unsubscribe()
  }
}

export async function sendRoomMessage(input: {
  roomId: string
  senderId: string
  content: string
  mediaUrl?: string
}) {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.from('room_messages').insert({
    room_id: input.roomId,
    sender_id: input.senderId,
    content: input.content,
    media_url: input.mediaUrl ?? null,
  })
  if (error) {
    throw error
  }
}

