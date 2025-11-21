'use client'

import { motion } from 'framer-motion'
import { Check, CheckCheck } from 'lucide-react'

interface ChatBubbleProps {
  message: string
  isMe: boolean
  alias?: string
  timestamp: string
  read?: boolean
}

export default function ChatBubble({ message, isMe, alias, timestamp, read }: ChatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
        {!isMe && alias && (
          <div className="text-xs text-white/60 mb-1 ml-2 font-medium">@{alias}</div>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isMe
              ? 'neon-gradient-cyan-yellow text-black-pure rounded-tr-sm shadow-neon-cyan'
              : 'bg-black-deep/80 text-white rounded-tl-sm border border-neon-cyan/30'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message}</p>
        </div>
        <div className={`flex items-center gap-1 mt-1 text-xs text-white/40 ${isMe ? 'justify-end mr-2' : 'justify-start ml-2'}`}>
          <span>{timestamp}</span>
          {isMe && (read ? <CheckCheck className="w-3 h-3 text-neon-green" /> : <Check className="w-3 h-3 text-white/40" />)}
        </div>
      </div>
    </motion.div>
  )
}
