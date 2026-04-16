import { useEffect, useState } from 'react'

/**
 * A hook to determine if a component is currently mounted on the client.
 * Essential for preventing hydration mismatches by ensuring client-specific 
 * logic only runs after the initial mount.
 */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return isMounted
}
