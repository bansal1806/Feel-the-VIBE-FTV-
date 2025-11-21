'use client'

import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { bus } from '@/lib/bus'

export default function ToastOverlay() {
  const [queue, setQueue] = React.useState<{ id: number; message: string }[]>([])
  const lastRef = React.useRef<{ msg: string; at: number }>({ msg: '', at: 0 })
  React.useEffect(() => {
    return bus.on('toast', ({ message }) => {
      const now = Date.now()
      const last = lastRef.current
      // Deduplicate same message within 3s
      if (last.msg === message && now - last.at < 3000) return
      lastRef.current = { msg: message, at: now }
      const id = now
      setQueue((q) => {
        const next = [...q, { id, message }]
        // Cap queue length
        return next.slice(-3)
      })
      setTimeout(() => setQueue((q) => q.filter((t) => t.id !== id)), 2200)
    })
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[70] flex items-end justify-center pb-28">
      <div className="space-y-2">
        <AnimatePresence>
          {queue.map((t) => (
            <motion.div key={t.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="glass px-4 py-2 rounded-lg text-slate-800 dark:text-slate-200 shadow">
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}


