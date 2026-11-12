/* Server-only Supabase client (service role). Never expose the
   service-role key to the browser — all writes flow through
   /api/bids and /api/comments, which call the security-definer
   RPCs in supabase/migrations/. */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

let cached: SupabaseClient | null = null;

export function getSupabaseService(): SupabaseClient | null {
  if (!supabaseConfigured()) return null;
  if (cached) return cached;
  cached = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  return cached;
}
