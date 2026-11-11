/* Server-side fetch of approved public comments for a property.
   Reads through the anon client — RLS permits selecting approved
   rows only. Returns [] when Supabase is not configured so pages
   render normally. */

import { getSupabasePublic } from "@/lib/supabase/public";
import type { PublicComment } from "@/lib/types";

export async function getApprovedComments(
  propertySanityId: string
): Promise<PublicComment[]> {
  const supabase = getSupabasePublic();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("property_comments")
      .select("author_name, body, created_at")
      .eq("property_sanity_id", propertySanityId)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return [];
    return (data ?? []) as PublicComment[];
  } catch {
    return [];
  }
}
