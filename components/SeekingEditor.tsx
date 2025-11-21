'use client'

import React from 'react'
import { globalState } from '@/lib/state'

export default function SeekingEditor() {
  const [state, setState] = React.useState(globalState.get())
  const [draft, setDraft] = React.useState('')
  React.useEffect(() => globalState.subscribe(setState), [])

  const add = () => {
    const val = draft.trim()
    if (!val) return
    const set = new Set(state.seeking)
    set.add(val)
    globalState.set({ seeking: Array.from(set) })
    setDraft('')
  }

  const remove = (s: string) => {
    globalState.set({ seeking: state.seeking.filter((x) => x !== s) })
  }

  return (
    <div className="glass p-2 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} className="flex-1 px-2 py-1 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Add skill e.g., UI/UX" />
        <button onClick={add} className="text-xs px-2 py-1 rounded-md professional-gradient text-white">Add</button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {(state.seeking ?? []).map((s) => (
          <span key={s} className="text-xs px-2 py-1 rounded-md border border-blue-600 text-blue-700 bg-blue-50">
            {s}
            <button onClick={() => remove(s)} className="ml-1 text-slate-500">×</button>
          </span>
        ))}
        {(state.seeking?.length ?? 0) === 0 && <span className="text-xs text-slate-500">No skills added</span>}
      </div>
    </div>
  )
}


