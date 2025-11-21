'use client'

import { useEffect, useState } from 'react'
import type { RoomMessageRow } from '@/lib/realtime/rooms'
import { subscribeToRoomMessages } from '@/lib/realtime/rooms'

export function useRoomMessages(roomId: string) {
  const [messages, setMessages] = useState<RoomMessageRow[]>([])

  useEffect(() => {
    if (!roomId) return
    const unsubscribe = subscribeToRoomMessages(roomId, {
      onInsert: (message) => {
        setMessages((prev) => [...prev, message])
      },
    })
    return unsubscribe
  }, [roomId])

  return { messages }
}

