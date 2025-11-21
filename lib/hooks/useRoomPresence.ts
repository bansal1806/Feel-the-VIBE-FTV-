'use client'

import { useEffect, useMemo, useState } from 'react'
import type { RoomPresenceMeta, RoomPresenceState } from '@/lib/realtime/rooms'
import { joinRoomPresence } from '@/lib/realtime/rooms'

type PresenceList = RoomPresenceMeta[]

export function useRoomPresence(roomId: string, meta: RoomPresenceMeta) {
  const [state, setState] = useState<PresenceList>([])

  useEffect(() => {
    if (!roomId) return
    const dispose = joinRoomPresence(roomId, meta, {
      onSync: (presenceState: RoomPresenceState) => {
        const list = Object.values(presenceState).flat()
        setState(list)
      },
      onJoin: (payload) => {
        setState((prev) => [...prev.filter((item) => item.userId !== payload.userId), payload])
      },
      onLeave: (payload) => {
        setState((prev) => prev.filter((item) => item.userId !== payload.userId))
      },
    })
    return dispose
  }, [roomId, meta])

  const presenceByUser = useMemo(
    () => new Map(state.map((item) => [item.userId, item])),
    [state],
  )

  return { presence: state, presenceByUser }
}

