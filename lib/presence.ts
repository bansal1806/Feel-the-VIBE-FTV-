type TypingCallback = (isTyping: boolean) => void
type OnlineCallback = (isOnline: boolean) => void

export function subscribeTyping(conversationId: string, cb: TypingCallback) {
  let active = true
  const tick = () => {
    if (!active) return
    // Simulate random typing bursts
    cb(true)
    setTimeout(() => cb(false), 1200 + Math.random() * 1200)
    const next = 4000 + Math.random() * 6000
    timer = setTimeout(tick, next)
  }
  let timer = setTimeout(tick, 3000)
  return () => { active = false; clearTimeout(timer) }
}

export function subscribeOnline(alias: string, cb: OnlineCallback) {
  let online = true
  cb(online)
  const id = setInterval(() => {
    online = !online
    cb(online)
  }, 15000)
  return () => clearInterval(id)
}


