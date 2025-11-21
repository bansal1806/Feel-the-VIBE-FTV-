import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import type { Database } from './types'
import { serverEnv } from '../env.server'
import { clientEnv } from '../env.client'

let serverClient: SupabaseClient<Database> | null = null

export function getSupabaseServiceClient() {
  if (!serverClient) {
    serverClient = createClient<Database>(
      serverEnv.NEXT_PUBLIC_SUPABASE_URL,
      serverEnv.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )
  }
  return serverClient
}

export function getSupabaseServerClient() {
  return createClient<Database>(serverEnv.NEXT_PUBLIC_SUPABASE_URL, clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      headers: Object.fromEntries(headers()),
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

