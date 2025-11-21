'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, Loader2, Sparkles, Lock, Users, MessageCircle } from 'lucide-react'
import ChatBubble from './ChatBubble'
import {
  useConversations,
  useConversationMessages,
  useSendMessage,
  type ConversationPayload,
  type ConversationMessagePayload,
} from '@/lib/hooks/useConversations'
import { useProfile } from '@/lib/hooks/useProfile'
import { formatDistanceToNow } from '@/lib/utils/time'
import { bus } from '@/lib/bus'

export default function ChatView() {
  const { data: profileData } = useProfile()
  const viewerId = profileData?.id
  const { data, isLoading } = useConversations()
  const conversations = useMemo(() => data ?? [], [data])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    if (!activeId && conversations.length > 0) {
      setActiveId(conversations[0].id)
    }
  }, [activeId, conversations])

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) ?? null,
    [conversations, activeId],
  )

  const { data: messagesData, refetch: refetchMessages, isFetching: isMessagesLoading } = useConversationMessages(activeId ?? '')
  const messages = messagesData ?? activeConversation?.messages ?? []

  const sendMessageMutation = useSendMessage(activeId ?? '')
  const [draft, setDraft] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const content = draft.trim()
    if (!content || !activeId) return
    try {
      await sendMessageMutation.mutateAsync({ content })
      setDraft('')
      await refetchMessages()
      // Scroll to bottom after sending
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message'
      bus.emit('toast', { message })
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <motion.section
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-neon w-full rounded-3xl border border-neon-cyan/30 p-5 shadow-neon-cyan lg:w-72"
      >
        <header className="mb-4 space-y-1">
          <h2 className="text-lg font-semibold gradient-text">Conversations</h2>
          <p className="text-xs text-white/60">Alias messaging with trust unlocks</p>
        </header>

        {isLoading && <ConversationSkeleton />}

        {!isLoading && conversations.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neon-cyan/30 bg-black-deep/50 p-6 text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-neon-cyan/50 mb-3" />
            <p className="text-sm text-white/60 mb-2">No conversations yet</p>
            <p className="text-xs text-white/40">Swipe right on users to start your first conversation.</p>
          </div>
        )}

        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setActiveId(conversation.id)}
              className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                activeId === conversation.id
                  ? 'border-neon-cyan/50 bg-neon-cyan/10 shadow-neon-cyan'
                  : 'border-white/10 bg-black-deep/50 hover:border-neon-cyan/30 hover:bg-neon-cyan/5'
              }`}
            >
              <ConversationSummary viewerId={viewerId} conversation={conversation} />
            </button>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-neon flex-1 rounded-3xl border border-neon-cyan/30 p-5 shadow-neon-cyan"
      >
        {activeConversation ? (
          <ChatDetail
            viewerId={viewerId}
            conversation={activeConversation}
            messages={messages}
            draft={draft}
            onDraftChange={setDraft}
            onSend={handleSend}
            sending={sendMessageMutation.isPending}
            loading={isMessagesLoading}
            messagesEndRef={messagesEndRef}
          />
        ) : (
          <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3 text-sm text-white/60">
            <Sparkles className="h-12 w-12 text-neon-cyan/50" />
            <p className="text-white/80">Select a conversation to begin chatting.</p>
          </div>
        )}
      </motion.section>
    </div>
  )
}

function ConversationSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((index) => (
        <div key={index} className="h-16 animate-pulse rounded-2xl bg-black-deep/50 border border-white/10" />
      ))}
    </div>
  )
}

function ConversationSummary({
  viewerId,
  conversation,
}: {
  viewerId?: string
  conversation: ConversationPayload
}) {
  const counterpart = conversation.participants.find((participant) => participant.id !== viewerId) ?? conversation.participants[0]
  const lastMessage = conversation.messages[conversation.messages.length - 1]
  return (
    <div className="flex items-center gap-3">
      {counterpart?.avatarUrl ? (
        <img
          src={counterpart.avatarUrl}
          alt={counterpart.alias}
          className="h-10 w-10 rounded-full object-cover border border-neon-cyan/30"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-neon-pink to-neon-purple text-sm font-bold text-black-pure border border-neon-cyan/30">
          {counterpart?.alias?.slice(0, 2).toUpperCase() ?? '??'}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-white truncate">@{counterpart?.alias ?? 'anonymous'}</span>
          {lastMessage && <span className="text-xs text-white/40 ml-2 flex-shrink-0">{formatDistanceToNow(lastMessage.createdAt)}</span>}
        </div>
        <div className="mt-1 text-xs text-white/60 line-clamp-1">
          {lastMessage ? lastMessage.content : 'Say hello and break the ice.'}
        </div>
      </div>
    </div>
  )
}

function ChatDetail({
  viewerId,
  conversation,
  messages,
  draft,
  onDraftChange,
  onSend,
  sending,
  loading,
  messagesEndRef,
}: {
  viewerId?: string
  conversation: ConversationPayload
  messages: ConversationMessagePayload[]
  draft: string
  onDraftChange: (value: string) => void
  onSend: () => void
  sending: boolean
  loading: boolean
  messagesEndRef: React.RefObject<HTMLDivElement>
}) {
  const counterpart =
    conversation.participants.find((participant) => participant.id !== viewerId) ?? conversation.participants[0]

  return (
    <div className="flex h-full min-h-[500px] flex-col gap-4">
      <div className="flex items-center justify-between rounded-2xl border border-neon-cyan/30 bg-neon-cyan/10 px-4 py-3">
        <div className="flex items-center gap-3">
          {counterpart?.avatarUrl ? (
            <img
              src={counterpart.avatarUrl}
              alt={counterpart.alias}
              className="h-10 w-10 rounded-full object-cover border border-neon-cyan/50"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-neon-pink to-neon-purple text-sm font-bold text-black-pure border border-neon-cyan/50">
              {counterpart?.alias?.slice(0, 2).toUpperCase() ?? '??'}
            </div>
          )}
          <div>
            <div className="font-semibold text-white">@{counterpart?.alias ?? 'anonymous'}</div>
            <div className="text-xs text-white/60">{counterpart?.headline ?? 'Building trust-based connection'}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-neon-purple/80">
          <Lock className="h-3.5 w-3.5" />
          Dual identity active
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 max-h-[500px]">
        {loading && (
          <div className="flex justify-center py-6 text-xs text-white/60">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-neon-cyan" />
            Loading messages…
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="h-12 w-12 text-neon-cyan/30 mb-3" />
            <p className="text-sm text-white/60">No messages yet</p>
            <p className="text-xs text-white/40 mt-1">Start the conversation!</p>
          </div>
        )}
        {!loading &&
          messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message.content}
              isMe={viewerId === message.sender.id}
              alias={message.sender.alias}
              timestamp={formatDistanceToNow(message.createdAt)}
              read
            />
          ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="rounded-2xl border border-neon-cyan/30 bg-black-deep/50 p-3">
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                onSend()
              }
            }}
            placeholder="Send a message…"
            className="flex-1 rounded-xl border border-neon-cyan/30 bg-black-deep/80 px-4 py-2 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20"
          />
          <button
            onClick={onSend}
            disabled={sending || !draft.trim()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl neon-gradient-cyan-yellow text-black-pure shadow-neon-cyan transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-white/40">
          <Users className="h-3 w-3" />
          Trust stage unlocks personal profile details as conversation grows.
        </div>
      </div>
    </div>
  )
}

