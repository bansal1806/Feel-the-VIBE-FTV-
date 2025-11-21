'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Users, Sparkles, Zap } from 'lucide-react'
import SwipeDeck from './SwipeDeck'
import type { FeedItem } from '@/lib/hooks/useFeed'
import { globalState } from '@/lib/state'
import { bus } from '@/lib/bus'

interface HomePageProps {
  items?: FeedItem[]
  isLoading: boolean
  onSwipe: (item: FeedItem, direction: 'left' | 'right') => Promise<void> | void
}

export default function HomePage({ items, isLoading, onSwipe }: HomePageProps) {
  const feedItems = items ?? []
  const [mood, setMood] = useState(globalState.get().mood || 'chill')
  
  // Update global state when mood changes
  const handleMoodChange = (newMood: 'focus' | 'chill' | 'social' | 'creative') => {
    setMood(newMood)
    globalState.set({ mood: newMood })
  }

  // Filter events and users based on mood
  const nearbyEvents = useMemo(() => {
    return (feedItems ?? []).filter((item): item is Extract<FeedItem, { type: 'event' }> => 
      item.type === 'event'
    ).slice(0, 3)
  }, [feedItems])

  const matchingPeople = useMemo(() => {
    return (feedItems ?? []).filter((item): item is Extract<FeedItem, { type: 'user' }> => 
      item.type === 'user'
    ).sort((a, b) => b.compatibilityScore - a.compatibilityScore).slice(0, 3)
  }, [feedItems])

  const moodEmojis = {
    focus: '🎯',
    chill: '😌',
    social: '🎉',
    creative: '✨',
  }

  // const moodColors = {
  //   focus: 'neon-green',
  //   chill: 'neon-blue',
  //   social: 'neon-pink',
  //   creative: 'neon-purple',
  // }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Left Panel - Mood, Events, Matching People */}
      <aside className="w-full space-y-4 lg:w-80 lg:shrink-0">
        {/* Mood/Vibe Selector */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-neon rounded-3xl p-6 border border-neon-cyan/30"
        >
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-neon-yellow" />
            <h3 className="text-lg font-semibold text-white">Your Vibe</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(['focus', 'chill', 'social', 'creative'] as const).map((m) => {
              const getMoodClasses = () => {
                if (mood !== m) return 'border-white/10 bg-black-deep/30 text-white/60 hover:border-white/20'
                switch (m) {
                  case 'focus':
                    return 'border-neon-green/50 bg-neon-green/20 text-neon-green shadow-neon-green'
                  case 'chill':
                    return 'border-neon-blue/50 bg-neon-blue/20 text-neon-blue shadow-neon-blue'
                  case 'social':
                    return 'border-neon-pink/50 bg-neon-pink/20 text-neon-pink shadow-neon-pink'
                  case 'creative':
                    return 'border-neon-purple/50 bg-neon-purple/20 text-neon-purple shadow-neon-purple'
                  default:
                    return 'border-white/10 bg-black-deep/30 text-white/60'
                }
              }
              return (
                <button
                  key={m}
                  onClick={() => handleMoodChange(m)}
                  className={`rounded-xl border p-4 text-center transition ${getMoodClasses()}`}
                >
                  <div className="text-2xl mb-1">{moodEmojis[m]}</div>
                  <div className="text-xs font-semibold capitalize">{m}</div>
                </button>
              )
            })}
          </div>
          <div className="mt-4 rounded-xl border border-neon-cyan/20 bg-neon-cyan/10 p-3">
            <div className="text-xs text-neon-cyan/80 mb-1">Current Mood</div>
            <div className="text-lg font-bold text-neon-cyan capitalize">{mood}</div>
          </div>
        </motion.div>

        {/* Nearby Events */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-neon rounded-3xl p-6 border border-neon-pink/30"
        >
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-neon-pink" />
            <h3 className="text-lg font-semibold text-white">Nearby Events</h3>
          </div>
          <div className="space-y-3">
            {nearbyEvents.length > 0 ? (
              nearbyEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl border border-neon-pink/20 bg-neon-pink/10 p-3 hover:border-neon-pink/40 transition cursor-pointer"
                  onClick={() => bus.emit('navigate', { tab: 'hlr' })}
                >
                  <div className="font-semibold text-white text-sm mb-1">{event.title}</div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <MapPin className="h-3 w-3" />
                    <span>{event.distance || 'Nearby'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60 mt-1">
                    <Users className="h-3 w-3" />
                    <span>{event.rsvpCount} going</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-white/10 bg-black-deep/30 p-4 text-center text-sm text-white/40">
                No events nearby
              </div>
            )}
          </div>
        </motion.div>

        {/* Matching People */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-neon rounded-3xl p-6 border border-neon-green/30"
        >
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-neon-green" />
            <h3 className="text-lg font-semibold text-white">Matching Your Vibe</h3>
          </div>
          <div className="space-y-3">
            {matchingPeople.length > 0 ? (
              matchingPeople.map((person) => (
                <div
                  key={person.id}
                  className="rounded-xl border border-neon-green/20 bg-neon-green/10 p-3 hover:border-neon-green/40 transition cursor-pointer"
                  onClick={() => {
                    // Navigate to their profile or start chat
                    bus.emit('navigate', { tab: 'chat' })
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-green to-neon-cyan text-sm font-bold text-black-pure">
                      {person.alias.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm">@{person.alias}</div>
                      <div className="text-xs text-neon-green">
                        {person.compatibilityScore}% match
                      </div>
                    </div>
                  </div>
                  {person.headline && (
                    <div className="mt-2 text-xs text-white/60 line-clamp-1">{person.headline}</div>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-white/10 bg-black-deep/30 p-4 text-center text-sm text-white/40">
                Keep swiping to find matches
              </div>
            )}
          </div>
        </motion.div>
      </aside>

      {/* Main Feed - Swipe Deck */}
      <div className="flex-1">
        <SwipeDeck items={feedItems} isLoading={isLoading} onSwipe={onSwipe} />
      </div>
    </div>
  )
}

