export function formatDistanceFromNow(dateInput: string | Date) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  const diffMs = date.getTime() - Date.now()
  if (diffMs <= 0) return 'soon'
  const minutes = Math.round(diffMs / (1000 * 60))
  if (minutes < 60) return `${minutes}m`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.round(hours / 24)
  return `${days}d`
}

export function formatDistanceToNow(dateInput: string | Date) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  const diffMs = Date.now() - date.getTime()
  if (diffMs <= 0) return 'now'
  const minutes = Math.round(diffMs / (1000 * 60))
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.round(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  const months = Math.round(days / 30)
  if (months < 12) return `${months}mo ago`
  const years = Math.round(days / 365)
  return `${years}y ago`
}

