'use client'

import { Shield } from 'lucide-react'
import { ProfileSection } from './ProfileSection'
import { ToggleRow } from './form/ToggleRow'
import { SelectField } from './form/SelectField'
import type { ProfileFormData } from './types'

interface PrivacySectionProps {
  form: ProfileFormData
  onUpdate: (field: keyof ProfileFormData, value: ProfileFormData[keyof ProfileFormData]) => void
  isEditing: boolean
}

export function PrivacySection({ form, onUpdate, isEditing }: PrivacySectionProps) {
  if (!isEditing) {
    return (
      <ProfileSection icon={Shield} title="Privacy Controls" color="neon-purple">
        <div className="space-y-2 text-sm text-white/80">
          <div className="flex items-center justify-between">
            <span>Dual Identity Mode:</span>
            <span className={form.dualIdentityMode ? 'text-neon-green' : 'text-white/40'}>
              {form.dualIdentityMode ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Discoverable:</span>
            <span className={form.discoverable ? 'text-neon-green' : 'text-white/40'}>
              {form.discoverable ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Profile Visibility:</span>
            <span className="text-white/80 capitalize">{form.profileVisibility}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Allow Messages From:</span>
            <span className="text-white/80 capitalize">{form.allowMessagesFrom}</span>
          </div>
        </div>
      </ProfileSection>
    )
  }

  return (
    <ProfileSection icon={Shield} title="Privacy Controls" color="neon-purple">
      <div className="space-y-3">
        <ToggleRow
          label="Dual identity mode"
          description="Keep your professional profile locked until trust is built."
          value={form.dualIdentityMode}
          onChange={(v) => onUpdate('dualIdentityMode', v)}
        />
        <ToggleRow
          label="Discoverable in swipe deck"
          description="Allow other verified students to discover your alias."
          value={form.discoverable}
          onChange={(v) => onUpdate('discoverable', v)}
        />
        <ToggleRow
          label="Open to recruiter intros"
          description="Receive curated opportunities from verified partners."
          value={form.recruiterOptIn}
          onChange={(v) => onUpdate('recruiterOptIn', v)}
        />
        <ToggleRow
          label="Share anonymous analytics"
          description="Help Vibe improve matches by sharing anonymized usage."
          value={form.shareAnalytics}
          onChange={(v) => onUpdate('shareAnalytics', v)}
        />
        <SelectField
          label="Profile visibility"
          value={form.profileVisibility}
          onChange={(v) => onUpdate('profileVisibility', v)}
          options={[
            { value: 'everyone', label: 'Entire network' },
            { value: 'campus', label: 'My campus' },
            { value: 'connections', label: 'Connections only' },
          ]}
        />
        <SelectField
          label="Allow messages from"
          value={form.allowMessagesFrom}
          onChange={(v) => onUpdate('allowMessagesFrom', v)}
          options={[
            { value: 'everyone', label: 'Everyone' },
            { value: 'campus', label: 'Verified campus members' },
            { value: 'connections', label: 'Connections only' },
          ]}
        />
      </div>
    </ProfileSection>
  )
}

