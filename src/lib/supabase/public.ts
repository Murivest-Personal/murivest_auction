/* Public (anon) Supabase client for server-side reads governed by
   RLS — approved comments only. Used in server components so
   approved comments are present in the rendered HTML (indexable
   and citable). The anon key is safe to use server-side here; it
   can only ever select rows where status = 'approved'. */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function supabasePublicConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

let cached: SupabaseClient | null = null;

export function getSupabasePublic(): SupabaseClient | null {
  if (!supabasePublicConfigured()) return null;
  if (cached) return cached;
  cached = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
  return cached;
}
