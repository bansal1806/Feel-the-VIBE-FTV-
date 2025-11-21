'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { Bell, Moon, Sun } from 'lucide-react'
import { adSlots, featureFlags } from '@/lib/config'
import ARRadar from '@/components/ARRadar'
import UserMenu from '@/components/UserMenu'
import { useState, useEffect } from 'react'
import { useTheme } from '@/components/providers/ThemeProvider'

interface AppShellProps {
  heading?: ReactNode
  subheading?: ReactNode
  rightSection?: ReactNode
  bottomNav?: ReactNode
  children: ReactNode
  adTop?: ReactNode
  adSidebar?: ReactNode
}

export default function AppShell({
  heading,
  subheading,
  rightSection,
  bottomNav,
  children,
  adTop,
  adSidebar,
}: AppShellProps) {
  const { theme, toggleTheme } = useTheme()
  const [user, setUser] = useState<{ id: string; email: string; alias?: string; name?: string | null; avatarUrl?: string | null } | null>(null)

  useEffect(() => {
    // Fetch current user session
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user)
        }
      })
      .catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-theme dark:bg-black-pure bg-cream-pure transition-colors">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-24 pt-safe md:flex-row md:gap-6 md:pt-12 lg:px-10">
        {/* Left Panel - AR Radar & Navigation */}
        <aside className="hidden w-64 shrink-0 md:flex md:flex-col md:gap-6 relative z-[45]">
          <Link href="/app" className="glass-neon rounded-3xl p-6 dark:shadow-neon-cyan shadow-amber-200/20">
            <div className="text-sm font-semibold uppercase tracking-widest gradient-text">
              Vibe
            </div>
            <p className="mt-3 text-lg font-bold text-theme dark:text-white text-gray-900">
              Campus connections, <span className="gradient-text">reimagined</span>.
            </p>
          </Link>
          
          {/* AR Radar Section */}
          <div className="glass-neon rounded-3xl p-6 dark:border-neon-cyan/30 border-amber-300/40">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-widest dark:text-neon-cyan text-amber-700">
                AR Radar
              </h3>
            </div>
            <div className="flex justify-center">
              <ARRadar />
            </div>
            <p className="mt-4 text-xs text-theme-muted dark:text-white/60 text-gray-600 text-center">
              Real-time virtual map of active users around campus
            </p>
          </div>

          {/* Desktop Navigation */}
          {bottomNav && (
            <div className="glass-neon rounded-3xl p-4 dark:border-neon-purple/30 border-amber-300/40">
              <h3 className="text-xs font-semibold uppercase tracking-widest dark:text-neon-purple text-amber-700 mb-3">
                Navigation
              </h3>
              <div className="space-y-2 flex flex-col">{bottomNav}</div>
            </div>
          )}

          {featureFlags.ads && (
            <div className="glass-neon flex-1 rounded-3xl dark:border-neon-purple/30 border-amber-300/40 p-6 dark:shadow-neon-purple shadow-amber-200/20">
              <h3 className="text-sm font-semibold uppercase tracking-widest dark:text-neon-purple text-amber-700">
                Sponsored
              </h3>
              <div className="mt-3 text-sm text-theme-muted dark:text-white/70 text-gray-600">
                {adSidebar ??
                  `${adSlots.find((slot) => slot.id === 'sidebar-banner')?.label ?? 'Campus Partner Banner'} — configure creative via ad server.`}
              </div>
            </div>
          )}
        </aside>

        <div className="flex-1">
          <header className="glass-neon sticky top-safe z-40 mb-6 flex items-center justify-between rounded-3xl dark:border-neon-cyan/30 border-amber-300/40 px-5 py-4 dark:shadow-neon-cyan shadow-amber-200/20 md:static">
            <div className="flex items-center gap-4">
              <ARRadar className="md:hidden" />
              <div>
                {heading ?? (
                  <h1 className="text-xl font-bold text-theme dark:text-white text-gray-900">
                    Welcome back<span className="dark:text-neon-cyan text-amber-600">.</span>
                  </h1>
                )}
                {subheading && <p className="text-sm text-theme-muted dark:text-white/60 text-gray-600">{subheading}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative flex h-10 w-10 items-center justify-center rounded-full dark:border-neon-pink/30 border-amber-400/50 dark:bg-black-deep/80 bg-cream-soft/80 backdrop-blur-xl dark:hover:border-neon-pink/50 hover:border-amber-500/70 transition">
                <Bell className="h-4 w-4 dark:text-neon-pink text-amber-600" />
                <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full dark:bg-neon-green bg-amber-500 dark:shadow-neon-green shadow-amber-400" />
              </button>
              <button
                onClick={toggleTheme}
                className="flex h-10 w-10 items-center justify-center rounded-full dark:border-neon-yellow/30 border-amber-400/50 dark:bg-black-deep/80 bg-cream-soft/80 backdrop-blur-xl dark:hover:border-neon-yellow/50 hover:border-amber-500/70 transition"
              >
                {theme === 'dark' ? (
                  <Moon className="h-4 w-4 dark:text-neon-yellow text-amber-600" />
                ) : (
                  <Sun className="h-4 w-4 dark:text-neon-yellow text-amber-600" />
                )}
              </button>
              {user && <UserMenu user={user} />}
              {rightSection}
            </div>
          </header>

          {featureFlags.ads && adTop && (
            <div className="mb-6 rounded-2xl dark:border-dashed border-neon-purple/30 border-amber-300/40 dark:bg-black-deep/50 bg-cream-soft/50 p-4 text-xs font-semibold uppercase tracking-wide dark:text-neon-purple text-amber-700">
              {adTop}
            </div>
          )}

          <main className="mb-10">{children}</main>
        </div>
      </div>

      {bottomNav && (
        <div className="fixed inset-x-0 bottom-0 z-50 dark:border-neon-cyan/20 border-amber-300/30 dark:bg-black-deep/90 bg-cream-warm/90 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-md items-center justify-around px-2 py-3 flex-row">{bottomNav}</div>
        </div>
      )}
    </div>
  )
}

