'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Sparkles, BookmarkPlus, User, MapPin, Hash, GraduationCap, Calendar, Zap, Lock, Eye, Target, Share2, Save } from 'lucide-react'
import IntentPicker from './IntentPicker'
import SeekingEditor from './SeekingEditor'
import AnimatedBackground from './AnimatedBackground'
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

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
    <div className="relative min-h-screen pb-24 overflow-hidden">
      {/* Immersive Background */}
      <AnimatedBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 pt-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header Section */}
          <motion.section variants={itemVariants} className="frosted-panel overflow-hidden">
             {loading ? <HeaderSkeleton /> : <HeaderContent profile={profile!} />}
          </motion.section>

          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Main Content */}
            <div className="space-y-8">
              <ProfileFormSection 
                title="Identity" 
                subtitle="HOW YOU VIBE"
                icon={<User className="h-4 w-4" />}
                description="Fine-tune your campus presence and alias settings."
              >
                {loading ? (
                  <FormSkeleton rows={3} />
                ) : (
                  <div className="space-y-4">
                    <TextField 
                      label="Studio Alias" 
                      value={form!.alias} 
                      onChange={(value) => handleInput('alias', value)} 
                      icon={<Hash className="h-4 w-4" />}
                    />
                    <TextField 
                      label="Campus Headline" 
                      value={form!.headline} 
                      onChange={(value) => handleInput('headline', value)} 
                      placeholder="e.g. Building campus collab tools" 
                      icon={<Sparkles className="h-4 w-4" />}
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      <TextField 
                        label="Pronouns" 
                        value={form!.pronouns} 
                        onChange={(value) => handleInput('pronouns', value)} 
                        icon={<Zap className="h-4 w-4" />}
                      />
                      <TextField 
                        label="Hometown" 
                        value={form!.hometown} 
                        onChange={(value) => handleInput('hometown', value)} 
                        icon={<MapPin className="h-4 w-4" />}
                      />
                    </div>
                  </div>
                )}
              </ProfileFormSection>

              <ProfileFormSection 
                title="Campus Story" 
                subtitle="ACADEMIC LORE"
                icon={<GraduationCap className="h-4 w-4" />}
                description="Your academic journey and interests power smarter matches."
              >
                {loading ? (
                  <FormSkeleton rows={4} />
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <TextField 
                        label="Major" 
                        value={form!.major} 
                        onChange={(value) => handleInput('major', value)} 
                        icon={<GraduationCap className="h-4 w-4" />}
                      />
                      <TextField 
                        label="Year" 
                        value={form!.year} 
                        onChange={(value) => handleInput('year', value)} 
                        icon={<Calendar className="h-4 w-4" />}
                      />
                    </div>
                    <TextArea 
                      label="Bio" 
                      value={form!.bio} 
                      onChange={(value) => handleInput('bio', value)} 
                      placeholder="Tell your campus who you are and what you're looking for..." 
                    />
                    <TextField 
                      label="Interests" 
                      hint="Separate multiple interests with commas" 
                      value={form!.interests} 
                      onChange={(value) => handleInput('interests', value)} 
                      icon={<Share2 className="h-4 w-4" />}
                    />
                  </div>
                )}
              </ProfileFormSection>

              <ProfileFormSection 
                title="Goals & Seeking" 
                subtitle="OPPORTUNITY RADAR"
                icon={<Target className="h-4 w-4" />}
                description="Let people know what you're bringing to campus."
              >
                <div className="space-y-6">
                  <IntentPicker />
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block">SKILLS YOU'RE SEEKING</label>
                    <SeekingEditor />
                  </div>
                </div>
              </ProfileFormSection>

              <ProfileFormSection 
                title="Privacy & Safety" 
                subtitle="DUAL IDENTITY"
                icon={<Lock className="h-4 w-4" />}
                description="Control your visibility and identity progression tiers."
              >
                {loading ? (
                  <FormSkeleton rows={3} />
                ) : (
                  <div className="space-y-4">
                    <ToggleRow 
                      label="Dual Identity Mode" 
                      description="Keep your professional profile locked until trust is built." 
                      value={form!.dualIdentityMode} 
                      onChange={(value) => handleInput('dualIdentityMode', value)} 
                      icon={<Lock className="h-4 w-4 text-neon-purple" />}
                    />
                    <ToggleRow 
                      label="Public Discovery" 
                      description="Allow other verified students to discover your alias." 
                      value={form!.discoverable} 
                      onChange={(value) => handleInput('discoverable', value)} 
                      icon={<Eye className="h-4 w-4 text-neon-cyan" />}
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                       <SelectField
                        label="Profile Visibility"
                        value={form!.profileVisibility}
                        onChange={(value) => handleInput('profileVisibility', value as FormState['profileVisibility'])}
                        options={[
                          { value: 'everyone', label: 'Global' },
                          { value: 'campus', label: 'My Campus' },
                          { value: 'connections', label: 'Matches Only' },
                        ]}
                      />
                      <SelectField
                        label="Message Permissions"
                        value={form!.allowMessagesFrom}
                        onChange={(value) => handleInput('allowMessagesFrom', value as FormState['allowMessagesFrom'])}
                        options={[
                          { value: 'everyone', label: 'Open DMs' },
                          { value: 'campus', label: 'Verified Only' },
                          { value: 'connections', label: 'Mutuals Only' },
                        ]}
                      />
                    </div>
                    
                    <div className="pt-2 border-t border-white/5 space-y-4">
                      <ToggleRow 
                        label="Recruiter Outreach" 
                        description="Receive opportunities from verified campus partners." 
                        value={form!.recruiterOptIn} 
                        onChange={(value) => handleInput('recruiterOptIn', value)} 
                      />
                      <ToggleRow 
                        label="Anonymous Analytics" 
                        description="Help us improve matches with anonymized usage data." 
                        value={form!.shareAnalytics} 
                        onChange={(value) => handleInput('shareAnalytics', value)} 
                      />
                    </div>
                  </div>
                )}
              </ProfileFormSection>

              <motion.div variants={itemVariants} className="flex justify-end pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={updateProfileMutation.isPending || !form}
                  className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white px-8 py-4 text-sm font-bold text-black transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-neon-cyan to-neon-purple transition-transform group-hover:scale-x-110" />
                  <Save className="h-4 w-4" />
                  {updateProfileMutation.isPending ? 'Propagating...' : 'Update Vibe Profile'}
                </button>
              </motion.div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">
              <motion.div variants={itemVariants} className="animate-float">
                <StatsPanel stats={stats} loading={loading} />
              </motion.div>
              <motion.div variants={itemVariants} style={{ animationDelay: '1s' }} className="animate-float">
                <TrustPanel />
              </motion.div>
            </aside>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function HeaderContent({ profile }: { profile: NonNullable<ReturnType<typeof useProfile>['data']> }) {
  return (
    <div className="relative p-8 md:p-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 h-32 w-32 bg-neon-cyan/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 h-32 w-32 bg-neon-purple/10 blur-3xl rounded-full" />

      <div className="flex items-center gap-6 relative z-10">
        <div className="group relative">
           <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink opacity-50 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200" />
           <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-black-deep text-3xl font-black text-white shadow-2xl">
              <span className="gradient-text-pink">{profile.alias.slice(0, 2).toUpperCase()}</span>
           </div>
           <div className="absolute -bottom-1 -right-1 rounded-full bg-neon-green p-1.5 shadow-lg shadow-neon-green/30">
             <Zap className="h-3 w-3 text-black fill-black" />
           </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tighter text-white">@{profile.alias}</h1>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-neon-cyan p-1 shadow-lg shadow-neon-cyan/20">
              <Shield className="h-2.5 w-2.5 text-black" />
            </div>
          </div>
          <p className="text-sm font-medium text-white/50">{profile.headline || 'Campus collaborator in stealth mode'}</p>
          <div className="flex items-center gap-2 mt-3">
             <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neon-cyan">
               Verified Persona
             </span>
             {profile.dualIdentityMode && (
               <span className="rounded-full bg-neon-purple/10 border border-neon-purple/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neon-purple">
                 Stealth Active
               </span>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 md:text-right relative z-10">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">SKILLCREDS</div>
          <div className="text-3xl font-black text-white neon-glow-cyan shadow-none drop-shadow-none">
            {profile.skillCreds ?? 0}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">IDENTITY</div>
          <div className="text-3xl font-black text-white">
            <span className={profile.dualIdentityMode ? 'gradient-text-pink' : 'text-white/20'}>
              {profile.dualIdentityMode ? 'DUAL' : 'CORE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function HeaderSkeleton() {
  return <div className="h-44 animate-pulse rounded-3xl bg-white/5" />
}

function ProfileFormSection({ 
  title, 
  subtitle,
  icon,
  description, 
  children 
}: { 
  title: string; 
  subtitle: string;
  icon: React.ReactNode;
  description: string; 
  children: React.ReactNode 
}) {
  return (
    <motion.section 
      variants={itemVariants}
      className="frosted-panel p-6 md:p-8 space-y-6"
    >
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/60">
              {icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">{subtitle}</span>
          </div>
          <h3 className="text-2xl font-black tracking-tight text-white">{title}</h3>
          <p className="text-sm font-medium text-white/40">{description}</p>
        </div>
      </header>
      <div className="relative">
        {children}
      </div>
    </motion.section>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  icon,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hint?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</span>
      </div>
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center text-white/20 group-focus-within:text-neon-cyan transition-colors">
          {icon}
        </div>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-sm font-medium text-white placeholder:text-white/20 outline-none ring-neon-cyan/20 transition-all focus:border-neon-cyan/50 focus:bg-white/10 focus:ring-4"
        />
      </div>
      {hint && <span className="block text-[10px] font-medium text-white/20 ml-2">{hint}</span>}
    </div>
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
    <div className="space-y-1.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-3xl border border-white/5 bg-white/5 p-5 text-sm font-medium text-white placeholder:text-white/20 outline-none ring-neon-purple/20 transition-all focus:border-neon-purple/50 focus:bg-white/10 focus:ring-4"
      />
    </div>
  )
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
  icon,
}: {
  label: string
  description: string
  value: boolean
  onChange: (value: boolean) => void
  icon?: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="group flex w-full items-center justify-between gap-6 rounded-2xl border border-white/5 bg-white/5 p-5 text-left transition-all hover:bg-white/10"
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
            {icon}
          </div>
        )}
        <div>
          <div className="text-sm font-bold text-white transition-colors group-hover:text-neon-cyan">{label}</div>
          <div className="text-xs font-medium text-white/40">{description}</div>
        </div>
      </div>
      <div className={`relative flex h-7 w-14 shrink-0 items-center rounded-full transition-colors duration-300 ${value ? 'bg-white' : 'bg-white/10 border border-white/10'}`}>
        <motion.div 
          layout
          className={`h-5 w-5 rounded-full shadow-lg ${value ? 'bg-black ml-1' : 'bg-white/40 ml-1'}`}
          animate={{ x: value ? 28 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
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
    <div className="space-y-1.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-2xl border border-white/5 bg-white/5 px-4 py-4 text-sm font-bold text-white outline-none ring-white/5 transition-all focus:border-white/20 focus:bg-white/10 focus:ring-4"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-black text-white">
            {option.label}
          </option>
        ))}
      </select>
    </div>
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
      { label: 'Active rooms', value: stats?.activeRooms ?? 0, color: 'text-neon-cyan' },
      { label: 'Rooms hosted', value: stats?.createdRooms ?? 0, color: 'text-neon-purple' },
      { label: 'Events RSVP', value: stats?.eventsGoing ?? 0, color: 'text-neon-green' },
      { label: 'Timecapsules', value: stats?.timecapsules ?? 0, color: 'text-neon-pink' },
    ],
    [stats],
  )
  return (
    <section className="frosted-panel p-6 space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">LIFETIME</span>
        <h3 className="text-sm font-bold text-white">Vibe Ledger</h3>
      </div>
      <div className="grid gap-3">
        {loading
          ? [0, 1, 2, 3].map((index) => <div key={index} className="h-16 animate-pulse rounded-2xl bg-white/5" />)
          : items.map((item) => (
              <div key={item.label} className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-5 py-4 transition-all hover:bg-white hover:border-white">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-black">{item.label}</span>
                <span className={`text-2xl font-black ${item.color} group-hover:text-black`}>{item.value}</span>
              </div>
            ))}
      </div>
    </section>
  )
}

function TrustPanel() {
  return (
    <section className="relative overflow-hidden group rounded-[2rem] border border-white/5 bg-gradient-to-br from-neon-purple/20 via-black-deep to-neon-cyan/20 p-8 space-y-6 shadow-2xl">
      {/* Decorative pulse glow */}
      <div className="absolute -top-10 -right-10 h-32 w-32 bg-neon-purple/10 blur-3xl group-hover:bg-neon-purple/20 transition-colors" />
      
      <div className="space-y-4 relative z-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-neon-purple shadow-lg">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-black tracking-tight text-white mb-2">Nexus Trust</h3>
          <p className="text-sm font-medium text-white/40 leading-relaxed">Your professional story unlocks gradually through meaningful connections.</p>
        </div>
      </div>

      <div className="space-y-4 pt-4 relative z-10">
        {[
          { icon: <Zap className="h-3 w-3" />, stage: '1', title: 'Stealth Discovery', desc: 'Alias chat & vibes' },
          { icon: <Hash className="h-3 w-3" />, stage: '2', title: 'Core Reveal', desc: 'Major & interest snapshots' },
          { icon: <GraduationCap className="h-3 w-3" />, stage: '3', title: 'Deep Context', desc: 'Academic details revealed' },
          { icon: <Lock className="h-3 w-3" />, stage: '4', title: 'Full Access', desc: 'Mutual professional unlock' },
        ].map((item) => (
          <div key={item.stage} className="flex gap-4">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/40">
              {item.stage}
            </div>
            <div>
              <div className="text-xs font-bold text-white/80">{item.title}</div>
              <div className="text-[10px] font-medium text-white/30">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <button className="relative z-10 w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-white transition-all hover:bg-white hover:text-black">
        <BookmarkPlus className="h-4 w-4" />
        The Trust Playbook
      </button>
    </section>
  )
}

function FormSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-2xl bg-white/5" />
      ))}
    </div>
  )
}


