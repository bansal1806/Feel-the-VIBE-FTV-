'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Target } from 'lucide-react'
import { globalState } from '@/lib/state'

export default function SeekingEditor() {
  const [state, setState] = React.useState(globalState.get())
  const [draft, setDraft] = React.useState('')
  
  React.useEffect(() => globalState.subscribe(setState), [])

  const add = () => {
    const val = draft.trim()
    if (!val) return
    const current = state.seeking ?? []
    const set = new Set(current)
    set.add(val)
    globalState.set({ ...globalState.get(), seeking: Array.from(set) })
    setDraft('')
  }

  const remove = (s: string) => {
    globalState.set({ ...globalState.get(), seeking: (state.seeking ?? []).filter((x) => x !== s) })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 group">
           <div className="absolute inset-y-0 left-4 flex items-center text-white/20 group-focus-within:text-neon-cyan transition-colors">
              <Target className="h-4 w-4" />
           </div>
           <input 
            value={draft} 
            onChange={(e) => setDraft(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && add()}
            className="w-full rounded-2xl border border-white/5 bg-white/5 py-3 pl-12 pr-4 text-sm font-medium text-white placeholder:text-white/20 outline-none ring-neon-cyan/20 transition-all focus:border-neon-cyan/50 focus:bg-white/10 focus:ring-4" 
            placeholder="Search for collaborators..." 
          />
        </div>
        <button 
          onClick={add} 
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[40px]">
        <AnimatePresence mode="popLayout">
          {(state.seeking ?? []).map((s) => (
            <motion.span 
              key={s} 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-4 pr-2 text-xs font-bold text-white transition-colors hover:border-neon-cyan/50 hover:bg-white/10"
            >
              <span className="tracking-tight">{s}</span>
              <button 
                onClick={() => remove(s)} 
                className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5 text-white/40 hover:bg-white/20 hover:text-white transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        
        {(state.seeking?.length ?? 0) === 0 && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            className="text-xs font-medium text-white/50 italic py-2"
          >
            No skills broadcasting yet...
          </motion.span>
        )}
      </div>
    </div>
  )
}


