import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from './supabase/client'

const channelCache = new Map<string, RealtimeChannel>()

export function getRealtimeChannel(topic: string) {
  if (channelCache.has(topic)) {
    return channelCache.get(topic)!
  }
  const supabase = getSupabaseBrowserClient()
  const channel = supabase.channel(topic, {
    config: {
      broadcast: { ack: true },
      presence: {
        key: `client-${Math.random().toString(36).slice(2)}`,
      },
    },
  })
  channelCache.set(topic, channel)
  return channel
}

export function removeRealtimeChannel(topic: string) {
  const channel = channelCache.get(topic)
  if (channel) {
    channel.unsubscribe()
    channelCache.delete(topic)
  }
}
type Unsub = () => void

class RealtimeMock {
  private typingTimers = new Map<string, number>()
  private typingListeners = new Map<string, Set<(v: boolean)=>void>>()
  private onlineStates = new Map<string, boolean>()
  private onlineListeners = new Map<string, Set<(v: boolean)=>void>>()
  private roomCounts = new Map<string, number>()
  private roomListeners = new Map<string, Set<(v: number)=>void>>()

  subscribeTyping(conversationId: string, cb: (v: boolean)=>void): Unsub {
    if (!this.typingListeners.has(conversationId)) this.typingListeners.set(conversationId, new Set())
    const set = this.typingListeners.get(conversationId)!
    set.add(cb)
    if (!this.typingTimers.has(conversationId)) {
      const tick = () => {
        const listeners = this.typingListeners.get(conversationId)
        if (!listeners || listeners.size === 0) { this.typingTimers.delete(conversationId); return }
        listeners.forEach(l => l(true))
        setTimeout(() => listeners.forEach(l => l(false)), 1200 + Math.random()*1200)
        this.typingTimers.set(conversationId, window.setTimeout(tick, 4000 + Math.random()*6000))
      }
      this.typingTimers.set(conversationId, window.setTimeout(tick, 3000))
    }
    return () => set.delete(cb)
  }

  subscribeOnline(alias: string, cb: (v: boolean)=>void): Unsub {
    if (!this.onlineStates.has(alias)) this.onlineStates.set(alias, true)
    cb(this.onlineStates.get(alias)!)
    if (!this.onlineListeners.has(alias)) this.onlineListeners.set(alias, new Set())
    const set = this.onlineListeners.get(alias)!
    set.add(cb)
    if (set.size === 1) {
      setInterval(() => {
        const current = !(this.onlineStates.get(alias) ?? true)
        this.onlineStates.set(alias, current)
        this.onlineListeners.get(alias)?.forEach(l => l(current))
      }, 15000)
    }
    return () => set.delete(cb)
  }

  subscribeRoomParticipants(roomId: string, initial: number, cb: (v: number)=>void): Unsub {
    if (!this.roomCounts.has(roomId)) this.roomCounts.set(roomId, initial)
    cb(this.roomCounts.get(roomId)!)
    if (!this.roomListeners.has(roomId)) this.roomListeners.set(roomId, new Set())
    const set = this.roomListeners.get(roomId)!
    set.add(cb)
    if (set.size === 1) {
      setInterval(() => {
        let val = this.roomCounts.get(roomId) ?? initial
        const delta = Math.round((Math.random()*2 - 1))
        val = Math.max(0, val + delta)
        this.roomCounts.set(roomId, val)
        this.roomListeners.get(roomId)?.forEach(l => l(val))
      }, 5000)
    }
    return () => set.delete(cb)
  }
}

export const realtime = new RealtimeMock()


