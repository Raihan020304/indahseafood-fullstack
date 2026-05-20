// lib/supabase/server.ts
// Digunakan di Server Components & API Routes
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Service role client - bypass RLS (hanya untuk server-side)
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// Anon client untuk server (read-only public data)
export function createServerAnonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
