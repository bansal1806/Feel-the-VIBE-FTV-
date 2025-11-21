type EventMap = {
  navigate: { tab: string }
  action: { type: 'connect' | 'rsvp' | 'join' }
  toast: { message: string }
}

class SimpleBus {
  private target = new EventTarget()

  on<K extends keyof EventMap>(type: K, handler: (e: EventMap[K]) => void) {
    const listener = (ev: Event) => handler((ev as CustomEvent).detail)
    this.target.addEventListener(type, listener)
    return () => this.target.removeEventListener(type, listener)
  }

  emit<K extends keyof EventMap>(type: K, detail: EventMap[K]) {
    this.target.dispatchEvent(new CustomEvent(type, { detail }))
  }
}

export const bus = new SimpleBus()


