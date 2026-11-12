import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getBuyerSessionId } from "@/lib/buyer/session";
import { classificationLabel } from "@/lib/buyer/qualification";
import { getPropertyBySlug } from "@/lib/content";
import { VaultGate } from "@/components/vault/VaultGate";
import { Container } from "@/components/ui/Container";
import { AUCTION_DISCLOSURE } from "@/lib/legal";

type Params = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Data room | Murivest Group Ltd`,
    robots: { index: false, follow: false },
  };
}

/* Per-property data room (portal). Session, classification, grant
   and NDA are enforced by the VaultGate's API; this page adds the
   property header, marks notifications read, and renders the full
   data room with version history and the PDF viewer. */
export default async function DataRoomPage({ params }: Params) {
  const { slug } = await params;
  const buyerId = await getBuyerSessionId();
  if (!buyerId) redirect("/buyers/sign-in");

  const buyer = await db.buyerRegistration.findUnique({
    where: { id: buyerId },
    select: { fullName: true, classification: true },
  });
  if (!buyer) redirect("/buyers/sign-in");

  /* Mark this property's notifications as read. */
  await db.vaultNotification.updateMany({
    where: { buyerId, propertySlug: slug, readAt: null },
    data: { readAt: new Date() },
  });

  let propertyTitle: string | null = null;
  let propertyMarket: string | null = null;
  try {
    const property = await getPropertyBySlug(slug);
    if (property) {
      propertyTitle = property.title;
      propertyMarket = property.market;
    }
  } catch {
    /* Sanity unavailable — fall back to the slug. */
  }

  return (
    <Container className="py-14 md:py-20">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-10">
          <ol className="flex flex-wrap items-center gap-2 text-[0.6rem] tracking-[0.2em] uppercase text-charcoal font-body">
            <li>
              <Link href="/buyers/portal" className="hover:text-gold transition-colors">
                Buyer portal
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-green">
              Data room
            </li>
          </ol>
        </nav>

        <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
          Confidential data room
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-light text-green leading-[1.15] mb-3">
          {propertyTitle ?? slug}
        </h1>
        <p className="text-[0.85rem] text-charcoal mb-2">
          {propertyMarket === "uk"
            ? "United Kingdom"
            : propertyMarket === "kenya"
              ? "Kenya"
              : ""}{" "}
          · Signed in as {buyer.fullName} ·{" "}
          {classificationLabel(buyer.classification)}
        </p>
        <p className="text-[0.75rem] leading-[1.7] text-charcoal mb-10">
          All access to this data room is logged against your buyer record.
          Documents are confidential; download permission is set per document
          and can be withdrawn.
        </p>

        <VaultGate propertySlug={slug} variant="full" />

        <div className="border border-hairline bg-cream p-6 mt-12 text-[0.75rem] leading-[1.7] text-charcoal font-body">
          {AUCTION_DISCLOSURE}
        </div>
      </div>
    </Container>
  );
}
