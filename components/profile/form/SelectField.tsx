'use client'

interface SelectFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}

export function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-medium text-white/80 mb-1 block">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-neon-cyan/30 bg-black-deep/80 px-4 py-2 text-sm text-white outline-none transition focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20"
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

