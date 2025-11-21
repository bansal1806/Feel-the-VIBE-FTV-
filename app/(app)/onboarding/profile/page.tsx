'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useProfile } from '@/lib/hooks/useProfile'
import { useSession } from '@/lib/hooks/useSession'
import { bus } from '@/lib/bus'

const INTEREST_CHOICES = [
  'Hackathons',
  'Performing Arts',
  'Entrepreneurship',
  'AI/ML',
  'Design',
  'Social Impact',
  'Community Building',
  'Sports & Wellness',
] as const

type InterestChoice = (typeof INTEREST_CHOICES)[number]

export default function OnboardingProfilePage() {
  const { isAuthenticated, isLoading: sessionLoading } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data, isLoading } = useProfile()

  const [alias, setAlias] = useState('')
  const [bio, setBio] = useState('')
  const [major, setMajor] = useState('')
  const [year, setYear] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionLoading) return
    if (!isAuthenticated) router.replace('/sign-in?redirect=' + encodeURIComponent('/onboarding/profile'))
  }, [sessionLoading, isAuthenticated, router])

  useEffect(() => {
    if (data) {
      setAlias(data.alias ?? '')
      setBio(data.bio ?? '')
      setMajor(data.major ?? '')
      setYear(data.year ?? '')
      setInterests(data.interests ?? [])
    }
  }, [data])

  const toggleInterest = (value: InterestChoice) => {
    setInterests((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value)
      }
      return [...prev, value]
    })
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          alias,
          bio,
          major,
          year,
          interests,
        }),
      })
      if (!res.ok) {
        throw new Error('Unable to save profile')
      }
      return res.json()
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated)
      bus.emit('toast', { message: 'Profile saved. Let’s secure your privacy vibe.' })
      router.push('/onboarding/privacy')
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const isSaving = mutation.isPending
  const isReady = useMemo(() => alias.trim().length >= 3, [alias])

  if (sessionLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-rose-100 dark:from-slate-950 dark:via-indigo-950 dark:to-rose-950">
        <div className="animate-pulse text-sm text-slate-500 dark:text-slate-300">
          Loading your vibe profile…
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-rose-100 dark:from-slate-950 dark:via-indigo-950 dark:to-rose-950">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <header className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:bg-white/10 dark:text-slate-200">
            Step 2 of 3
          </span>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
            Create your studio persona
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Upload an avatar, define your alias, and let peers know what makes you stand out.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <section className="glass rounded-3xl border border-white/40 p-6 shadow-lg backdrop-blur">
            <div className="space-y-8">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  Studio Alias
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                  placeholder="e.g. campus_creator"
                  value={alias}
                  onChange={(event) => setAlias(event.target.value)}
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Minimum 3 characters. Keep it playful but recognisable.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                    Major
                  </label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                    placeholder="e.g. Computer Science"
                    value={major}
                    onChange={(event) => setMajor(event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                    Year
                  </label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                    placeholder="e.g. Junior"
                    value={year}
                    onChange={(event) => setYear(event.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  About You
                </label>
                <textarea
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                  placeholder="Share a quick intro, what you’re building, or the communities you care about."
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  Interests
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {INTEREST_CHOICES.map((tag) => {
                    const active = interests.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleInterest(tag)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          active
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-200'
                            : 'border-slate-200 bg-white/60 text-slate-600 hover:bg-white/90 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20'
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:border-red-500/40 dark:text-red-300">
                  {error}
                </div>
              )}
            </div>
          </section>

          <aside className="glass flex flex-col justify-between rounded-3xl border border-white/40 p-6 text-sm text-slate-600 shadow-lg backdrop-blur dark:text-slate-200">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Sponsored slot
              </h2>
              <p className="mt-3">
                Highlight campus partners or premium opportunities while students complete onboarding.
              </p>
            </div>
            <button
              disabled={!isReady || isSaving}
              onClick={() => {
                setError(null)
                mutation.mutate()
              }}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-800/20 transition hover:shadow-slate-800/30 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900"
            >
              {isSaving ? 'Saving…' : 'Save & Continue'}
            </button>
          </aside>
        </div>
      </div>
    </div>
  )
}

