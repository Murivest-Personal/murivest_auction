import { getSupabaseService } from "../src/lib/supabase/server";
import { rm } from "fs/promises";
import path from "path";

/* Demo utility: remove test buyers (and their private files) by email. */
async function main() {
  const email = process.argv[2];
  if (!email) throw new Error("usage: bun run scripts/cleanup-buyers.ts <email>");
  const supabase = getSupabaseService();
  const { data: buyers, error } = await supabase
    .from("buyer_registrations")
    .select("id, email, pof_storage_path")
    .eq("email", email);
  if (error) throw error;
  for (const b of buyers ?? []) {
    await supabase.from("vault_access_logs").delete().eq("buyer_id", b.id);
    await supabase.from("vault_notifications").delete().eq("buyer_id", b.id);
    await supabase.from("vault_access_grants").delete().eq("buyer_id", b.id);
    await supabase.from("nda_acceptances").delete().eq("buyer_id", b.id);
    await supabase.from("buyer_registrations").delete().eq("id", b.id);
    if (b.pof_storage_path) {
      await rm(
        path.join(
          process.cwd(),
          ".private-store",
          path.dirname(b.pof_storage_path)
        ),
        { recursive: true, force: true }
      );
    }
    console.log("deleted", b.email);
  }
}

main();