'use client'

interface TextAreaProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: TextAreaProps) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-medium text-white/80 mb-1 block">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-xl border border-neon-cyan/30 bg-black-deep/80 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none transition resize-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20"
      />
    </label>
  )
}

