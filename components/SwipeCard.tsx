'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Heart, X, MapPin, Calendar, Users, Sparkles, Gauge, Clock4 } from 'lucide-react'
import type { FeedItem } from '@/lib/hooks/useFeed'

interface SwipeCardProps {
  item: FeedItem
  onSwipe: (direction: 'left' | 'right') => void
}

export default function SwipeCard({ item, onSwipe }: SwipeCardProps) {
  const [exitX, setExitX] = useState(0)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-18, 18])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  useEffect(() => {
    const unsubscribe = x.on('change', (latest) => {
      if (latest > 140) {
        setExitX(500)
        onSwipe('right')
      } else if (latest < -140) {
        setExitX(-500)
        onSwipe('left')
      }
    })

    return () => unsubscribe()
  }, [x, onSwipe])

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 100) {
      setExitX(500)
      onSwipe('right')
    } else if (info.offset.x < -100) {
      setExitX(-500)
      onSwipe('left')
    }
  }

  const renderContent = () => {
    if (item.type === 'user') {
      return <UserCard item={item} />
    }
    if (item.type === 'event') {
      return <EventCard item={item} />
    }
    return <RoomCard item={item} />
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, rotate, opacity }}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 ? { x: exitX, opacity: 0 } : { x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      className="swipe-card absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <div className="h-full w-full">{renderContent()}</div>
      {Math.abs(Number(x.get())) > 40 && (
        <motion.div
          className="absolute top-8 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {Number(x.get()) > 0 ? <SwipeBadge intent="like" /> : <SwipeBadge intent="pass" />}
        </motion.div>
      )}
    </motion.div>
  )
}

function SwipeBadge({ intent }: { intent: 'like' | 'pass' }) {
  if (intent === 'like') {
    return (
      <div className="neon-gradient-green-blue text-black-pure px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold shadow-neon-green">
        <Heart className="w-5 h-5" />
        Connect
      </div>
    )
  }
  return (
    <div className="bg-black-deep/90 border border-white/20 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold shadow-xl">
      <X className="w-5 h-5" />
      Pass
    </div>
  )
}

function UserCard({ item }: { item: Extract<FeedItem, { type: 'user' }> }) {
  const sharedTags = useMemo(() => [...item.sharedInterests, ...item.sharedIntents].slice(0, 6), [item])
  // const compatibilityColor =
  //   item.compatibilityScore >= 80 ? 'from-emerald-400 to-green-500' : item.compatibilityScore >= 60 ? 'from-sky-400 to-blue-500' : 'from-amber-400 to-amber-500'

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-black-deep border border-neon-cyan/20">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage: item.avatarUrl
            ? `url(${item.avatarUrl})`
            : 'radial-gradient(circle at top, rgba(0,255,106,0.2), rgba(0,0,0,0.8))',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black-pure/10 via-black-deep/70 to-black-pure/95" />

      <div className="relative flex flex-1 flex-col justify-between p-6 text-white">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold tracking-tight">@{item.alias}</h3>
              {item.isConnected && <Sparkles className="h-5 w-5 text-amber-300" />}
            </div>
            {item.headline && <p className="text-sm text-slate-200/90">{item.headline}</p>}
          </div>
          <div className={`rounded-2xl ${
            item.compatibilityScore >= 80 
              ? 'bg-neon-green/20 border border-neon-green/50 text-neon-green shadow-neon-green' 
              : item.compatibilityScore >= 60 
              ? 'bg-neon-blue/20 border border-neon-blue/50 text-neon-blue shadow-neon-blue'
              : 'bg-neon-yellow/20 border border-neon-yellow/50 text-neon-yellow shadow-neon-yellow'
          } px-4 py-3 text-center`}>
            <div className="text-[10px] uppercase tracking-widest">Match</div>
            <div className="text-xl font-semibold">{item.compatibilityScore}</div>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <UserMeta label="Major" value={item.major ?? 'Undeclared'} />
          <UserMeta label="Year" value={item.year ?? 'Student'} />
          {item.bio && <p className="text-sm text-slate-200/80 line-clamp-3">{item.bio}</p>}

          <div className="flex flex-wrap gap-2">
            {sharedTags.length > 0 ? (
              sharedTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1 text-xs font-medium text-neon-cyan backdrop-blur"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-white/10 bg-black-deep/50 px-3 py-1 text-xs text-white/40">
                Swipe right to reveal shared interests
              </span>
            )}
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-neon-cyan/20 bg-black-deep/50 px-4 py-3 text-xs text-white/60">
            <span>Last active {formatRelativeTime(item.lastActiveAt)}</span>
            {item.proximity && (
              <span className="inline-flex items-center gap-1 text-slate-200">
                <MapPin className="h-4 w-4" />
                {item.proximity}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function EventCard({ item }: { item: Extract<FeedItem, { type: 'event' }> }) {
  const start = new Date(item.startTime)
  const end = item.endTime ? new Date(item.endTime) : null

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-neon-pink/20">
      {item.coverImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${item.coverImage})` }}
        />
      ) : (
        <div className="absolute inset-0 neon-gradient-pink-purple" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black-pure/85 via-black-deep/30 to-black-pure/5" />

      <div className="relative mt-auto space-y-4 p-6 text-white">
        <div className="flex flex-wrap items-center gap-3 text-sm text-white/90">
          <span className="inline-flex items-center gap-2 rounded-full border border-neon-pink/30 bg-neon-pink/10 px-3 py-1">
            <Calendar className="h-4 w-4" />
            {formatEventTime(start, end)}
          </span>
          {item.distance && (
            <span className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1">
              <MapPin className="h-4 w-4" />
              {item.distance}
            </span>
          )}
        </div>

        <h3 className="text-2xl font-semibold leading-tight">{item.title}</h3>
        {item.description && <p className="text-sm text-white/80 line-clamp-3">{item.description}</p>}

        <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
          <span className="inline-flex items-center gap-2">
            <Users className="h-4 w-4" />
            {item.rsvpCount} going
          </span>
          {item.hostName && (
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Host: {item.hostName}
            </span>
          )}
          <span className="inline-flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            {item.category}
          </span>
        </div>
      </div>
    </div>
  )
}

function RoomCard({ item }: { item: Extract<FeedItem, { type: 'room' }> }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl neon-gradient-cyan-yellow border border-neon-cyan/30 text-black-pure">
      <div className="relative flex flex-1 flex-col justify-between p-6">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-black-pure/70">
          <span>{item.campusName ?? 'Open Campus'}</span>
          <span>{item.typeLabel} Room</span>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-semibold leading-tight">{item.name}</h3>
            {item.description && <p className="mt-2 text-sm text-white/85">{item.description}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {item.location}
            </span>
            {item.distance && (
              <span className="inline-flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                {item.distance}
              </span>
            )}
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4" />
              {item.participants} active
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock4 className="h-4 w-4" />
              Ends {formatRelativeTime(item.expiresAt)}
            </span>
          </div>

          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.tags.slice(0, 6).map((tag, index) => {
                const colors = [
                  'bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan',
                  'bg-neon-blue/20 border border-neon-blue/50 text-neon-blue',
                  'bg-neon-green/20 border border-neon-green/50 text-neon-green',
                ]
                return (
                  <span
                    key={tag}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${colors[index % colors.length]}`}
                  >
                    #{tag}
                  </span>
                )
              })}
            </div>
          )}

          <div className="flex items-center justify-between rounded-2xl border border-black-pure/20 bg-black-pure/20 px-4 py-3 text-xs text-black-pure/80">
            <span>{item.isMember ? 'You are already in this room' : 'Swipe right to join instantly'}</span>
            {item.maxCapacity && (
              <span>
                Capacity {item.participants}/{item.maxCapacity}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function UserMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-neon-cyan/20 bg-black-deep/50 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/60">
      <span>{label}</span>
      <span className="font-semibold normal-case tracking-normal text-neon-cyan">{value}</span>
    </div>
  )
}

function formatRelativeTime(input: string | Date | null | undefined) {
  if (!input) return 'recently'
  const date = typeof input === 'string' ? new Date(input) : input
  const diffMs = Date.now() - date.getTime()
  if (diffMs < 0) return 'soon'
  const minutes = Math.floor(diffMs / (1000 * 60))
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  const years = Math.floor(days / 365)
  return `${years}y ago`
}

function formatEventTime(start: Date, end: Date | null) {
  const formatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  const startText = formatter.format(start)
  if (!end) return startText
  const endFormatter = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
  return `${startText} → ${endFormatter.format(end)}`
}
