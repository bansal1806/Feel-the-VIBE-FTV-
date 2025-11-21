'use client'

import { Code, Plus, X } from 'lucide-react'
import { ProfileSection } from './ProfileSection'
import type { ProfileFormData } from './types'
import { useState } from 'react'

const TECH_INTERESTS = [
  'AI/ML', 'hardware hacking', 'UI/UX', 'finance', 'startups', 'anime',
  'sci-fi', 'web dev', 'mobile dev', 'blockchain', 'cybersecurity',
  'data science', 'game dev', 'AR/VR', 'IoT', 'cloud computing'
] as const

interface TechInterestsSectionProps {
  form: ProfileFormData
  onUpdate: (field: keyof ProfileFormData, value: any) => void
  isEditing: boolean
}

export function TechInterestsSection({ form, onUpdate, isEditing }: TechInterestsSectionProps) {
  const [customInterest, setCustomInterest] = useState('')

  const toggleInterest = (interest: string) => {
    const current = form.techInterests || []
    if (current.includes(interest)) {
      onUpdate('techInterests', current.filter(t => t !== interest))
    } else {
      onUpdate('techInterests', [...current, interest])
    }
  }

  const addCustomInterest = () => {
    if (customInterest.trim() && !form.techInterests?.includes(customInterest.trim())) {
      onUpdate('techInterests', [...(form.techInterests || []), customInterest.trim()])
      setCustomInterest('')
    }
  }

  const removeInterest = (interest: string) => {
    onUpdate('techInterests', (form.techInterests || []).filter(t => t !== interest))
  }

  if (!isEditing && (!form.techInterests || form.techInterests.length === 0)) {
    return null
  }

  if (!isEditing) {
    return (
      <ProfileSection icon={Code} title="Favorite Tech & Creative Interests" color="neon-cyan">
        <div className="flex flex-wrap gap-2">
          {form.techInterests.map(interest => (
            <span
              key={interest}
              className="rounded-full border border-neon-cyan/50 bg-neon-cyan/10 px-3 py-1 text-xs text-neon-cyan uppercase tracking-[0.1em]"
            >
              {interest}
            </span>
          ))}
        </div>
      </ProfileSection>
    )
  }

  return (
    <ProfileSection icon={Code} title="Favorite Tech & Creative Interests" color="neon-cyan">
      <div className="space-y-3">
        <p className="text-xs text-white/60 mb-3">
          These make conversations easier and build instant rapport.
        </p>
        <div className="flex flex-wrap gap-2">
          {TECH_INTERESTS.map(interest => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition ${
                form.techInterests?.includes(interest)
                  ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan'
                  : 'border-white/20 bg-black-deep/50 text-white/60 hover:border-neon-cyan/50'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCustomInterest()
              }
            }}
            placeholder="Add custom tech interest"
            className="flex-1 rounded-xl border border-neon-cyan/30 bg-black-deep/80 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20"
          />
          <button
            type="button"
            onClick={addCustomInterest}
            className="rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 px-4 py-2 text-sm font-semibold text-neon-cyan hover:bg-neon-cyan/20 transition"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {form.techInterests && form.techInterests.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
            {form.techInterests
              .filter(i => !TECH_INTERESTS.includes(i as string))
              .map(interest => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-2 py-1 text-xs text-neon-cyan"
                >
                  {interest}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="hover:text-neon-cyan/60"
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

