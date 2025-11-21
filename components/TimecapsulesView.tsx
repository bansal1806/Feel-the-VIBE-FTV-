'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarClock, Lock, Send, Sparkle, BookOpen, X } from 'lucide-react'
import { useCreateTimecapsule, useTimecapsules, type TimecapsulePayload } from '@/lib/hooks/useTimecapsules'
import { formatDistanceFromNow, formatDistanceToNow } from '@/lib/utils/time'
import { bus } from '@/lib/bus'
import { createPortal } from 'react-dom'

export default function TimecapsulesView() {
  const { data, isLoading } = useTimecapsules()
  const capsules = useMemo(() => data ?? [], [data])
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'published'>('all')
  const [isCreateOpen, setCreateOpen] = useState(false)

  const filteredCapsules = useMemo(() => {
    const now = Date.now()
    return capsules.filter((capsule) => {
      if (filter === 'upcoming') return new Date(capsule.unlockAt).getTime() > now
      if (filter === 'published') return capsule.isPublished
      return true
    })
  }, [capsules, filter])

  return (
    <div className="space-y-6">
      <Hero />

      <FilterTabs active={filter} onChange={setFilter} />

      {isLoading && <CapsuleSkeleton />}

      {!isLoading && filteredCapsules.length === 0 && <EmptyCapsules />}

      <div className="space-y-4">
        {filteredCapsules.map((capsule) => (
          <CapsuleCard key={capsule.id} capsule={capsule} />
        ))}
      </div>

      <CreateCard onClick={() => setCreateOpen(true)} />
      <CreateDialog open={isCreateOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}

function Hero() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: -10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="glass-neon rounded-3xl border border-neon-cyan/30 p-6 shadow-neon-cyan"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold gradient-text">Timecapsules</h2>
          <p className="text-sm text-white/60 mt-1">
            Seniors leave strategy, context, and campus secrets that unlock for the next cohort.
          </p>
        </div>
        <div className="rounded-2xl border border-neon-purple/30 bg-neon-purple/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-neon-purple">
          Semester legacy archive
        </div>
      </div>
    </motion.section>
  )
}

function FilterTabs({ active, onChange }: { active: 'all' | 'upcoming' | 'published'; onChange: (value: 'all' | 'upcoming' | 'published') => void }) {
  const tabs: Array<{ value: typeof active; label: string; activeClasses: string }> = [
    { 
      value: 'all', 
      label: 'All Capsules', 
      activeClasses: 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan shadow-neon-cyan' 
    },
    { 
      value: 'upcoming', 
      label: 'Unlocking Soon', 
      activeClasses: 'border-neon-yellow/50 bg-neon-yellow/10 text-neon-yellow shadow-neon-yellow' 
    },
    { 
      value: 'published', 
      label: 'Published', 
      activeClasses: 'border-neon-green/50 bg-neon-green/10 text-neon-green shadow-neon-green' 
    },
  ]
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {tabs.map((tab) => {
        const isActive = active === tab.value
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
              isActive
                ? tab.activeClasses
                : 'border-white/10 bg-black-deep/50 text-white/60 hover:border-neon-cyan/30 hover:bg-neon-cyan/5 hover:text-white/80'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

function CapsuleCard({ capsule }: { capsule: TimecapsulePayload }) {
  const isLocked = new Date(capsule.unlockAt).getTime() > Date.now()
  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="glass-neon overflow-hidden rounded-3xl border border-neon-cyan/30 shadow-neon-cyan"
    >
      <div className="relative h-48">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: capsule.coverImage
              ? `url(${capsule.coverImage})`
              : 'linear-gradient(135deg, rgba(0, 255, 240, 0.4), rgba(255, 0, 150, 0.4))',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black-pure/90 via-black-pure/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/70">
            <span className="rounded-full border border-neon-purple/50 bg-neon-purple/20 px-2 py-0.5 text-neon-purple">
              {capsule.audience}
            </span>
            <span>• Unlocks {formatDistanceFromNow(capsule.unlockAt)}</span>
          </div>
          <h3 className="mt-2 text-xl font-semibold leading-tight gradient-text">{capsule.title}</h3>
          {capsule.description && <p className="mt-1 text-sm text-white/80 line-clamp-2">{capsule.description}</p>}
        </div>
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black-pure/70 backdrop-blur-sm border border-neon-yellow/30">
            <div className="text-center text-white">
              <Lock className="mx-auto h-12 w-12 text-neon-yellow mb-3" />
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-neon-yellow">Unlocks soon</p>
              <p className="mt-1 text-xs text-white/60">{formatDistanceFromNow(capsule.unlockAt)}</p>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neon-cyan/20 bg-black-deep/50 px-4 py-3 text-xs uppercase tracking-[0.18em] text-white/60">
        <div className="flex items-center gap-2">
          {capsule.creator.avatarUrl ? (
            <img
              src={capsule.creator.avatarUrl}
              alt={capsule.creator.alias}
              className="h-6 w-6 rounded-full object-cover border border-neon-cyan/30"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-neon-pink to-neon-purple text-[10px] font-bold text-black-pure">
              {capsule.creator.alias.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span>By @{capsule.creator.alias}</span>
        </div>
        <span>Created {formatDistanceToNow(capsule.createdAt)}</span>
      </div>
      <div className="space-y-3 px-4 py-4">
        {capsule.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {capsule.tags.slice(0, 5).map((tag) => (
              <span 
                key={tag} 
                className="rounded-full border border-neon-cyan/50 bg-neon-cyan/10 px-3 py-1 text-xs text-neon-cyan uppercase tracking-[0.1em]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        {capsule.contributions.length > 0 && (
          <div className="rounded-2xl border border-neon-purple/30 bg-neon-purple/10 p-3">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neon-purple mb-2">Contributors</div>
            <div className="flex flex-wrap gap-2">
              {capsule.contributions.map((contribution) => (
                <span 
                  key={contribution.id} 
                  className="rounded-xl border border-neon-purple/30 bg-neon-purple/10 px-3 py-1 text-xs text-neon-purple"
                >
                  @{contribution.contributor.alias}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function CreateCard({ onClick }: { onClick: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="glass-neon rounded-3xl border border-neon-purple/30 bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 p-6 shadow-neon-purple"
    >
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-black-deep/80 p-3 text-neon-purple border border-neon-purple/30">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Create your capsule</h3>
            <p className="text-xs text-white/60 mt-1">
              Package your semester learnings, resources, and intros for the next class.
            </p>
          </div>
        </div>
        <button 
          onClick={onClick} 
          className="inline-flex items-center gap-2 rounded-2xl neon-gradient-pink-purple px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black-pure shadow-neon-pink hover:opacity-90 transition"
        >
          <Sparkle className="h-4 w-4" />
          Start crafting
        </button>
      </div>
    </motion.div>
  )
}

function CreateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createMutation = useCreateTimecapsule()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [unlockAt, setUnlockAt] = useState(() => {
    const date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    return date.toISOString().slice(0, 16)
  })
  const [audience, setAudience] = useState<'campus' | 'class' | 'friends' | 'public'>('campus')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !unlockAt) {
      bus.emit('toast', { message: 'Please fill in all required fields' })
      return
    }
    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        unlockAt: new Date(unlockAt).toISOString(),
        audience,
        isPublished: true,
        tags,
      })
      setTitle('')
      setDescription('')
      setTags([])
      setTagInput('')
      onClose()
      bus.emit('toast', { message: 'Timecapsule created successfully!' })
    } catch {
      // Error handled by mutation
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 16) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  return (
    typeof window !== 'undefined' && createPortal(
      <AnimatePresence>
        {open && (
          <motion.div 
            className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black-pure/80 backdrop-blur-sm" onClick={onClose} />
            <motion.div 
              initial={{ y: 40, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 40, opacity: 0 }} 
              className="relative z-[101] w-full max-w-md rounded-t-3xl bg-black-deep border border-neon-purple/30 p-6 shadow-neon-purple sm:rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold gradient-text">New timecapsule</h3>
                <button 
                  onClick={onClose} 
                  className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Title <span className="text-neon-pink">*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    minLength={3}
                    maxLength={160}
                    value={title} 
                    onChange={(event) => setTitle(event.target.value)} 
                    placeholder="e.g., CS 101 Survival Guide"
                    className="w-full rounded-xl border border-neon-cyan/30 bg-black-deep/80 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
                  <textarea 
                    maxLength={800}
                    value={description} 
                    onChange={(event) => setDescription(event.target.value)} 
                    rows={4} 
                    placeholder="Share your insights, tips, and resources..."
                    className="w-full rounded-xl border border-neon-cyan/30 bg-black-deep/80 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none transition resize-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Unlock date <span className="text-neon-pink">*</span>
                  </label>
                  <input 
                    type="datetime-local" 
                    required
                    value={unlockAt} 
                    onChange={(event) => setUnlockAt(event.target.value)} 
                    className="w-full rounded-xl border border-neon-cyan/30 bg-black-deep/80 px-4 py-2 text-sm text-white outline-none transition focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Audience</label>
                  <select 
                    value={audience} 
                    onChange={(event) => setAudience(event.target.value as typeof audience)} 
                    className="w-full rounded-xl border border-neon-cyan/30 bg-black-deep/80 px-4 py-2 text-sm text-white outline-none transition focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20"
                  >
                    <option value="campus">Campus</option>
                    <option value="class">Class year</option>
                    <option value="friends">Friends</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Tags (optional)</label>
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
                      maxLength={32}
                      className="flex-1 rounded-xl border border-neon-cyan/30 bg-black-deep/80 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      disabled={tags.length >= 16}
                      className="rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 px-4 py-2 text-sm font-semibold text-neon-cyan transition hover:bg-neon-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
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
                  {tags.length >= 16 && (
                    <p className="text-xs text-white/40 mt-1">Maximum 16 tags</p>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-white/20 bg-black-deep/50 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-black-deep/70"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || !title.trim()}
                    className="inline-flex items-center gap-2 rounded-xl neon-gradient-pink-purple px-4 py-2 text-sm font-semibold text-black-pure shadow-neon-pink transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {createMutation.isPending ? 'Publishing…' : 'Publish capsule'}
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )
  )
}

function CapsuleSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1].map((index) => (
        <div key={index} className="h-56 animate-pulse rounded-3xl bg-black-deep/50 border border-white/10" />
      ))}
    </div>
  )
}

function EmptyCapsules() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="glass-neon rounded-3xl border border-dashed border-neon-cyan/30 p-16 text-center"
    >
      <CalendarClock className="mx-auto h-12 w-12 text-neon-cyan/50 mb-4" />
      <p className="text-sm font-semibold text-white/80">No capsules in this view yet.</p>
      <p className="mt-2 text-xs text-white/40">Be the first to leave behind a blueprint.</p>
    </motion.div>
  )
}

