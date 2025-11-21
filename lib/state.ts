export type Intent = 'collab' | 'study' | 'social' | 'dating' | 'mentor'
export type GlobalSlice = {
  mood: 'focus' | 'chill' | 'social' | 'creative'
  credits: number
  intents: Intent[]
  seeking: string[]
}

type Listener = (s: GlobalSlice) => void

class GlobalState {
  private state: GlobalSlice
  private listeners = new Set<Listener>()
  constructor() {
    const DEFAULT_STATE: GlobalSlice = { mood: 'focus', credits: 0, intents: ['collab','study','social'], seeking: ['UI/UX','Backend'] }
    const saved = typeof window !== 'undefined' ? localStorage.getItem('globalState') : null
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        this.state = { ...DEFAULT_STATE, ...parsed, seeking: Array.isArray(parsed?.seeking) ? parsed.seeking : DEFAULT_STATE.seeking }
      } catch {
        this.state = DEFAULT_STATE
      }
    } else {
      this.state = DEFAULT_STATE
    }
  }
  get() { return this.state }
  set(partial: Partial<GlobalSlice>) {
    this.state = { ...this.state, ...partial }
    localStorage.setItem('globalState', JSON.stringify(this.state))
    this.listeners.forEach(l => l(this.state))
  }
  subscribe(l: Listener) {
    this.listeners.add(l)
    l(this.state)
    return () => {
      this.listeners.delete(l)
    }
  }
}

export const globalState = new GlobalState()


