import { getSupabaseService } from "../src/lib/supabase/server";

/* Remove the duplicate documents created by the second setup run. */
async function main() {
  const supabase = getSupabaseService();
  const dups = [
    "991ba16a-abd4-4546-8bed-bc227f897495",
    "2d8e26cc-d2ba-4c4e-97e4-d14fbf42e527",
  ];
  for (const id of dups) {
    await supabase.from("vault_document_versions").delete().eq("document_id", id);
    await supabase.from("vault_notifications").delete().eq("document_id", id);
    await supabase.from("vault_access_logs").delete().eq("document_id", id);
    await supabase.from("vault_documents").delete().eq("id", id);
    console.log("removed", id);
  }
}

main();