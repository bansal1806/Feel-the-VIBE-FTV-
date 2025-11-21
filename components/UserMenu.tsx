'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface UserMenuProps {
  user?: {
    id: string
    email: string
    alias?: string
    name?: string | null
    avatarUrl?: string | null
  }
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        buttonRef.current &&
        dropdownRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && buttonRef.current && mounted) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      })
    } else {
      setDropdownPosition(null)
    }
  }, [isOpen, mounted])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/sign-in')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (!user) {
    return null
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : (user.alias || user.email.split('@')[0]).slice(0, 2).toUpperCase()

  if (!mounted) {
    return (
      <div className="relative z-[55]">
        <button
          ref={buttonRef}
          className="flex items-center gap-2 rounded-full dark:border-neon-cyan/30 border-amber-300/50 dark:bg-black-deep/80 bg-cream-soft/80 backdrop-blur-xl p-1.5 pr-3 dark:hover:border-neon-cyan/50 hover:border-amber-400/70 transition"
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.alias || user.email}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br dark:from-neon-cyan dark:to-neon-blue from-amber-400 to-amber-600 text-xs font-bold dark:text-black-pure text-white">
              {initials}
            </div>
          )}
          <ChevronDown className="h-3 w-3 dark:text-neon-cyan text-amber-600" />
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="relative z-[55]" ref={menuRef}>
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-full border border-neon-cyan/30 bg-black-deep/80 backdrop-blur-xl p-1.5 pr-3 hover:border-neon-cyan/50 transition"
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.alias || user.email}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-neon-cyan to-neon-blue text-xs font-bold text-black-pure">
              {initials}
            </div>
          )}
          <ChevronDown className="h-3 w-3 text-neon-cyan" />
        </button>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && dropdownPosition && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  position: 'fixed',
                  top: `${dropdownPosition.top}px`,
                  right: `${dropdownPosition.right}px`,
                  zIndex: 200,
                }}
                className="w-56 rounded-xl dark:border-neon-cyan/30 border-amber-300/50 dark:bg-black-deep/95 bg-cream-warm/95 backdrop-blur-xl dark:shadow-neon-cyan shadow-amber-200/20 overflow-hidden"
              >
                <div className="p-2">
                  <div className="px-3 py-2 border-b dark:border-white/10 border-gray-300/30">
                    <p className="text-sm font-semibold text-theme dark:text-white text-gray-900">@{user.alias || user.email.split('@')[0]}</p>
                    <p className="text-xs text-theme-muted dark:text-white/60 text-gray-600 truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      router.push('/app/profile')
                      setIsOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-theme dark:text-white/80 text-gray-800 dark:hover:bg-white/5 hover:bg-gray-200/50 rounded-lg transition"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      router.push('/app/settings')
                      setIsOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-theme dark:text-white/80 text-gray-800 dark:hover:bg-white/5 hover:bg-gray-200/50 rounded-lg transition"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>

                  <div className="border-t dark:border-white/10 border-gray-300/30 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 dark:hover:bg-red-500/10 hover:bg-red-100/50 rounded-lg transition"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}

