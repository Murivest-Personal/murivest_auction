import { getSupabaseService } from "../src/lib/supabase/server";

async function main() {
  const { data, error } = await getSupabaseService()
    .from("vault_documents")
    .select("id, title, property_slug, created_at")
    .order("created_at", { ascending: true });
  if (error) throw error;
  (data ?? []).forEach((d) =>
    console.log(
      `${d.created_at} | ${d.property_slug} | ${d.title} | ${d.id}`
    )
  );
}

main();