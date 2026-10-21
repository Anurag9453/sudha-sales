// ============================================================================
// Supabase Server Client: src/database/supabase-server.ts
// Strictly server-only. Never import this file into Client Components.
// ============================================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getServerEnv, isSupabaseConfigured, publicEnv } from '@/lib/env';

/**
 * Public/Anon server client (respects RLS policies for storefront reads)
 */
export function getSupabaseServerAnonClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Privileged Admin server client using `SUPABASE_SERVICE_ROLE_KEY`.
 * Only used inside verified admin server actions / API routes.
 */
export function getSupabaseServerAdminClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { supabaseServiceRoleKey } = getServerEnv();
  const keyToUse =
    supabaseServiceRoleKey &&
    !supabaseServiceRoleKey.includes('your-supabase-service-role-key')
      ? supabaseServiceRoleKey
      : publicEnv.supabaseAnonKey;

  return createClient(publicEnv.supabaseUrl, keyToUse, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
