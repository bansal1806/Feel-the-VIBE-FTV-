'use client'

import ProfilePage from './profile/ProfilePage'

// Re-export ProfilePage as DualIdentityView for backward compatibility
export default function DualIdentityView() {
  return <ProfilePage />
}
