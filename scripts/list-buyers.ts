import { getSupabaseService } from "../src/lib/supabase/server";

async function main() {
  const { data, error } = await getSupabaseService()
    .from("buyer_registrations")
    .select("id, email, pof_storage_path, classification");
  if (error) throw error;
  console.log(JSON.stringify(data, null, 2));
}

main();