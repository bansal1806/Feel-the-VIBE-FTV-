'use client'

import { Heart } from 'lucide-react'
import { ProfileSection } from './ProfileSection'
import type { ProfileFormData } from './types'

const PERSONALITY_TAGS = [
  { id: 'introvert', label: 'Introvert' },
  { id: 'extrovert', label: 'Extrovert' },
  { id: 'builder', label: 'Builder' },
  { id: 'designer', label: 'Designer' },
  { id: 'researcher', label: 'Researcher' },
  { id: 'night-owl', label: 'Night Owl' },
  { id: 'early-bird', label: 'Early Bird' },
  { id: 'team-player', label: 'Team Player' },
  { id: 'solo-operator', label: 'Solo Operator' },
] as const

interface PersonalityTagsSectionProps {
  form: ProfileFormData
  onUpdate: (field: keyof ProfileFormData, value: ProfileFormData[keyof ProfileFormData]) => void
  isEditing: boolean
}

export function PersonalityTagsSection({ form, onUpdate, isEditing }: PersonalityTagsSectionProps) {
  const toggleTag = (tagId: string) => {
    const current = form.personalityTags || []
    if (current.includes(tagId)) {
      onUpdate('personalityTags', current.filter(t => t !== tagId))
    } else {
      onUpdate('personalityTags', [...current, tagId])
    }
  }

  if (!isEditing && (!form.personalityTags || form.personalityTags.length === 0)) {
    return null
  }

  if (!isEditing) {
    return (
      <ProfileSection icon={Heart} title="Personality Tags" color="neon-pink">
        <div className="flex flex-wrap gap-2">
          {form.personalityTags.map(tag => (
            <span
              key={tag}
              className="rounded-full border border-neon-pink/50 bg-neon-pink/10 px-3 py-1 text-xs text-neon-pink uppercase tracking-[0.1em]"
            >
              {PERSONALITY_TAGS.find(t => t.id === tag)?.label || tag}
            </span>
          ))}
        </div>
      </ProfileSection>
    )
  }

  return (
    <ProfileSection icon={Heart} title="Personality Tags" color="neon-pink">
      <div className="space-y-3">
        <p className="text-xs text-white/60 mb-3">
          Small, punchy labels that help identify your vibe and match work styles.
        </p>
        <div className="flex flex-wrap gap-2">
          {PERSONALITY_TAGS.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition ${
                form.personalityTags?.includes(tag.id)
                  ? 'border-neon-pink bg-neon-pink/20 text-neon-pink'
                  : 'border-white/20 bg-black-deep/50 text-white/60 hover:border-neon-pink/50'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>
    </ProfileSection>
  )
}

