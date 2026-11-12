import { db } from "../src/lib/db";
async function main() {
  const buyers = await db.buyerRegistration.findMany({ where: { email: "amina.test@murivest.com" } });
  for (const b of buyers) {
    const grants = await db.vaultAccessGrant.findMany({
      where: { buyerId: b.id, propertySlug: "westlands-office-block", revokedAt: null },
    });
    console.log(grants.length ? grants[0].id : "NONE");
  }
}
main();
