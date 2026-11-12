import { db } from "../src/lib/db";
import { rm } from "fs/promises";
import path from "path";
/* Demo utility: remove test buyers (and their private files) by email. */
async function main() {
  const email = process.argv[2];
  if (!email) throw new Error("usage: bun run scripts/cleanup-buyers.ts <email>");
  const buyers = await db.buyerRegistration.findMany({ where: { email } });
  for (const b of buyers) {
    await db.vaultAccessLog.deleteMany({ where: { buyerId: b.id } });
    await db.vaultNotification.deleteMany({ where: { buyerId: b.id } });
    await db.vaultAccessGrant.deleteMany({ where: { buyerId: b.id } });
    await db.ndaAcceptance.deleteMany({ where: { buyerId: b.id } });
    await db.buyerRegistration.delete({ where: { id: b.id } });
    if (b.pofStoredPath) {
      await rm(path.join(process.cwd(), ".private-store", path.dirname(b.pofStoredPath)), { recursive: true, force: true });
    }
    console.log("deleted", b.email);
  }
}
main();
