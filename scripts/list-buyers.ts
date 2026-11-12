import { db } from "../src/lib/db";
async function main() {
  const buyers = await db.buyerRegistration.findMany({
    select: { id: true, email: true, pofStoredPath: true, classification: true },
  });
  console.log(JSON.stringify(buyers, null, 2));
}
main();
