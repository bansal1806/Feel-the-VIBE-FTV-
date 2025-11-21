'use client'

interface ToggleRowProps {
  label: string
  description: string
  value: boolean
  onChange: (value: boolean) => void
}

export function ToggleRow({ label, description, value, onChange }: ToggleRowProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/20 bg-black-deep/50 px-4 py-3 text-left text-sm transition hover:border-neon-purple/50 hover:bg-neon-purple/10"
    >
      <div>
        <div className="font-medium text-white">{label}</div>
        <div className="text-xs text-white/60">{description}</div>
      </div>
      <div className={`flex h-6 w-12 items-center rounded-full transition ${value ? 'bg-neon-green' : 'bg-white/20'}`}>
        <div className={`h-5 w-5 rounded-full bg-white shadow transition ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </div>
    </button>
  )
}

