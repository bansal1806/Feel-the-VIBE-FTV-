'use client'

import { Lightbulb } from 'lucide-react'
import { ProfileSection } from './ProfileSection'
import type { ProfileFormData } from './types'

const MOOD_OPTIONS = [
  'Usually chill but focused',
  'Hyperactive builder mode',
  'Minimal talk, maximum work',
  'Collaborative and open',
  'Deep work enthusiast',
  'Social butterfly',
  'Creative flow state'
] as const

interface MoodSectionProps {
  form: ProfileFormData
  onUpdate: (field: keyof ProfileFormData, value: any) => void
  isEditing: boolean
}

export function MoodSection({ form, onUpdate, isEditing }: MoodSectionProps) {
  if (!isEditing && !form.moodIndicator) {
    return null
  }

  if (!isEditing) {
    return (
      <ProfileSection icon={Lightbulb} title="Mood & Vibe Indicators" color="neon-purple">
        <p className="text-sm text-white/80 italic">"{form.moodIndicator}"</p>
      </ProfileSection>
    )
  }

  const isCustomMood = form.moodIndicator && !MOOD_OPTIONS.includes(form.moodIndicator as any)

  return (
    <ProfileSection icon={Lightbulb} title="Mood & Vibe Indicators (Optional)" color="neon-purple">
      <div className="space-y-3">
        <p className="text-xs text-white/60 mb-3">
          Light stuff like simple vibe cues—not memes.
        </p>
        <select
          value={isCustomMood ? '' : form.moodIndicator}
          onChange={(e) => onUpdate('moodIndicator', e.target.value)}
          className="w-full rounded-xl border border-neon-purple/30 bg-black-deep/80 px-4 py-2 text-sm text-white outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/20"
        >
          <option value="">Select a mood (optional)</option>
          {MOOD_OPTIONS.map(mood => (
            <option key={mood} value={mood}>{mood}</option>
          ))}
        </select>
        <input
          type="text"
          value={isCustomMood ? form.moodIndicator : ''}
          onChange={(e) => onUpdate('moodIndicator', e.target.value)}
          placeholder="Or write your own..."
          className="w-full rounded-xl border border-neon-purple/30 bg-black-deep/80 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/20"
        />
      </div>
    </ProfileSection>
  )
}

