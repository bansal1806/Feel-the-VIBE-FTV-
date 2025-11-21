'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Plus, Users, Calendar, Zap, X, Share2 } from 'lucide-react'
import { useEvents, useCreateEvent, type EventPayload } from '@/lib/hooks/useEvents'
import { useFeed } from '@/lib/hooks/useFeed'
import { useRooms } from '@/lib/hooks/useRooms'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bus } from '@/lib/bus'

function formatRelativeTime(startTime: string): string {
  const now = new Date()
  const start = new Date(startTime)
  const diffMs = start.getTime() - now.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  
  if (diffMins < 0) return 'Now'
  if (diffMins < 1) return 'Now'
  if (diffMins < 60) return `${diffMins} min`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d`
}

function getEventType(category: string): 'event' | 'meetup' | 'hotspot' {
  if (category === 'SOCIAL') return 'meetup'
  if (category === 'ACADEMIC') return 'event'
  return 'event'
}

export default function HLRView() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: 'OTHER' as EventPayload['category'],
    startTime: '',
    endTime: '',
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState('')
  
  const { data: events = [], isLoading: eventsLoading } = useEvents()
  const { data: feedItems = [] } = useFeed()
  const { data: rooms = [] } = useRooms()
  const createEventMutation = useCreateEvent()
  const queryClient = useQueryClient()

  // Calculate stats
  const activeEvents = events.filter(e => {
    const start = new Date(e.startTime)
    const now = new Date()
    return start.getTime() >= now.getTime() - 1000 * 60 * 60 * 24 // Within last 24 hours or future
  })
  const nearbyUsers = feedItems.filter(item => item.type === 'user' && item.proximity).length
  const hotspots = rooms.filter(r => r.active).length

  // Join event mutation
  const joinEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch('/api/swipes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'EVENT',
          targetId: eventId,
          direction: 'LIKE',
        }),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to join event' }))
        throw new Error(error.error ?? 'Failed to join event')
      }
      return response.json()
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['events'] })
      void queryClient.invalidateQueries({ queryKey: ['feed'] })
      bus.emit('toast', { message: 'Joined event successfully!' })
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to join event'
      bus.emit('toast', { message })
    },
  })

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Convert datetime-local format to ISO string
      const startTimeISO = formData.startTime 
        ? new Date(formData.startTime).toISOString()
        : new Date().toISOString()
      const endTimeISO = formData.endTime 
        ? new Date(formData.endTime).toISOString()
        : null

      await createEventMutation.mutateAsync({
        title: formData.title,
        description: formData.description || null,
        location: formData.location,
        category: formData.category,
        startTime: startTimeISO,
        endTime: endTimeISO,
        tags: formData.tags,
      })
      setShowCreateModal(false)
      setFormData({
        title: '',
        description: '',
        location: '',
        category: 'OTHER',
        startTime: '',
        endTime: '',
        tags: [],
      })
      bus.emit('toast', { message: 'Event created successfully!' })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleInvite = (event: EventPayload) => {
    const url = `${window.location.origin}/app/events/${event.id}`
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Join me at ${event.title}!`,
        url,
      }).catch(() => {
        navigator.clipboard.writeText(url)
        bus.emit('toast', { message: 'Event link copied to clipboard!' })
      })
    } else {
      navigator.clipboard.writeText(url)
      bus.emit('toast', { message: 'Event link copied to clipboard!' })
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
  }

  const getEventColorClasses = (type: string) => {
    switch (type) {
      case 'event':
        return {
          border: 'border-neon-blue/30 hover:border-neon-blue/50',
          badge: 'border-neon-blue/50 bg-neon-blue/10 text-neon-blue',
        }
      case 'meetup':
        return {
          border: 'border-neon-pink/30 hover:border-neon-pink/50',
          badge: 'border-neon-pink/50 bg-neon-pink/10 text-neon-pink',
        }
      case 'hotspot':
        return {
          border: 'border-neon-yellow/30 hover:border-neon-yellow/50',
          badge: 'border-neon-yellow/50 bg-neon-yellow/10 text-neon-yellow',
        }
      default:
        return {
          border: 'border-neon-cyan/30 hover:border-neon-cyan/50',
          badge: 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan',
        }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-neon rounded-3xl p-6 border border-neon-cyan/30"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold gradient-text">HyperLocal Radar</h2>
            <p className="text-sm text-white/60 mt-1">Real-time campus activity around you</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl border border-neon-green bg-neon-green/10 px-4 py-2 text-sm font-semibold text-neon-green transition hover:bg-neon-green/20 neon-glow-green"
          >
            <Plus className="h-4 w-4" />
            Create Event
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="rounded-xl border border-neon-blue/30 bg-neon-blue/10 p-3">
            <div className="text-xs text-neon-blue/80 mb-1">Active Events</div>
            <div className="text-2xl font-bold text-neon-blue">{eventsLoading ? '...' : activeEvents.length}</div>
          </div>
          <div className="rounded-xl border border-neon-pink/30 bg-neon-pink/10 p-3">
            <div className="text-xs text-neon-pink/80 mb-1">Nearby Users</div>
            <div className="text-2xl font-bold text-neon-pink">{nearbyUsers}</div>
          </div>
          <div className="rounded-xl border border-neon-yellow/30 bg-neon-yellow/10 p-3">
            <div className="text-xs text-neon-yellow/80 mb-1">Hotspots</div>
            <div className="text-2xl font-bold text-neon-yellow">{hotspots}</div>
          </div>
        </div>
      </motion.div>

      {/* Real-time Popups */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-neon-yellow" />
          Live Activity
        </h3>
        {eventsLoading ? (
          <div className="glass-neon rounded-2xl p-5 border border-neon-cyan/30 text-center text-white/60">
            Loading events...
          </div>
        ) : activeEvents.length === 0 ? (
          <div className="glass-neon rounded-2xl p-5 border border-neon-cyan/30 text-center text-white/60">
            No active events nearby. Create one to get started!
          </div>
        ) : (
          activeEvents.map((event) => {
            const eventType = getEventType(event.category)
            const colorClasses = getEventColorClasses(eventType)
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`glass-neon rounded-2xl p-5 border ${colorClasses.border} transition`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-bold text-white">{event.title}</h4>
                      <span className={`rounded-full border ${colorClasses.badge} px-2 py-1 text-xs font-semibold`}>
                        {eventType}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatRelativeTime(event.startTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event.rsvpCount}
                      </span>
                    </div>
                  </div>
                  {event.distance && (
                    <div className="text-right">
                      <div className="text-sm font-semibold text-neon-cyan">{event.distance}</div>
                      <div className="text-xs text-white/40">away</div>
                    </div>
                  )}
                </div>

                {event.tags && event.tags.length > 0 && (
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-2 py-1 text-xs text-neon-cyan"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => joinEventMutation.mutate(event.id)}
                    disabled={event.isGoing || joinEventMutation.isPending}
                    className={`flex-1 rounded-xl border border-neon-green bg-neon-green/10 px-4 py-2 text-sm font-semibold text-neon-green transition hover:bg-neon-green/20 ${
                      event.isGoing ? 'opacity-50 cursor-not-allowed' : ''
                    } ${joinEventMutation.isPending ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {event.isGoing ? 'Joined' : joinEventMutation.isPending ? 'Joining...' : 'Join'}
                  </button>
                  <button
                    onClick={() => handleInvite(event)}
                    className="flex-1 rounded-xl border border-neon-purple bg-neon-purple/10 px-4 py-2 text-sm font-semibold text-neon-purple transition hover:bg-neon-purple/20 flex items-center justify-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Invite
                  </button>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black-pure/80 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              className="relative w-full max-w-md rounded-3xl bg-black-deep border border-neon-green/30 p-6 shadow-neon-green"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold gradient-text">Create Event</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Event Title</label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={120}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Study Session @ Library"
                    className="w-full rounded-xl border border-neon-cyan/30 bg-black-deep/50 px-4 py-2 text-white placeholder:text-white/40 focus:border-neon-cyan focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Description (optional)</label>
                  <textarea
                    maxLength={600}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your event..."
                    rows={3}
                    className="w-full rounded-xl border border-neon-cyan/30 bg-black-deep/50 px-4 py-2 text-white placeholder:text-white/40 focus:border-neon-cyan focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as EventPayload['category'] })}
                    className="w-full rounded-xl border border-neon-cyan/30 bg-black-deep/50 px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                  >
                    <option value="SOCIAL">Social</option>
                    <option value="ACADEMIC">Academic</option>
                    <option value="CAREER">Career</option>
                    <option value="WELLNESS">Wellness</option>
                    <option value="SPORTS">Sports</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Location</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={160}
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Main Library, 2nd Floor"
                    className="w-full rounded-xl border border-neon-cyan/30 bg-black-deep/50 px-4 py-2 text-white placeholder:text-white/40 focus:border-neon-cyan focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full rounded-xl border border-neon-cyan/30 bg-black-deep/50 px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">End Time (optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full rounded-xl border border-neon-cyan/30 bg-black-deep/50 px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag()
                        }
                      }}
                      placeholder="Add a tag and press Enter"
                      className="flex-1 rounded-xl border border-neon-cyan/30 bg-black-deep/50 px-4 py-2 text-white placeholder:text-white/40 focus:border-neon-cyan focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 px-4 py-2 text-sm font-semibold text-neon-cyan transition hover:bg-neon-cyan/20"
                    >
                      Add
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-2 py-1 text-xs text-neon-cyan"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-neon-cyan/60"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={createEventMutation.isPending}
                  className="w-full rounded-xl border border-neon-green bg-neon-green/10 px-4 py-2 text-sm font-semibold text-neon-green transition hover:bg-neon-green/20 neon-glow-green disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createEventMutation.isPending ? 'Creating...' : 'Create & Share'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

