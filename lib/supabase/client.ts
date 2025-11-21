import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'
import { clientEnv } from '../env.client'

let browserClient: SupabaseClient<Database> | null = null

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createClient<Database>(clientEnv.NEXT_PUBLIC_SUPABASE_URL, clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 5,
        },
      },
    })
  }
  return browserClient
}

