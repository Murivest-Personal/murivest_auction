import { getSupabaseService } from "../src/lib/supabase/server";

async function main() {
  const supabase = getSupabaseService();
  const { data: buyers, error } = await supabase
    .from("buyer_registrations")
    .select("id")
    .eq("email", "amina.test@murivest.com");
  if (error) throw error;
  for (const b of buyers ?? []) {
    const { data: grants } = await supabase
      .from("vault_access_grants")
      .select("id")
      .eq("buyer_id", b.id)
      .eq("property_slug", "westlands-office-block")
      .is("revoked_at", null);
    console.log(grants && grants.length ? grants[0].id : "NONE");
  }
}

main();