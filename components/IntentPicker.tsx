'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, Flame, MessageSquare, GraduationCap, Users, Heart } from 'lucide-react'
import { type Intent, globalState } from '@/lib/state'

const INTENT_CONFIG: Record<Intent, { label: string; icon: React.ReactNode; color: string; glow: string }> = {
  collab: { 
    label: 'Collaborate', 
    icon: <Flame className="h-4 w-4" />, 
    color: 'text-neon-cyan',
    glow: 'shadow-neon-cyan/20'
  },
  study: { 
    label: 'Study Solo/Group', 
    icon: <GraduationCap className="h-4 w-4" />, 
    color: 'text-neon-yellow',
    glow: 'shadow-neon-yellow/20'
  },
  social: { 
    label: 'Socialize', 
    icon: <Users className="h-4 w-4" />, 
    color: 'text-neon-green',
    glow: 'shadow-neon-green/20'
  },
  dating: { 
    label: 'Find Dates', 
    icon: <Heart className="h-4 w-4" />, 
    color: 'text-neon-pink',
    glow: 'shadow-neon-pink/20'
  },
  mentor: { 
    label: 'Mentor/Be Mentored', 
    icon: <MessageSquare className="h-4 w-4" />, 
    color: 'text-neon-purple',
    glow: 'shadow-neon-purple/20'
  },
}

export default function IntentPicker({ compact = false }: { compact?: boolean }) {
  const [state, setState] = React.useState(() => {
    const s = globalState.get()
    return { ...s, intents: (s.intents ?? []) as Intent[] }
  })

  React.useEffect(() => {
    const unsubscribe = globalState.subscribe((s) => setState({ ...s, intents: (s.intents ?? []) as Intent[] }))
    return () => {
      unsubscribe()
    }
  }, [])

  const toggle = (key: Intent) => {
    const current = state.intents ?? []
    const next = new Set<Intent>(current)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    globalState.set({ ...globalState.get(), intents: Array.from(next) })
  }

  return (
    <div className="space-y-3">
      {!compact && (
        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block">YOUR CAMPUS INTENT</label>
      )}
      <div className="flex flex-wrap gap-3">
        {(Object.keys(INTENT_CONFIG) as Intent[]).map((key) => {
          const active = (state.intents ?? []).includes(key)
          const config = INTENT_CONFIG[key]
          
          return (
            <motion.button
              key={key}
              type="button"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggle(key)}
              className={`
                relative flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm font-black transition-all duration-300
                ${active 
                  ? `bg-white border-white text-black shadow-xl ${config.glow}` 
                  : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10 hover:text-white'
                }
                ${compact ? 'py-2 px-4 text-xs' : ''}
              `}
            >
              <div className={`transition-colors ${active ? 'text-black' : config.color}`}>
                {config.icon}
              </div>
              <span className="tracking-tight">{config.label}</span>
              {active && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-black text-white"
                >
                  <Check className="h-2 w-2" strokeWidth={4} />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}


