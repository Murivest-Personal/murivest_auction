import { db } from "../src/lib/db";
async function main() {
  const docs = await db.vaultDocument.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true, propertySlug: true, createdAt: true },
  });
  docs.forEach((d) => console.log(`${d.createdAt.toISOString()} | ${d.propertySlug} | ${d.title} | ${d.id}`));
}
main();
