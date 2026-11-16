import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { LotsFilterBar } from "@/components/auctions/LotsFilterBar";
import { getProperties } from "@/lib/content";

export const revalidate = 300;

export const metadata = buildMetadata({
  title: "Browse Auction Lots | Kenya & UK Commercial Property Marketplace | Murivest",
  description:
    "Browse verified commercial property auction lots across Kenya and the UK. Filter by market, region, asset type, status and price. View guide prices, auction dates, conditions and documentation status.",
  path: "/auctions",
});

export default async function AllLotsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp[k];
    return typeof v === "string" && v.length > 0 ? v : undefined;
  };

  const lots = await getProperties({
    market: "all",
    region: get("region"),
    assetType: get("assetType"),
    status: get("status"),
    price: get("price"),
    q: get("q"),
  });
  const allLots = await getProperties({ market: "all" });
  const regions = Array.from(
    new Set(allLots.map((l) => l.region).filter((r): r is string => Boolean(r)))
  );

  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd(
            "Browse auction lots — Kenya and UK",
            "Verified commercial property auction lots across Kenya and the UK, filterable by market, region, asset type, status and price.",
            "/auctions"
          ),
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Browse auctions", url: "/auctions" },
          ]),
        ]}
      />

      <LotsFilterBar
        market="all"
        regions={regions}
        current={{
          region: get("region") ?? "",
          assetType: get("assetType") ?? "",
          status: get("status") ?? "",
          price: get("price") ?? "",
          q: get("q") ?? "",
        }}
        action="/auctions"
      />

      <section className="py-16 md:py-24 border-b border-hairline">
        <Container>
          <SectionHeader
            numeral="—"
            eyebrow="Marketplace catalog"
            title="Browse auction lots."
          />
          <p className="max-w-[42rem] text-[1.05rem] leading-[1.9] text-ink">
            Explore verified commercial property auction opportunities across
            Kenya and the UK. Each lot includes guide information, status,
            conditions and available documentation details as provided for the
            sale. {lots.length} {lots.length === 1 ? "lot" : "lots"} currently
            shown.
          </p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          {lots.length === 0 ? (
            <div className="border border-hairline bg-cream p-8 md:p-10 max-w-[42rem]">
              <p className="text-[1rem] leading-[1.8] text-ink mb-3">
                {allLots.length === 0
                  ? "No lots are currently published."
                  : "No lots match the current filters."}
              </p>
              <p className="text-[0.95rem] leading-[1.8] text-charcoal">
                {allLots.length === 0
                  ? "Create an account to receive alerts when new lots are published, or submit a property for marketplace review."
                  : "Try clearing filters, searching by location, or browsing market pages for Kenya and the UK."}
              </p>
            </div>
          ) : (
            <div className="grid gap-px bg-hairline border border-hairline md:grid-cols-2 lg:grid-cols-3">
              {lots.map((lot) => (
                <PropertyCard key={lot._id} property={lot} className="bg-white" />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
