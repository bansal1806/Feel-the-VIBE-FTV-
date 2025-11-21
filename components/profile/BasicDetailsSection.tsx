'use client'

import { User, CheckCircle2 } from 'lucide-react'
import { ProfileSection } from './ProfileSection'
import { TextField } from './form/TextField'
import type { ProfileFormData } from './types'

interface BasicDetailsSectionProps {
  form: ProfileFormData
  onUpdate: (field: keyof ProfileFormData, value: ProfileFormData[keyof ProfileFormData]) => void
  isEditing: boolean
}

export function BasicDetailsSection({ form, onUpdate, isEditing }: BasicDetailsSectionProps) {
  if (!isEditing) {
    return (
      <ProfileSection icon={User} title="Basic Verified Identity" color="neon-cyan">
        <div className="space-y-3">
          {form.name && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">Name:</span>
              <span className="text-sm font-semibold text-white">{form.name}</span>
              <CheckCircle2 className="h-4 w-4 text-neon-green" />
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/60">Branch & Year:</span>
            <span className="text-sm font-semibold text-white">
              {form.major || 'Not set'} {form.year ? `• ${form.year}` : ''}
            </span>
          </div>
          {form.rollNumber && form.showRollNumber && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">Roll Number:</span>
              <span className="text-sm font-semibold text-white">{form.rollNumber}</span>
            </div>
          )}
          {form.pronouns && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">Pronouns:</span>
              <span className="text-sm font-semibold text-white">{form.pronouns}</span>
            </div>
          )}
          {form.avatarUrl && (
            <div className="mt-3">
              <img
                src={form.avatarUrl}
                alt={form.alias}
                className="h-24 w-24 rounded-2xl object-cover border-2 border-neon-cyan/50"
              />
            </div>
          )}
        </div>
      </ProfileSection>
    )
  }

  return (
    <ProfileSection icon={User} title="Basic Verified Identity" color="neon-cyan">
      <div className="space-y-3">
        <TextField
          label="Name (verified)"
          value={form.name}
          onChange={(v) => onUpdate('name', v)}
          placeholder="Your real name"
        />
        <TextField
          label="Studio Alias"
          value={form.alias}
          onChange={(v) => onUpdate('alias', v)}
          required
        />
        <div className="grid gap-3 md:grid-cols-2">
          <TextField
            label="Branch/Major"
            value={form.major}
            onChange={(v) => onUpdate('major', v)}
            placeholder="e.g., Computer Science"
          />
          <TextField
            label="Year"
            value={form.year}
            onChange={(v) => onUpdate('year', v)}
            placeholder="e.g., 2024"
          />
        </div>
        <div className="flex items-center gap-3">
          <TextField
            label="Roll Number/ID"
            value={form.rollNumber}
            onChange={(v) => onUpdate('rollNumber', v)}
            placeholder="Optional"
            className="flex-1"
          />
          <label className="flex items-center gap-2 cursor-pointer mt-6">
            <input
              type="checkbox"
              checked={form.showRollNumber}
              onChange={(e) => onUpdate('showRollNumber', e.target.checked)}
              className="rounded border-neon-cyan/30 bg-black-deep/80"
            />
            <span className="text-xs text-white/60">Show publicly</span>
          </label>
        </div>
        <TextField
          label="Profile Photo URL"
          value={form.avatarUrl}
          onChange={(v) => onUpdate('avatarUrl', v)}
          placeholder="https://..."
        />
        <TextField
          label="Headline"
          value={form.headline}
          onChange={(v) => onUpdate('headline', v)}
          placeholder="One-line description"
        />
        <TextField
          label="Pronouns"
          value={form.pronouns}
          onChange={(v) => onUpdate('pronouns', v)}
          placeholder="e.g., he/him, she/her"
        />
        <TextField
          label="Hometown"
          value={form.hometown}
          onChange={(v) => onUpdate('hometown', v)}
          placeholder="Optional"
        />
      </div>
    </ProfileSection>
  )
}

