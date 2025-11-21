'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    // Check authentication status
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/sign-in?redirect=' + encodeURIComponent(window.location.pathname))
        }
      })
      .catch(() => {
        router.push('/sign-in')
      })
  }, [router])

  return <>{children}</>
}
