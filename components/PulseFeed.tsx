'use client'

import React from 'react'
import { globalState } from '@/lib/state'
import { motion } from 'framer-motion'

export default function PulseFeed() {
  const [state, setState] = React.useState(globalState.get())
  React.useEffect(() => globalState.subscribe(setState), [])

  const cards = state.mood === 'focus'
    ? [
        { t: 'Study Group • Algorithms', d: 'Tonight 7pm • Library Floor 3' },
        { t: 'Mock Interview Circle', d: 'CS Dept Lab • Fri 4pm' },
      ]
    : [
        { t: 'Open Mic Night', d: 'Student Center • 8pm' },
        { t: 'Board Games Social', d: 'Dorm Lounge • 9pm' },
      ]

  return (
    <div className="mb-6">
      <div className="glass p-3 rounded-xl flex items-center gap-3 mb-3">
        <span className="text-sm text-slate-700 dark:text-slate-200">Pulse</span>
        <div className="ml-auto text-xs flex items-center gap-1">
          <button onClick={() => globalState.set({ mood: 'focus' })} className={`px-2 py-1 rounded-md ${state.mood==='focus' ? 'professional-gradient text-white' : 'border border-slate-300 dark:border-slate-600'}`}>Focus</button>
          <button onClick={() => globalState.set({ mood: 'chill' })} className={`px-2 py-1 rounded-md ${state.mood==='chill' ? 'professional-gradient text-white' : 'border border-slate-300 dark:border-slate-600'}`}>Chill</button>
        </div>
      </div>
      <div className="space-y-3">
        {cards.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-4 rounded-xl">
            <div className="font-semibold text-slate-800 dark:text-slate-100">{c.t}</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">{c.d}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}


