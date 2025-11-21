'use client'

import React from 'react'
import { globalState, type Intent } from '@/lib/state'

type IntentOption = {
  key: Intent
  label: string
}

const ALL: IntentOption[] = [
  { key: 'collab', label: 'Collab' },
  { key: 'study', label: 'Study' },
  { key: 'social', label: 'Social' },
  { key: 'dating', label: 'Dating‑lite' },
  { key: 'mentor', label: 'Mentor' },
]

export default function IntentPicker({ compact = false }: { compact?: boolean }) {
  const [state, setState] = React.useState(() => {
    const s = globalState.get()
    return { ...s, intents: s.intents ?? [] }
  })
  React.useEffect(() => {
    const unsubscribe = globalState.subscribe((s) => setState({ ...s, intents: s.intents ?? [] }))
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
    globalState.set({ intents: Array.from(next) })
  }

  return (
    <div className={`glass ${compact ? 'p-2' : 'p-3'} rounded-xl flex items-center gap-2 flex-wrap`}>
      <span className="text-xs text-slate-700 dark:text-slate-200">Intents</span>
      {ALL.map((i) => (
        <button
          key={i.key}
          onClick={() => toggle(i.key)}
          className={`text-xs px-2 py-1 rounded-md border ${
            (state.intents ?? []).includes(i.key)
              ? 'border-blue-600 text-blue-700 bg-blue-50'
              : 'border-slate-300 dark:border-slate-600'
          }`}
        >
          {i.label}
        </button>
      ))}
    </div>
  )
}


