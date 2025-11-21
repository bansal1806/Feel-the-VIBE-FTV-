'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Sparkles, Users } from 'lucide-react'
import SwipeCard from './SwipeCard'
import PulseFeed from './PulseFeed'
import IntentPicker from './IntentPicker'
import type { FeedItem } from '@/lib/hooks/useFeed'
import { bus } from '@/lib/bus'
import { globalState } from '@/lib/state'

interface SwipeDeckProps {
  items?: FeedItem[]
  isLoading: boolean
  onSwipe: (item: FeedItem, direction: 'left' | 'right') => Promise<void> | void
}

export default function SwipeDeck({ items, isLoading, onSwipe }: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const [selected, setSelected] = useState<{ intent: 'connection' | 'event' | 'room'; payload: FeedItem } | null>(null)
  const [showSmartMatch, setShowSmartMatch] = useState(false)
  const [isProcessing, setProcessing] = useState(false)

  const feedItems = useMemo(() => items ?? [], [items])

  useEffect(() => {
    setCurrentIndex(0)
  }, [feedItems.length])

  const currentItem = feedItems.length > 0 ? feedItems[currentIndex % feedItems.length] : undefined

  const topMatches = useMemo(() => {
    return feedItems
      .filter((item): item is Extract<FeedItem, { type: 'user' }> => item.type === 'user')
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 3)
  }, [feedItems])

  const nextCard = (dir: 'left' | 'right') => {
    if (!feedItems.length) return
    setDirection(dir)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % feedItems.length)
      setDirection(null)
    }, 220)
  }

  const handleSwipe = async (dir: 'left' | 'right') => {
    if (!currentItem || isProcessing) return
    setProcessing(true)
    try {
      await onSwipe(currentItem, dir)
      if (dir === 'right') {
        handlePositiveSwipe(currentItem)
      }
    } catch (error) {
      console.error('swipe failed', error)
      bus.emit('toast', { message: 'Something went wrong. Try again.' })
    } finally {
      setProcessing(false)
      nextCard(dir)
    }
  }

  const handlePositiveSwipe = (item: FeedItem) => {
    if (item.type === 'user') {
      setSelected({ intent: 'connection', payload: item })
      bus.emit('toast', { message: `Match request sent to @${item.alias}` })
      bus.emit('action', { type: 'connect' })
      globalState.set({ credits: globalState.get().credits + 10 })
    } else if (item.type === 'event') {
      setSelected({ intent: 'event', payload: item })
      bus.emit('toast', { message: `RSVP'd to ${item.title}` })
      bus.emit('action', { type: 'rsvp' })
      globalState.set({ credits: globalState.get().credits + 4 })
    } else if (item.type === 'room') {
      setSelected({ intent: 'room', payload: item })
      bus.emit('toast', { message: `Room saved: ${item.name}` })
      setTimeout(() => bus.emit('navigate', { tab: 'rooms' }), 800)
    }
  }

  const cardsRemaining = feedItems.length > 0 ? feedItems.length - (currentIndex % feedItems.length) - 1 : 0

  return (
    <div className="space-y-6">
      <HeaderSummary matches={topMatches} onSmartMatch={() => setShowSmartMatch(true)} />

      <div className="space-y-3">
        <PulseFeed />
        <IntentPicker compact />
      </div>

      <div className="relative mx-auto h-[620px] max-w-sm">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200/80 bg-white/70 text-sm text-slate-500 shadow-inner dark:border-slate-700 dark:bg-slate-900/70">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-300 border-t-transparent" />
            Preparing your campus feed…
          </div>
        )}

        {!isLoading && currentItem && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentItem.type}-${currentItem.id}-${currentIndex}`}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.9,
                x: direction === 'left' ? -180 : direction === 'right' ? 180 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <SwipeCard item={currentItem} onSwipe={handleSwipe} />
            </motion.div>
          </AnimatePresence>
        )}

        {/* Manual Controls */}
        <div className="absolute inset-x-0 bottom-20 z-20 flex items-center justify-center gap-6">
          <SwipeControl intent="pass" onClick={() => handleSwipe('left')} disabled={isProcessing || !currentItem} />
          <SwipeControl intent="like" onClick={() => handleSwipe('right')} disabled={isProcessing || !currentItem} />
        </div>
      </div>

      <div className="text-center text-sm text-slate-500">
        {feedItems.length > 0 ? `${feedItems.length - cardsRemaining}/${feedItems.length}` : 'No new cards'}
      </div>

      <SelectionModal selection={selected} onClose={() => setSelected(null)} />
      <SmartMatchModal open={showSmartMatch} matches={topMatches} onClose={() => setShowSmartMatch(false)} />
    </div>
  )
}

function HeaderSummary({
  matches,
  onSmartMatch,
}: {
  matches: Array<Extract<FeedItem, { type: 'user' }>>
  onSmartMatch: () => void
}) {
  return (
    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white/80 p-5 shadow-lg shadow-indigo-100 ring-1 ring-indigo-50 backdrop-blur dark:bg-slate-900/70 dark:ring-slate-800/70">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Discover hyperlocal energy</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Swipe through tailored people, rooms, and moments curated for your campus flow.
          </p>
        </div>
        <button
          onClick={onSmartMatch}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <Sparkles className="h-4 w-4" />
          Smart Match
        </button>
      </div>
      {matches.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {matches.map((match) => (
            <div key={match.id} className="flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/50 px-3 py-2 text-xs font-medium text-indigo-700 shadow-sm dark:border-indigo-900/60 dark:bg-indigo-900/40 dark:text-indigo-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                {match.alias.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div>@{match.alias}</div>
                <div className="text-[10px] text-indigo-500/70">Match score {match.compatibilityScore}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function SwipeControl({
  intent,
  onClick,
  disabled,
}: {
  intent: 'like' | 'pass'
  onClick: () => void
  disabled: boolean
}) {
  const baseStyles =
    intent === 'like'
      ? 'bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-indigo-500/30'
      : 'border border-slate-200 bg-white text-slate-600 shadow-slate-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'

  return (
    <motion.button
      type="button"
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-semibold shadow-lg transition ${baseStyles} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {intent === 'like' ? <Heart className="h-7 w-7" /> : <X className="h-7 w-7" />}
    </motion.button>
  )
}

function SelectionModal({
  selection,
  onClose,
}: {
  selection: { intent: 'connection' | 'event' | 'room'; payload: FeedItem } | null
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {selection && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ y: 36, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 36, opacity: 0 }} className="relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl dark:bg-slate-900">
            {selection.intent === 'connection' && selection.payload.type === 'user' && (
              <div className="space-y-4 text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 p-2 text-white shadow-lg shadow-indigo-500/40">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Connection started</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-300">Say hi to @{selection.payload.alias} in Messages.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    bus.emit('navigate', { tab: 'chat' })
                    onClose()
                  }}
                  className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30"
                >
                  Jump to chat
                </button>
              </div>
            )}

            {selection.intent === 'event' && selection.payload.type === 'event' && (
              <div className="space-y-4 text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2 text-white shadow-lg shadow-amber-500/40">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">RSVP confirmed</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-300">We&apos;ll remind you before it starts.</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                  Got it
                </button>
              </div>
            )}

            {selection.intent === 'room' && selection.payload.type === 'room' && (
              <div className="space-y-4 text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 p-2 text-white shadow-lg shadow-sky-500/40">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Room bookmarked</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-300">Find {selection.payload.name} under Now Rooms.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    bus.emit('navigate', { tab: 'rooms' })
                    onClose()
                  }}
                  className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30"
                >
                  Go to Now Rooms
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function SmartMatchModal({
  open,
  matches,
  onClose,
}: {
  open: boolean
  matches: Array<Extract<FeedItem, { type: 'user' }>>
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
          <motion.div initial={{ y: 36, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 36, opacity: 0 }} className="relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Curated peer picks</h3>
              <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white">
                Close
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">These folks align with your focus tags and campus momentum.</p>

            <div className="mt-4 space-y-3">
              {matches.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">Keep swiping to unlock smart matches.</div>}
              {matches.map((match) => (
                <div key={match.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-lg font-semibold text-white shadow-md">
                    {match.alias.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">@{match.alias}</span>
                      <span className="text-xs text-indigo-600 dark:text-indigo-300">{match.compatibilityScore}% alignment</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      {match.sharedInterests.slice(0, 3).map((tag) => (
                        <span key={tag} className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 dark:border-slate-700 dark:bg-slate-900">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      bus.emit('navigate', { tab: 'chat' })
                      onClose()
                    }}
                    className="rounded-xl border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
                  >
                    DM
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
