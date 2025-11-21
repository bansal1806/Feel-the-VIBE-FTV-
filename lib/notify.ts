import { bus } from './bus'

export async function notify(title: string, body: string) {
  if (typeof window === 'undefined') return
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, { body })
      return
    }
    if (Notification.permission !== 'denied') {
      const perm = await Notification.requestPermission()
      if (perm === 'granted') {
        new Notification(title, { body })
        return
      }
    }
  }
  bus.emit('toast', { message: `${title}: ${body}` })
}


