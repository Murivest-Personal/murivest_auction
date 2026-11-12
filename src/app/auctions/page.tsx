import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { LotsFilterBar } from "@/components/auctions/LotsFilterBar";
import { getProperties, isSampleData } from "@/lib/content";

export const revalidate = 300;

export const metadata = buildMetadata({
  title: "All Auction Lots — Kenya & UK | Murivest Group Ltd",
  description:
    "Browse every verified commercial property auction lot across Kenya and the UK. Filter by market, region, asset type, status and price. Guide prices, auction dates and legal pack status.",
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
            "All auction lots — Kenya and UK",
            "Every verified commercial property auction lot across Kenya and the UK, filterable by market, region, asset type, status and price.",
            "/auctions"
          ),
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "All lots", url: "/auctions" },
          ]),
        ]}
      />

      {/* Search filter bar — top of page, below the site header;
          scrolls away with the page (not fixed) */}
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
            eyebrow="Verified auction intelligence"
            title="All lots across both markets."
          />
          <p className="max-w-[42rem] text-[1.05rem] leading-[1.9] text-ink">
            Every listing names the selling party, the auction mechanism and
            the legal pack status. {lots.length}{" "}
            {lots.length === 1 ? "lot" : "lots"} currently listed.
          </p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          {isSampleData() ? (
            <p className="text-[0.55rem] tracking-[0.25em] uppercase text-charcoal mb-6">
              Sample listings for demonstration — live listings publish through
              Sanity
            </p>
          ) : null}

          {lots.length === 0 ? (
            <div className="border-t border-sand pt-8">
              <p className="text-[0.95rem] text-charcoal">
                No lots match the current filters. Clear the filters or browse
                the market hubs below.
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
