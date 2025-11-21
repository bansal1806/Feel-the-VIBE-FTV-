'use client'

import { LucideIcon } from 'lucide-react'

interface ProfileSectionProps {
  icon: LucideIcon
  title: string
  color: 'neon-cyan' | 'neon-pink' | 'neon-yellow' | 'neon-purple' | 'neon-green'
  children: React.ReactNode
}

const colorClasses = {
  'neon-cyan': 'border-neon-cyan/30 shadow-neon-cyan',
  'neon-pink': 'border-neon-pink/30 shadow-neon-pink',
  'neon-yellow': 'border-neon-yellow/30 shadow-neon-yellow',
  'neon-purple': 'border-neon-purple/30 shadow-neon-purple',
  'neon-green': 'border-neon-green/30 shadow-neon-green',
}

const iconColorClasses = {
  'neon-cyan': 'text-neon-cyan',
  'neon-pink': 'text-neon-pink',
  'neon-yellow': 'text-neon-yellow',
  'neon-purple': 'text-neon-purple',
  'neon-green': 'text-neon-green',
}

export function ProfileSection({ icon: Icon, title, color, children }: ProfileSectionProps) {
  return (
    <section className={`glass-neon rounded-3xl border p-6 ${colorClasses[color]}`}>
      <header className="mb-4 flex items-center gap-3">
        <Icon className={`h-5 w-5 ${iconColorClasses[color]}`} />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </header>
      {children}
    </section>
  )
}

