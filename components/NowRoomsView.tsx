'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Users, Zap } from 'lucide-react'
import NowRoomCard from './NowRoomCard'
import { useJoinRoom, useRooms } from '@/lib/hooks/useRooms'
import { notify } from '@/lib/notify'
import { bus } from '@/lib/bus'
import { globalState } from '@/lib/state'

export default function NowRoomsView() {
  const { data: rooms, isLoading } = useRooms()
  const joinRoomMutation = useJoinRoom()
  const list = rooms ?? []

  const totalParticipants = list.reduce((sum, room) => sum + room.participantCount, 0)
  const tags = Array.from(new Set(list.flatMap((room) => room.tags))).slice(0, 6)

  const handleJoinRoom = async (roomId: string, inviteCode?: string) => {
    try {
      await joinRoomMutation.mutateAsync({ roomId, inviteCode })
      notify('Now Rooms', 'Joined successfully')
      bus.emit('action', { type: 'join' })
      globalState.set({ credits: globalState.get().credits + 5 })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to join room'
      bus.emit('toast', { message })
    }
  }

  return (
    <div className="space-y-6">
      <HeroSummary rooms={list} totalParticipants={totalParticipants} tags={tags} />

      {isLoading && (
        <div className="space-y-4">
          {[0, 1].map((idx) => (
            <div key={idx} className="h-52 animate-pulse rounded-3xl bg-white/70 shadow-inner dark:bg-slate-900/60" />
          ))}
        </div>
      )}

      {!isLoading && list.length === 0 && <EmptyState />}

      <div className="space-y-4">
        {list.map((room) => (
          <NowRoomCard
            key={room.id}
            room={room}
            isJoining={joinRoomMutation.isPending && joinRoomMutation.variables?.roomId === room.id}
            onJoin={() => handleJoinRoom(room.id)}
          />
        ))}
      </div>
    </div>
  )
}

function HeroSummary({
  rooms,
  totalParticipants,
  tags,
}: {
  rooms: NonNullable<ReturnType<typeof useRooms>['data']>
  totalParticipants: number
  tags: string[]
}) {
  const joined = rooms.filter((room) => room.isMember).length
  return (
    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white/80 p-6 shadow-lg shadow-indigo-100 ring-1 ring-indigo-50 backdrop-blur dark:bg-slate-900/70 dark:ring-slate-800/70">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Now Rooms</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">Hyperlocal spaces that fade when the energy does.</p>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-2 text-right text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:border-indigo-900/60 dark:bg-indigo-900/30 dark:text-indigo-300">
          <div>{rooms.length} rooms live</div>
          <div>{totalParticipants} peers inside</div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <StatCard icon={<Zap className="h-4 w-4" />} label="Rooms joined" value={joined} description="Your current spaces" />
        <StatCard icon={<Users className="h-4 w-4" />} label="Avg crowd" value={Math.max(1, Math.round(totalParticipants / Math.max(1, rooms.length)))} description="Members per room" />
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 text-xs text-indigo-600 dark:border-indigo-900/60 dark:bg-indigo-900/30 dark:text-indigo-200">
          <div className="font-semibold uppercase tracking-[0.2em]">Focus themes</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.length === 0 && <span className="rounded-xl border border-indigo-100 bg-white/70 px-3 py-1 text-indigo-500">Swipe to unlock insights</span>}
            {tags.map((tag) => (
              <span key={tag} className="rounded-xl border border-indigo-200 bg-white/90 px-3 py-1 text-indigo-600 shadow dark:border-indigo-800 dark:bg-slate-900/60 dark:text-indigo-200">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode
  label: string
  value: number
  description: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white/80 p-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60">
      <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 p-2 text-white shadow-lg shadow-indigo-500/30">{icon}</div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-300">{label}</div>
        <div className="text-xl font-semibold text-slate-900 dark:text-white">{value}</div>
        <div className="text-xs text-slate-500 dark:text-slate-300">{description}</div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
      <MapPin className="mx-auto h-10 w-10 text-indigo-400" />
      <p className="mt-3 text-sm font-semibold">No live rooms within your radius right now.</p>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Explore campus or adjust discovery settings to unlock more rooms.</p>
    </motion.div>
  )
}

