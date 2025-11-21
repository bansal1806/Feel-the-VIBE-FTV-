'use client'

import { Briefcase } from 'lucide-react'
import { ProfileSection } from './ProfileSection'
import { TextArea } from './form/TextArea'
import type { ProfileFormData } from './types'

interface BioSectionProps {
  form: ProfileFormData
  onUpdate: (field: keyof ProfileFormData, value: ProfileFormData[keyof ProfileFormData]) => void
  isEditing: boolean
}

export function BioSection({ form, onUpdate, isEditing }: BioSectionProps) {
  if (!isEditing && !form.bio) {
    return null
  }

  if (!isEditing) {
    return (
      <ProfileSection icon={Briefcase} title="About" color="neon-purple">
        <p className="text-sm text-white/80 whitespace-pre-wrap">{form.bio}</p>
      </ProfileSection>
    )
  }

  return (
    <ProfileSection icon={Briefcase} title="About" color="neon-purple">
      <TextArea
        label="Bio"
        value={form.bio}
        onChange={(v) => onUpdate('bio', v)}
        placeholder="Tell your story..."
        rows={6}
      />
    </ProfileSection>
  )
}

