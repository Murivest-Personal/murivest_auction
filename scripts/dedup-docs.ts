import { db } from "../src/lib/db";
/* Remove the duplicate documents created by the second setup run. */
async function main() {
  const dups = ["991ba16a-abd4-4546-8bed-bc227f897495", "2d8e26cc-d2ba-4c4e-97e4-d14fbf42e527"];
  for (const id of dups) {
    await db.vaultDocumentVersion.deleteMany({ where: { documentId: id } });
    await db.vaultNotification.deleteMany({ where: { documentId: id } });
    await db.vaultAccessLog.deleteMany({ where: { documentId: id } });
    await db.vaultDocument.delete({ where: { id } });
    console.log("removed", id);
  }
}
main();
