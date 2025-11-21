'use client'

import { Palette, Plus, X } from 'lucide-react'
import { ProfileSection } from './ProfileSection'
import type { ProfileFormData } from './types'
import { useState } from 'react'

const HOBBIES = [
  'badminton', 'photography', 'gaming', 'content creation', 'robotics tinkering',
  'music', 'trekking', 'basketball', 'football', 'cricket', 'swimming',
  'dancing', 'singing', 'writing', 'reading', 'cooking', 'traveling'
] as const

interface HobbiesSectionProps {
  form: ProfileFormData
  onUpdate: (field: keyof ProfileFormData, value: any) => void
  isEditing: boolean
}

export function HobbiesSection({ form, onUpdate, isEditing }: HobbiesSectionProps) {
  const [customHobby, setCustomHobby] = useState('')

  const toggleHobby = (hobby: string) => {
    const current = form.hobbies || []
    if (current.includes(hobby)) {
      onUpdate('hobbies', current.filter(h => h !== hobby))
    } else {
      onUpdate('hobbies', [...current, hobby])
    }
  }

  const addCustomHobby = () => {
    if (customHobby.trim() && !form.hobbies?.includes(customHobby.trim())) {
      onUpdate('hobbies', [...(form.hobbies || []), customHobby.trim()])
      setCustomHobby('')
    }
  }

  const removeHobby = (hobby: string) => {
    onUpdate('hobbies', (form.hobbies || []).filter(h => h !== hobby))
  }

  if (!isEditing && (!form.hobbies || form.hobbies.length === 0)) {
    return null
  }

  if (!isEditing) {
    return (
      <ProfileSection icon={Palette} title="Hobbies That Matter on Campus" color="neon-yellow">
        <div className="flex flex-wrap gap-2">
          {form.hobbies.map(hobby => (
            <span
              key={hobby}
              className="rounded-full border border-neon-yellow/50 bg-neon-yellow/10 px-3 py-1 text-xs text-neon-yellow uppercase tracking-[0.1em]"
            >
              {hobby}
            </span>
          ))}
        </div>
      </ProfileSection>
    )
  }

  return (
    <ProfileSection icon={Palette} title="Hobbies That Matter on Campus" color="neon-yellow">
      <div className="space-y-3">
        <p className="text-xs text-white/60 mb-3">
          Not time-pass stuff — those which can trigger real interactions and convert into micro-communities.
        </p>
        <div className="flex flex-wrap gap-2">
          {HOBBIES.map(hobby => (
            <button
              key={hobby}
              type="button"
              onClick={() => toggleHobby(hobby)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition ${
                form.hobbies?.includes(hobby)
                  ? 'border-neon-yellow bg-neon-yellow/20 text-neon-yellow'
                  : 'border-white/20 bg-black-deep/50 text-white/60 hover:border-neon-yellow/50'
              }`}
            >
              {hobby}
            </button>
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={customHobby}
            onChange={(e) => setCustomHobby(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCustomHobby()
              }
            }}
            placeholder="Add custom hobby (e.g., gaming: FPS, MOBA)"
            className="flex-1 rounded-xl border border-neon-yellow/30 bg-black-deep/80 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-neon-yellow focus:ring-2 focus:ring-neon-yellow/20"
          />
          <button
            type="button"
            onClick={addCustomHobby}
            className="rounded-xl border border-neon-yellow/30 bg-neon-yellow/10 px-4 py-2 text-sm font-semibold text-neon-yellow hover:bg-neon-yellow/20 transition"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {form.hobbies && form.hobbies.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
            {form.hobbies
              .filter(h => !HOBBIES.includes(h as any))
              .map(hobby => (
                <span
                  key={hobby}
                  className="inline-flex items-center gap-1 rounded-full border border-neon-yellow/30 bg-neon-yellow/10 px-2 py-1 text-xs text-neon-yellow"
                >
                  {hobby}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeHobby(hobby)}
                      className="hover:text-neon-yellow/60"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
          </div>
        )}
      </div>
    </ProfileSection>
  )
}

