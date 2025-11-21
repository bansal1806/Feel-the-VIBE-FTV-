'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Home, Flame, Radar, Shield, MessageCircle } from 'lucide-react'
import ChatView from './ChatView'
import TimecapsulesView from './TimecapsulesView'
import HLRView from './HLRView'
import DualIdentityView from './DualIdentityView'
import HomePage from './HomePage'
import { bus } from '@/lib/bus'
import React from 'react'
import ToastOverlay from './ToastOverlay'
import { globalState } from '@/lib/state'
import AppShell from './layout/AppShell'
import { adSlots, featureFlags } from '@/lib/config'
import { useFeed, type FeedItem } from '@/lib/hooks/useFeed'
import { SwipeDirection, SwipeTargetType } from '@/lib/types/swipe'


type Tab = 'home' | 'hlr' | 'chat' | 'capsules' | 'dual'

export default function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  useEffect(() => {
    const off = bus.on('navigate', ({ tab }) => {
      if (['home','hlr','chat','capsules','dual'].includes(tab)) {
        setActiveTab(tab as Tab)
      }
    })
    return off
  }, [])

  const [credits, setCredits] = useState(globalState.get().credits)
  useEffect(() => {
    const unsubscribe = globalState.subscribe((s) => setCredits(s.credits))
    return () => unsubscribe()
  }, [])
  const { data: feedItems, isLoading: feedLoading } = useFeed()
  const queryClient = useQueryClient()

  const swipeMutation = useMutation({
    mutationFn: async ({ item, direction }: { item: FeedItem; direction: 'left' | 'right' }) => {
      const response = await fetch('/api/swipes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: mapTargetType(item),
          targetId: item.id,
          direction: direction === 'right' ? SwipeDirection.LIKE : SwipeDirection.PASS,
        }),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to record swipe' }))
        throw new Error(error.error ?? 'Failed to record swipe')
      }
      return response.json()
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to record swipe'
      bus.emit('toast', { message })
    },
    onSuccess: (_, variables) => {
      if (variables.item.type === 'event') {
        void queryClient.invalidateQueries({ queryKey: ['events'] })
      }
      if (variables.item.type === 'room') {
        void queryClient.invalidateQueries({ queryKey: ['rooms'] })
      }
      void queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })

  const handleSwipe = async (item: FeedItem, direction: 'left' | 'right') => {
    await swipeMutation.mutateAsync({ item, direction })
  }

  const tabs = [
    { id: 'home' as Tab, icon: Home, label: 'Home', color: 'neon-green' },
    { id: 'hlr' as Tab, icon: Radar, label: 'HLR', color: 'neon-blue' },
    { id: 'chat' as Tab, icon: MessageCircle, label: 'Chat', color: 'neon-cyan' },
    { id: 'capsules' as Tab, icon: Flame, label: 'Capsules', color: 'neon-yellow' },
    { id: 'dual' as Tab, icon: Shield, label: 'Dual', color: 'neon-purple' },
  ]

  return (
    <AppShell
      heading={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl neon-gradient-green-blue text-black-pure shadow-neon-green">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold gradient-text">Vibe</h1>
            <p className="text-xs text-white/60">Discover, join, and elevate your campus presence</p>
          </div>
        </div>
      }
      rightSection={
        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-neon-green/30 bg-neon-green/10 px-3 py-2 text-xs font-semibold text-neon-green">
            SkillCreds: <span className="text-neon-cyan">{credits}</span>
          </div>
        </div>
      }
      adTop={
        featureFlags.ads ? (
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
              {adSlots.find((slot) => slot.id === 'sponsored-spotlight')?.label ?? 'Sponsored Spotlight'}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {adSlots.find((slot) => slot.id === 'sponsored-spotlight')?.size ?? '320x100'}
            </span>
          </div>
        ) : null
      }
      bottomNav={
        <>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const getActiveClasses = () => {
              switch (tab.color) {
                case 'neon-green':
                  return 'border-neon-green/50 bg-neon-green/20 text-neon-green shadow-neon-green'
                case 'neon-blue':
                  return 'border-neon-blue/50 bg-neon-blue/20 text-neon-blue shadow-neon-blue'
                case 'neon-cyan':
                  return 'border-neon-cyan/50 bg-neon-cyan/20 text-neon-cyan shadow-neon-cyan'
                case 'neon-yellow':
                  return 'border-neon-yellow/50 bg-neon-yellow/20 text-neon-yellow shadow-neon-yellow'
                case 'neon-purple':
                  return 'border-neon-purple/50 bg-neon-purple/20 text-neon-purple shadow-neon-purple'
                default:
                  return 'border-neon-green/50 bg-neon-green/20 text-neon-green shadow-neon-green'
              }
            }
            const getTextColor = () => {
              switch (tab.color) {
                case 'neon-green':
                  return 'text-neon-green'
                case 'neon-blue':
                  return 'text-neon-blue'
                case 'neon-cyan':
                  return 'text-neon-cyan'
                case 'neon-yellow':
                  return 'text-neon-yellow'
                case 'neon-purple':
                  return 'text-neon-purple'
                default:
                  return 'text-neon-green'
              }
            }
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex w-full flex-row items-center gap-3 rounded-xl border border-white/10 p-3 text-xs font-medium transition hover:border-white/20 md:flex-col md:items-center md:gap-2 md:p-3"
              >
                <motion.div
                  animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                  className={`rounded-xl p-2 border transition ${
                    isActive ? getActiveClasses() : 'border-white/10 bg-black-deep/50 text-white/40'
                  }`}
                >
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                </motion.div>
                <span className={`${isActive ? `${getTextColor()} font-semibold` : 'text-white/40'} md:text-sm`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </>
      }
    >
      <div className={`mx-auto space-y-6 pb-10 ${
        activeTab === 'home' ? 'w-full max-w-7xl' : 'max-w-3xl'
      }`}>
        {activeTab === 'home' && (
          <HomePage 
            items={feedItems} 
            isLoading={feedLoading || swipeMutation.isPending} 
            onSwipe={handleSwipe} 
          />
        )}
        {activeTab === 'hlr' && <HLRView />}
        {activeTab === 'chat' && <ChatView />}
        {activeTab === 'capsules' && <TimecapsulesView />}
        {activeTab === 'dual' && <DualIdentityView />}
      </div>
      <ToastOverlay />
    </AppShell>
  )
}


function mapTargetType(item: FeedItem): SwipeTargetType {
  switch (item.type) {
    case 'user':
      return SwipeTargetType.USER
    case 'event':
      return SwipeTargetType.EVENT
    case 'room':
      return SwipeTargetType.ROOM
    default:
      return SwipeTargetType.USER
  }
}
