'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useProfile } from '@/lib/hooks/useProfile'
import { useSession } from '@/lib/hooks/useSession'
import { bus } from '@/lib/bus'

export default function OnboardingPrivacyPage() {
  const { isAuthenticated, isLoading: sessionLoading } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data, isLoading } = useProfile()
  const [dualIdentity, setDualIdentity] = useState(true)
  const [discoverable, setDiscoverable] = useState(true)
  const [recruiterOptIn, setRecruiterOptIn] = useState(false)
  const [shareAnalytics, setShareAnalytics] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionLoading) return
    if (!isAuthenticated) router.replace('/sign-in?redirect=' + encodeURIComponent('/onboarding/privacy'))
  }, [sessionLoading, isAuthenticated, router])

  useEffect(() => {
    if (data) {
      setDualIdentity(data.dualIdentityMode ?? true)
      setDiscoverable(data.discoverable ?? true)
      setRecruiterOptIn(data.recruiterOptIn ?? false)
      setShareAnalytics(data.shareAnalytics ?? false)
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: async () => {
      if (!data) throw new Error('Profile not loaded')
      const payload = {
        alias: data.alias,
        bio: data.bio ?? '',
        major: data.major ?? '',
        year: data.year ?? '',
        interests: data.interests ?? [],
        dualIdentityMode: dualIdentity,
        discoverable,
        recruiterOptIn,
        shareAnalytics,
      }
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        throw new Error('Unable to update privacy preferences')
      }
      return res.json()
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated)
      bus.emit('toast', { message: 'Privacy preferences saved. Welcome to Vibe!' })
      router.push('/app')
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  if (sessionLoading || isLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-slate-100 to-emerald-100 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950">
        <div className="animate-pulse text-sm text-slate-500 dark:text-slate-300">
          Syncing your privacy controls…
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-100 to-emerald-100 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <header className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:bg-white/10 dark:text-slate-200">
            Step 3 of 3
          </span>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
            Control your privacy vibes
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Choose how much of your identity is visible and how you want recruiters, peers, and Now Rooms to find you.
          </p>
        </header>

        <div className="space-y-6">
          <section className="glass rounded-3xl border border-white/40 p-6 shadow-lg backdrop-blur">
            <header className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Dual identity mode
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Keep your studio alias public while unlocking your verified profile over time.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDualIdentity((prev) => !prev)}
                className={`relative inline-flex h-9 w-16 items-center rounded-full p-1 transition ${
                  dualIdentity ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'
                }`}
                aria-pressed={dualIdentity}
              >
                <span
                  className={`absolute top-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-700 shadow transition-transform ${
                    dualIdentity ? 'translate-x-7' : 'translate-x-0'
                  }`}
                >
                  {dualIdentity ? 'On' : 'Off'}
                </span>
              </button>
            </header>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li>• Studio alias visible to all campus users.</li>
              <li>• Professional identity unlocks after mutual connection or invite.</li>
              <li>• Recruiters see your verified info when you opt-in.</li>
            </ul>
          </section>

          <section className="glass rounded-3xl border border-white/40 p-6 shadow-lg backdrop-blur">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Discovery preferences</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={discoverable}
                  onChange={(event) => setDiscoverable(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-400"
                />
                <span>
                  Show me in Now Rooms when I’m within range (location is approximate and never stored).
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={recruiterOptIn}
                  onChange={(event) => setRecruiterOptIn(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-400"
                />
                <span>Allow recruiters to request access to my professional profile.</span>
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={shareAnalytics}
                  onChange={(event) => setShareAnalytics(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-400"
                />
                <span>Share anonymous activity analytics to improve campus experiences.</span>
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-6 text-sm text-slate-600 shadow-inner backdrop-blur dark:border-slate-700 dark:bg-white/5 dark:text-slate-300">
            Monetization placeholder — 728 × 90
          </section>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:border-red-500/40 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => router.push('/onboarding/profile')}
              className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/70 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white/90 dark:border-white/10 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20"
            >
              Back
            </button>
            <button
              disabled={mutation.isPending}
              onClick={() => {
                setError(null)
                mutation.mutate()
              }}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition hover:shadow-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending ? 'Finishing…' : 'Finish & Enter Vibe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
