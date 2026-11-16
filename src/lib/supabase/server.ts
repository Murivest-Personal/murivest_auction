/* Server-only Supabase client (service role).
 *
 * All database access for the buyer area and the back office goes
 * through this client. The service-role key is server-only and must
 * never be exposed to the browser — every query runs inside a route
 * handler, server component or script.
 *
 * Configuration:
 *   NEXT_PUBLIC_SUPABASE_URL   (falls back to SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function supabaseConfigured(): boolean {
  return Boolean(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function getSupabaseService(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}