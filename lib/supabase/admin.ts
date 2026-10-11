import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Service-role client – bypasses RLS.
 * NEVER export this to the browser or use it in route handlers without
 * a separate auth+role check. Allowed uses:
 *   - Creating new auth users (seed script, admin actions)
 *   - Cleaning up orphan auth users after a failed profile insert
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
