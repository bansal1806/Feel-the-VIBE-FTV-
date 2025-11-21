'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Save, Sparkles, Eye, EyeOff, CheckCircle2, Shield } from 'lucide-react'
import { useProfile } from '@/lib/hooks/useProfile'
import { useConnections, getTrustStage } from '@/lib/hooks/useConnections'
import { bus } from '@/lib/bus'
import { globalState, type Intent } from '@/lib/state'
import IntentPicker from '../IntentPicker'
import SeekingEditor from '../SeekingEditor'
import { BasicDetailsSection } from './BasicDetailsSection'
import { PersonalityTagsSection } from './PersonalityTagsSection'
import { HobbiesSection } from './HobbiesSection'
import { TechInterestsSection } from './TechInterestsSection'
import { MoodSection } from './MoodSection'
import { InspirationsSection } from './InspirationsSection'
import { AcademicSection } from './AcademicSection'
import { BioSection } from './BioSection'
import { PrivacySection } from './PrivacySection'
import type { ProfileFormData } from './types'

const INTENT_OPTIONS: Intent[] = ['collab', 'study', 'social', 'dating', 'mentor']

// Parse interests from profile data
function parseInterests(interests: string[] = []) {
  const personalityTags = [
    'introvert', 'extrovert', 'builder', 'designer', 'researcher',
    'night-owl', 'early-bird', 'team-player', 'solo-operator'
  ]
  const hobbies = [
    'badminton', 'photography', 'gaming', 'content creation', 'robotics tinkering',
    'music', 'trekking', 'basketball', 'football', 'cricket', 'swimming',
    'dancing', 'singing', 'writing', 'reading', 'cooking', 'traveling'
  ]
  const techInterests = [
    'AI/ML', 'hardware hacking', 'UI/UX', 'finance', 'startups', 'anime',
    'sci-fi', 'web dev', 'mobile dev', 'blockchain', 'cybersecurity',
    'data science', 'game dev', 'AR/VR', 'IoT', 'cloud computing'
  ]

  return {
    personalityTags: interests.filter(i => personalityTags.includes(i.toLowerCase())),
    hobbies: interests.filter(i => hobbies.includes(i.toLowerCase())),
    techInterests: interests.filter(i => techInterests.includes(i.toLowerCase())),
    techStack: interests.filter(i => 
      !personalityTags.includes(i.toLowerCase()) &&
      !hobbies.includes(i.toLowerCase()) &&
      !techInterests.includes(i.toLowerCase())
    ),
  }
}

// Parse bio for structured data
function parseBio(bio: string = '') {
  const lines = bio.split('\n')
  const moodMatch = bio.match(/Mood: (.+)/i)
  const toolsMatch = lines.find(l => l.toLowerCase().includes('tools:'))
  const mediaMatch = lines.find(l => l.toLowerCase().includes('media:'))
  const inspirationsMatch = lines.find(l => l.toLowerCase().includes('inspirations:'))
  const subjectsMatch = lines.find(l => l.toLowerCase().includes('subjects:'))
  const ongoingMatch = lines.find(l => l.toLowerCase().includes('ongoing:'))
  const pastMatch = lines.find(l => l.toLowerCase().includes('past:'))
  const rollMatch = lines.find(l => l.toLowerCase().includes('roll:'))

  const cleanBio = lines.filter(l =>
    !l.toLowerCase().includes('mood:') &&
    !l.toLowerCase().includes('tools:') &&
    !l.toLowerCase().includes('media:') &&
    !l.toLowerCase().includes('inspirations:') &&
    !l.toLowerCase().includes('subjects:') &&
    !l.toLowerCase().includes('ongoing:') &&
    !l.toLowerCase().includes('past:') &&
    !l.toLowerCase().includes('roll:')
  ).join('\n')

  return {
    bio: cleanBio,
    moodIndicator: moodMatch ? moodMatch[1] : '',
    favoriteTools: toolsMatch ? toolsMatch.split(':')[1]?.split(',').map(s => s.trim()).filter(Boolean) || [] : [],
    favoriteMedia: mediaMatch ? mediaMatch.split(':')[1]?.split(',').map(s => s.trim()).filter(Boolean) || [] : [],
    inspirations: inspirationsMatch ? inspirationsMatch.split(':')[1]?.split(',').map(s => s.trim()).filter(Boolean) || [] : [],
    currentSubjects: subjectsMatch ? subjectsMatch.split(':')[1]?.trim() || '' : '',
    ongoingProjects: ongoingMatch ? ongoingMatch.split(':')[1]?.trim() || '' : '',
    pastProjects: pastMatch ? pastMatch.split(':')[1]?.trim() || '' : '',
    rollNumber: rollMatch ? rollMatch.split(':')[1]?.trim() || '' : '',
    showRollNumber: !!rollMatch,
  }
}

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<ProfileFormData | null>(null)

  useEffect(() => {
    if (profile) {
      const parsed = parseInterests(profile.interests || [])
      const bioData = parseBio(profile.bio || '')

      setForm({
        name: profile.name || '',
        alias: profile.alias || '',
        major: profile.major || '',
        year: profile.year || '',
        rollNumber: bioData.rollNumber,
        avatarUrl: profile.avatarUrl || '',
        headline: profile.headline || '',
        pronouns: profile.pronouns || '',
        hometown: profile.hometown || '',
        personalityTags: parsed.personalityTags,
        hobbies: parsed.hobbies,
        techInterests: parsed.techInterests,
        moodIndicator: bioData.moodIndicator,
        favoriteTools: bioData.favoriteTools,
        favoriteMedia: bioData.favoriteMedia,
        inspirations: bioData.inspirations,
        currentSubjects: bioData.currentSubjects,
        ongoingProjects: bioData.ongoingProjects,
        pastProjects: bioData.pastProjects,
        techStack: parsed.techStack,
        bio: bioData.bio,
        profileVisibility: (profile.profileVisibility as ProfileFormData['profileVisibility']) || 'campus',
        allowMessagesFrom: (profile.allowMessagesFrom as ProfileFormData['allowMessagesFrom']) || 'campus',
        dualIdentityMode: profile.dualIdentityMode ?? true,
        discoverable: profile.discoverable ?? true,
        recruiterOptIn: profile.recruiterOptIn ?? false,
        shareAnalytics: profile.shareAnalytics ?? false,
        showRollNumber: bioData.showRollNumber,
      })

      const intents = (profile.intents || []).filter((intent): intent is Intent =>
        INTENT_OPTIONS.includes(intent as Intent),
      )
      globalState.set({
        ...globalState.get(),
        intents,
        seeking: profile.seeking || [],
        credits: profile.skillCreds || 0,
      })
    }
  }, [profile])

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unable to update profile' }))
        throw new Error(error.error || 'Unable to update profile')
      }
      return response.json()
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
      bus.emit('toast', { message: 'Profile updated successfully!' })
      setIsEditing(false)
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to update profile'
      bus.emit('toast', { message })
    },
  })

  const handleUpdate = (field: keyof ProfileFormData, value: any) => {
    setForm((current) => (current ? { ...current, [field]: value } : null))
  }

  const handleSubmit = () => {
    if (!form || !profile) return

    const global = globalState.get()

    // Combine all interests
    const allInterests = [
      ...form.personalityTags,
      ...form.hobbies,
      ...form.techInterests,
      ...form.techStack,
    ]

    // Build bio with structured data
    const bioParts = [form.bio]
    if (form.moodIndicator) bioParts.push(`Mood: ${form.moodIndicator}`)
    if (form.favoriteTools.length > 0) bioParts.push(`Tools: ${form.favoriteTools.join(', ')}`)
    if (form.favoriteMedia.length > 0) bioParts.push(`Media: ${form.favoriteMedia.join(', ')}`)
    if (form.inspirations.length > 0) bioParts.push(`Inspirations: ${form.inspirations.join(', ')}`)
    if (form.currentSubjects) bioParts.push(`Subjects: ${form.currentSubjects}`)
    if (form.ongoingProjects) bioParts.push(`Ongoing: ${form.ongoingProjects}`)
    if (form.pastProjects) bioParts.push(`Past: ${form.pastProjects}`)
    if (form.rollNumber && form.showRollNumber) bioParts.push(`Roll: ${form.rollNumber}`)

    updateProfileMutation.mutate({
      alias: form.alias,
      name: form.name || null,
      headline: form.headline || null,
      pronouns: form.pronouns || null,
      hometown: form.hometown || null,
      bio: bioParts.join('\n') || null,
      major: form.major || null,
      year: form.year || null,
      avatarUrl: form.avatarUrl || null,
      interests: allInterests,
      intents: global.intents || [],
      seeking: global.seeking || [],
      lookingFor: profile.lookingFor || [],
      dualIdentityMode: form.dualIdentityMode,
      discoverable: form.discoverable,
      recruiterOptIn: form.recruiterOptIn,
      shareAnalytics: form.shareAnalytics,
      profileVisibility: form.profileVisibility,
      allowMessagesFrom: form.allowMessagesFrom,
    })
  }

  const loading = isLoading || !form
  const stats = profile?.stats

  if (loading) {
    return (
      <div className="space-y-6">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-32 animate-pulse rounded-3xl bg-black-deep/50 border border-white/10" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-neon rounded-3xl border border-neon-cyan/30 p-6 shadow-neon-cyan"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {form.avatarUrl ? (
              <img
                src={form.avatarUrl}
                alt={form.alias}
                className="h-20 w-20 rounded-2xl object-cover border-2 border-neon-cyan/50"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-pink to-neon-purple text-2xl font-bold text-black-pure border-2 border-neon-cyan/50">
                {form.alias.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold gradient-text">@{form.alias}</h1>
                {form.name && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-neon-green/50 bg-neon-green/10 px-2 py-0.5 text-xs text-neon-green">
                    <CheckCircle2 className="h-3 w-3" />
                    {form.name}
                  </span>
                )}
              </div>
              <p className="text-sm text-white/60 mt-1">{form.headline || 'Campus collaborator'}</p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-2xl border border-neon-purple/30 bg-neon-purple/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-neon-purple">
                <Shield className="h-3 w-3" />
                Verified campus identity
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.18em] text-neon-cyan">
              <div className="rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 p-3 text-center">
                <div className="text-[10px] text-neon-cyan/80">SkillCreds</div>
                <div className="text-xl font-semibold text-white">{profile.skillCreds ?? 0}</div>
              </div>
              <div className="rounded-xl border border-neon-purple/30 bg-neon-purple/10 p-3 text-center">
                <div className="text-[10px] text-neon-purple/80">Dual Mode</div>
                <div className="text-xl font-semibold text-white">{form.dualIdentityMode ? 'ON' : 'OFF'}</div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-2 rounded-xl neon-gradient-cyan-yellow px-4 py-2 text-sm font-semibold text-black-pure shadow-neon-cyan transition hover:opacity-90"
            >
              {isEditing ? <EyeOff className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              {isEditing ? 'View' : 'Edit'}
            </button>
          </div>
        </div>
      </motion.section>

      {/* Profile Sections */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <BasicDetailsSection form={form} onUpdate={handleUpdate} isEditing={isEditing} />
          <PersonalityTagsSection form={form} onUpdate={handleUpdate} isEditing={isEditing} />
          <HobbiesSection form={form} onUpdate={handleUpdate} isEditing={isEditing} />
          <TechInterestsSection form={form} onUpdate={handleUpdate} isEditing={isEditing} />
          <MoodSection form={form} onUpdate={handleUpdate} isEditing={isEditing} />
          <InspirationsSection form={form} onUpdate={handleUpdate} isEditing={isEditing} />
          <AcademicSection form={form} onUpdate={handleUpdate} isEditing={isEditing} />
          <BioSection form={form} onUpdate={handleUpdate} isEditing={isEditing} />

          {isEditing && (
            <>
              <div className="glass-neon rounded-3xl border border-neon-cyan/30 p-6 shadow-neon-cyan">
                <header className="mb-4 flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-neon-cyan" />
                  <h3 className="text-lg font-semibold text-white">Intent & Seeking</h3>
                </header>
                <div className="space-y-4">
                  <IntentPicker />
                  <div>
                    <div className="text-xs text-white/60 mb-2">Seeking skills</div>
                    <SeekingEditor />
                  </div>
                </div>
              </div>

              <PrivacySection form={form} onUpdate={handleUpdate} isEditing={isEditing} />

              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={updateProfileMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-xl neon-gradient-pink-purple px-6 py-3 text-sm font-semibold text-black-pure shadow-neon-pink transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? 'Saving…' : 'Save Profile'}
                  <Save className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {stats && (
            <div className="glass-neon rounded-3xl border border-neon-cyan/30 p-5 shadow-neon-cyan">
              <h3 className="text-sm font-semibold text-white mb-4">Activity Snapshot</h3>
              <div className="grid gap-3">
                {[
                  { label: 'Active rooms', value: stats.activeRooms },
                  { label: 'Rooms hosted', value: stats.createdRooms },
                  { label: 'Events RSVP', value: stats.eventsGoing },
                  { label: 'Timecapsules', value: stats.timecapsules },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border border-neon-cyan/20 bg-neon-cyan/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-neon-cyan"
                  >
                    <span>{item.label}</span>
                    <span className="text-lg text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <TrustPanel />
        </aside>
      </div>
    </div>
  )
}

function TrustPanel() {
  const { data: connections, isLoading } = useConnections()

  return (
    <div className="glass-neon rounded-3xl border border-neon-purple/30 p-5 shadow-neon-purple">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-xl bg-neon-purple/20 p-2 text-neon-purple">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Trust Progression</h3>
          <p className="text-xs text-white/60">Each meaningful chat unlocks more of your professional story.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-black-deep/50" />
          ))}
        </div>
      ) : connections && connections.length > 0 ? (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {connections.map((conn) => {
            const trustStage = getTrustStage(conn.trustLevel)
            return (
              <div
                key={conn.id}
                className="rounded-xl border border-neon-purple/20 bg-neon-purple/5 p-3"
              >
                <div className="flex items-center gap-3 mb-2">
                  {conn.peerAvatar ? (
                    <img
                      src={conn.peerAvatar}
                      alt={conn.peerAlias}
                      className="h-8 w-8 rounded-full object-cover border border-neon-purple/30"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-neon-pink to-neon-purple text-xs font-bold text-black-pure">
                      {conn.peerAlias.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">@{conn.peerAlias}</div>
                    <div className="text-xs text-white/60 truncate">{conn.peerHeadline || 'No headline'}</div>
                  </div>
                  <div className="text-xs font-bold text-neon-purple">{conn.trustLevel}%</div>
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                    <span>Trust Level</span>
                    <span>Stage {trustStage.stage}</span>
                  </div>
                  <div className="h-2 rounded-full bg-black-deep/50 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-neon-purple to-neon-pink transition-all duration-500"
                      style={{ width: `${conn.trustLevel}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-white/80">
                  {trustStage.unlocked ? (
                    <span className="text-neon-green">✓ {trustStage.label}</span>
                  ) : (
                    <span className="text-white/40">🔒 {trustStage.label}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-white/60 mb-2">No connections yet</p>
          <p className="text-xs text-white/40">Start chatting to build trust!</p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-neon-purple/20">
        <div className="space-y-1 text-xs text-white/60">
          <p>• Stage 1 (25%): Alias chat & vibes</p>
          <p>• Stage 2 (50%): Portfolio snapshots unlock</p>
          <p>• Stage 3 (75%): Academic details reveal</p>
          <p>• Stage 4 (100%): Full professional unlock + mutual intros</p>
        </div>
      </div>
    </div>
  )
}

