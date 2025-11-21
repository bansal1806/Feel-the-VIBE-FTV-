'use client'

import { motion } from 'framer-motion'
import { MapPin, Users, Clock, MessageCircle, BookOpen, Calendar, Users as UsersIcon, KeyRound } from 'lucide-react'
import type { RoomPayload } from '@/lib/hooks/useRooms'
import { formatDistanceFromNow } from '@/lib/utils/time'

interface NowRoomCardProps {
  room: RoomPayload
  isJoining: boolean
  onJoin: () => void
}

const COLORS: Record<RoomPayload['type'], string> = {
  STUDY: 'from-blue-500 via-indigo-500 to-indigo-700',
  EVENT: 'from-purple-500 via-indigo-500 to-blue-700',
  SOCIAL: 'from-emerald-500 via-teal-500 to-cyan-600',
}

const ICONS: Record<RoomPayload['type'], typeof BookOpen> = {
  STUDY: BookOpen,
  EVENT: Calendar,
  SOCIAL: UsersIcon,
}

export default function NowRoomCard({ room, isJoining, onJoin }: NowRoomCardProps) {
  const Icon = ICONS[room.type]
  const expiresLabel = formatDistanceFromNow(room.expiresAt)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${COLORS[room.type]} p-6 text-white shadow-xl shadow-indigo-500/20`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_60%)]" />
      <div className="relative z-10 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
            <Icon className="h-4 w-4" />
            {formatRoomType(room.type)}
          </div>
          <div className="flex items-center gap-2">
            {room.access !== 'public' && (
              <span className="flex items-center gap-1 rounded-xl border border-white/30 bg-white/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
                <KeyRound className="h-3 w-3" />
                {room.access === 'invite' ? 'Invite' : 'Campus'}
              </span>
            )}
            <span className="flex items-center gap-1 rounded-xl border border-emerald-300/50 bg-emerald-500/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
              Live
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-semibold leading-tight">{room.name}</h3>
          {room.description && <p className="mt-2 text-sm text-white/85">{room.description}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-white/85">
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {room.location}
          </span>
          {room.distance && (
            <span className="inline-flex items-center gap-2 opacity-80">
              <Clock className="h-4 w-4" />
              {room.distance}
            </span>
          )}
          <span className="inline-flex items-center gap-2">
            <Users className="h-4 w-4" />
            {room.participantCount} active
          </span>
          <span className="inline-flex items-center gap-2 text-white/70">
            <Clock className="h-4 w-4" />
            Ends {expiresLabel}
          </span>
        </div>

        {room.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-[11px]">
            {room.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full border border-white/30 bg-white/10 px-3 py-1 font-medium uppercase tracking-[0.18em] text-white/85">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={onJoin}
          disabled={room.isMember || isJoining}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/40 bg-white/80 py-3 text-sm font-semibold text-slate-800 shadow-lg shadow-white/30 transition hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <MessageCircle className="h-4 w-4" />
          {room.isMember ? 'Already joined' : isJoining ? 'Joining…' : 'Join room'}
        </button>
      </div>
    </motion.div>
  )
}

function formatRoomType(type: RoomPayload['type']) {
  switch (type) {
    case 'STUDY':
      return 'Study'
    case 'EVENT':
      return 'Event'
    case 'SOCIAL':
      return 'Social'
    default:
      return 'Room'
  }
}
