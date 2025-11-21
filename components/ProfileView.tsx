'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Shield, Sparkles, BookmarkPlus } from 'lucide-react'
import IntentPicker from './IntentPicker'
import SeekingEditor from './SeekingEditor'
import { useProfile } from '@/lib/hooks/useProfile'
import { globalState, type Intent } from '@/lib/state'
import { bus } from '@/lib/bus'

type FormState = {
  alias: string
  headline: string
  pronouns: string
  hometown: string
  bio: string
  major: string
  year: string
  interests: string
  profileVisibility: 'everyone' | 'campus' | 'connections'
  allowMessagesFrom: 'everyone' | 'campus' | 'connections'
  dualIdentityMode: boolean
  discoverable: boolean
  recruiterOptIn: boolean
  shareAnalytics: boolean
}

const INTENT_OPTIONS: Intent[] = ['collab', 'study', 'social', 'dating', 'mentor']

export default function ProfileView() {
  const { data: profile, isLoading } = useProfile()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormState | null>(null)

  useEffect(() => {
    if (profile) {
      setForm({
        alias: profile.alias ?? '',
        headline: profile.headline ?? '',
        pronouns: profile.pronouns ?? '',
        hometown: profile.hometown ?? '',
        bio: profile.bio ?? '',
        major: profile.major ?? '',
        year: profile.year ?? '',
        interests: (profile.interests ?? []).join(', '),
        profileVisibility: (profile.profileVisibility as FormState['profileVisibility']) ?? 'campus',
        allowMessagesFrom: (profile.allowMessagesFrom as FormState['allowMessagesFrom']) ?? 'campus',
        dualIdentityMode: profile.dualIdentityMode ?? true,
        discoverable: profile.discoverable ?? true,
        recruiterOptIn: profile.recruiterOptIn ?? false,
        shareAnalytics: profile.shareAnalytics ?? false,
      })
      const intents = (profile.intents ?? []).filter((intent): intent is Intent =>
        INTENT_OPTIONS.includes(intent as Intent),
      )
      globalState.set({
        ...globalState.get(),
        intents,
        seeking: profile.seeking ?? [],
        credits: profile.skillCreds ?? 0,
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
        throw new Error(error.error ?? 'Unable to update profile')
      }
      return response.json()
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
      bus.emit('toast', { message: 'Profile updated' })
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to update profile'
      bus.emit('toast', { message })
    },
  })

  const handleInput = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current))
  }

  const handleSubmit = () => {
    if (!form || !profile) return
    const global = globalState.get()
    const interests = form.interests
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    updateProfileMutation.mutate({
      alias: form.alias,
      headline: form.headline,
      pronouns: form.pronouns || null,
      hometown: form.hometown || null,
      bio: form.bio || null,
      major: form.major || null,
      year: form.year || null,
      interests,
      intents: global.intents ?? [],
      seeking: global.seeking ?? [],
      lookingFor: profile.lookingFor ?? [],
      dualIdentityMode: form.dualIdentityMode,
      discoverable: form.discoverable,
      recruiterOptIn: form.recruiterOptIn,
      shareAnalytics: form.shareAnalytics,
      profileVisibility: form.profileVisibility,
      allowMessagesFrom: form.allowMessagesFrom,
    })
  }

  const stats = profile?.stats
  const loading = isLoading || !form

  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white/90 p-6 shadow-lg shadow-indigo-100 ring-1 ring-indigo-50 backdrop-blur dark:bg-slate-900/70 dark:ring-slate-800/70">
        {loading ? (
          <HeaderSkeleton />
        ) : (
          <HeaderContent profile={profile!} />
        )}
      </motion.section>

      <main className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <ProfileFormSection title="Identity" description="Tune how you present yourself across the network.">
            {loading ? (
              <FormSkeleton rows={3} />
            ) : (
              <div className="space-y-3">
                <TextField label="Studio alias" value={form!.alias} onChange={(value) => handleInput('alias', value)} />
                <TextField label="Headline" value={form!.headline} onChange={(value) => handleInput('headline', value)} placeholder="ex. Building campus collab tools" />
                <div className="grid gap-3 md:grid-cols-2">
                  <TextField label="Pronouns" value={form!.pronouns} onChange={(value) => handleInput('pronouns', value)} />
                  <TextField label="Hometown" value={form!.hometown} onChange={(value) => handleInput('hometown', value)} />
                </div>
              </div>
            )}
          </ProfileFormSection>

          <ProfileFormSection title="Campus Story" description="Academic details power smarter matches.">
            {loading ? (
              <FormSkeleton rows={4} />
            ) : (
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <TextField label="Major" value={form!.major} onChange={(value) => handleInput('major', value)} />
                  <TextField label="Year" value={form!.year} onChange={(value) => handleInput('year', value)} />
                </div>
                <TextArea label="Bio" value={form!.bio} onChange={(value) => handleInput('bio', value)} placeholder="Let your campus know what you're building, exploring, or seeking." />
                <TextField label="Interests" hint="Comma separated" value={form!.interests} onChange={(value) => handleInput('interests', value)} />
              </div>
            )}
          </ProfileFormSection>

          <ProfileFormSection title="Intent & Seeking" description="Tell the algorithm what energies to bring your way.">
            <div className="space-y-4">
              <IntentPicker />
              <div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mb-1">Seeking skills</div>
                <SeekingEditor />
              </div>
            </div>
          </ProfileFormSection>

          <ProfileFormSection title="Privacy Controls" description="Fine-tune how your dual identity unlocks.">
            {loading ? (
              <FormSkeleton rows={3} />
            ) : (
              <div className="space-y-3">
                <ToggleRow label="Dual identity mode" description="Keep your professional profile locked until trust is built." value={form!.dualIdentityMode} onChange={(value) => handleInput('dualIdentityMode', value)} />
                <ToggleRow label="Discoverable in swipe deck" description="Allow other verified students to discover your alias." value={form!.discoverable} onChange={(value) => handleInput('discoverable', value)} />
                <ToggleRow label="Open to recruiter intros" description="Receive curated opportunities from verified partners." value={form!.recruiterOptIn} onChange={(value) => handleInput('recruiterOptIn', value)} />
                <ToggleRow label="Share anonymous analytics" description="Help Vibe improve matches by sharing anonymized usage." value={form!.shareAnalytics} onChange={(value) => handleInput('shareAnalytics', value)} />
                <SelectField
                  label="Profile visibility"
                  value={form!.profileVisibility}
                  onChange={(value) => handleInput('profileVisibility', value as FormState['profileVisibility'])}
                  options={[
                    { value: 'everyone', label: 'Entire network' },
                    { value: 'campus', label: 'My campus' },
                    { value: 'connections', label: 'Connections only' },
                  ]}
                />
                <SelectField
                  label="Allow messages from"
                  value={form!.allowMessagesFrom}
                  onChange={(value) => handleInput('allowMessagesFrom', value as FormState['allowMessagesFrom'])}
                  options={[
                    { value: 'everyone', label: 'Everyone' },
                    { value: 'campus', label: 'Verified campus members' },
                    { value: 'connections', label: 'Connections only' },
                  ]}
                />
              </div>
            )}
          </ProfileFormSection>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={updateProfileMutation.isPending || !form}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateProfileMutation.isPending ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </div>

        <aside className="space-y-6">
          <StatsPanel stats={stats} loading={loading} />
          <TrustPanel />
        </aside>
      </main>
    </div>
  )
}

function HeaderContent({ profile }: { profile: NonNullable<ReturnType<typeof useProfile>['data']> }) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-semibold text-white shadow-lg shadow-indigo-500/30">
          {profile.alias.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">@{profile.alias}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-300">{profile.headline || 'Campus collaborator in stealth mode'}</p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:border-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
            <Shield className="h-3 w-3" />
            Verified campus identity
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.18em] text-indigo-500 dark:text-indigo-300 md:text-right">
        <div>
          <div className="text-[10px]">SkillCreds</div>
          <div className="text-xl font-semibold text-slate-900 dark:text-white">{profile.skillCreds ?? 0}</div>
        </div>
        <div>
          <div className="text-[10px]">Dual identity</div>
          <div className="text-xl font-semibold text-slate-900 dark:text-white">{profile.dualIdentityMode ? 'Active' : 'Disabled'}</div>
        </div>
      </div>
    </div>
  )
}

function HeaderSkeleton() {
  return <div className="h-24 animate-pulse rounded-2xl bg-indigo-50/70 dark:bg-slate-900/50" />
}

function ProfileFormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <header className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-300">{description}</p>
      </header>
      {children}
    </section>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hint?: string
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
      {hint && <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>}
    </label>
  )
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
    </label>
  )
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-left text-sm transition hover:border-indigo-200 hover:bg-indigo-50/60 dark:border-slate-700 dark:bg-slate-900/60"
    >
      <div>
        <div className="font-medium text-slate-800 dark:text-slate-100">{label}</div>
        <div className="text-xs text-slate-500 dark:text-slate-300">{description}</div>
      </div>
      <div className={`flex h-6 w-12 items-center rounded-full ${value ? 'bg-gradient-to-r from-indigo-500 to-violet-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
        <div className={`h-5 w-5 rounded-full bg-white shadow transition ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </div>
    </button>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function StatsPanel({
  stats,
  loading,
}: {
  stats?: { activeRooms: number; createdRooms: number; eventsGoing: number; timecapsules: number }
  loading: boolean
}) {
  const items = useMemo(
    () => [
      { label: 'Active rooms', value: stats?.activeRooms ?? 0 },
      { label: 'Rooms hosted', value: stats?.createdRooms ?? 0 },
      { label: 'Events RSVP', value: stats?.eventsGoing ?? 0 },
      { label: 'Timecapsules', value: stats?.timecapsules ?? 0 },
    ],
    [stats],
  )
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Activity snapshot</h3>
      <div className="mt-4 grid gap-3">
        {loading
          ? [0, 1, 2, 3].map((index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-indigo-50/60 dark:bg-slate-900/60" />)
          : items.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:border-indigo-900/40 dark:bg-indigo-900/40 dark:text-indigo-200">
                <span>{item.label}</span>
                <span className="text-lg text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
      </div>
    </section>
  )
}

function TrustPanel() {
  return (
    <section className="space-y-4 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 p-5 text-sm text-indigo-800 shadow-inner dark:border-indigo-900/60 dark:from-indigo-900/40 dark:to-violet-900/40 dark:text-indigo-200">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white/60 p-2 text-indigo-600 shadow">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-200">Trust progression</h3>
          <p className="text-xs text-indigo-600/80 dark:text-indigo-200/80">Each meaningful chat unlocks more of your professional story.</p>
        </div>
      </div>
      <div className="space-y-2 text-xs text-indigo-700/80 dark:text-indigo-200/70">
        <p>• Stage 1: Alias chat & vibes</p>
        <p>• Stage 2: Portfolio snapshots unlock</p>
        <p>• Stage 3: Academic details reveal</p>
        <p>• Stage 4: Full professional unlock + mutual intros</p>
      </div>
      <button className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white/70 px-3 py-2 text-xs font-semibold text-indigo-600 shadow-sm transition hover:bg-white dark:border-indigo-800 dark:bg-slate-900/50 dark:text-indigo-200">
        <BookmarkPlus className="h-4 w-4" />
        View trust playbook
      </button>
    </section>
  )
}

function FormSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-12 animate-pulse rounded-xl bg-indigo-50/60 dark:bg-slate-900/60" />
      ))}
    </div>
  )
}

