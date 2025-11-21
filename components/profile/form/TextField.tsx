'use client'

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  className?: string
  type?: string
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
  className = '',
  type = 'text',
}: TextFieldProps) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="text-xs font-medium text-white/80 mb-1 block">
        {label} {required && <span className="text-neon-pink">*</span>}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-neon-cyan/30 bg-black-deep/80 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20"
      />
    </label>
  )
}

