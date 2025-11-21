export const featureFlags = {
  ads: process.env.NEXT_PUBLIC_FEATURE_ADS !== '0',
}

export type AdSlot = {
  id: string
  label: string
  description: string
  size: string
}

export const adSlots: AdSlot[] = [
  {
    id: 'sponsored-spotlight',
    label: 'Sponsored Spotlight',
    description: 'Premium campus partners highlighted near the header.',
    size: '320x100',
  },
  {
    id: 'feed-interstitial',
    label: 'Feed Interstitial',
    description: 'Interstitial placement within swipe deck or feed modules.',
    size: '728x90',
  },
  {
    id: 'sidebar-banner',
    label: 'Sidebar Banner',
    description: 'Right-rail banner for desktop layouts.',
    size: '300x600',
  },
]

