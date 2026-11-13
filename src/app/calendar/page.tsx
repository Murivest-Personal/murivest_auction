import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { auctionEventJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { getProperties } from "@/lib/content";
import { formatDate, marketLabel } from "@/lib/format";
import type { PropertyCardData } from "@/lib/types";

export const revalidate = 300;

export const metadata = buildMetadata({
  title: "Commercial Property Auction Calendar — Kenya & UK | Murivest",
  description:
    "Upcoming commercial property auctions in Kenya and the UK. Auction dates, locations, auction houses and lot counts.",
  path: "/calendar",
});

interface AuctionGroup {
  key: string;
  date: string;
  market: string;
  auctionHouse: string;
  location: string;
  lots: PropertyCardData[];
}

const CATALOGUE_LINKS: Record<string, string> = {
  Allsop: "https://www.allsop.co.uk",
  Savills: "https://www.savills.co.uk",
  "Savills Auctions": "https://www.savills.co.uk",
  Acuitus: "https://www.acuitus.co.uk",
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const marketFilter =
    typeof sp.market === "string" && ["kenya", "uk"].includes(sp.market)
      ? sp.market
      : "all";

  const lots = (await getProperties({ market: "all" })).filter(
    (l) => l.auctionDate && (marketFilter === "all" || l.market === marketFilter)
  );

  const now = new Date();
  const groups = new Map<string, AuctionGroup>();
  for (const lot of lots) {
    const date = lot.auctionDate!;
    const key = `${date}|${lot.auctionHouse ?? ""}|${lot.market}`;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        date,
        market: lot.market,
        auctionHouse: lot.auctionHouse ?? "Auction house to be confirmed",
        location: lot.location,
        lots: [],
      });
    }
    groups.get(key)!.lots.push(lot);
  }

  const upcoming = Array.from(groups.values())
    .filter((g) => new Date(g.date).getTime() > now.getTime())
    .sort((a, b) => a.date.localeCompare(b.date));

  // Month buckets for the next six months, including empty months.
  const months: { label: string; year: number; month: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push({
      label: d.toLocaleDateString("en-GB", { month: "long" }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }

  return (
    <>
      <JsonLd
        data={[
          ...upcoming.map((g) => auctionEventJsonLd(g.lots[0])),
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Auction calendar", url: "/calendar" },
          ]),
        ]}
      />

      <section className="py-16 md:py-24 border-b border-hairline">
        <Container>
          <SectionHeader
            numeral="—"
            eyebrow="Kenya · United Kingdom"
            title="Auction calendar."
          />
          <p className="max-w-[42rem] text-[1.05rem] leading-[1.9] text-ink">
            A chronological calendar of upcoming commercial property auctions
            across both markets, grouped by auction date, market and auction
            house. Every lot links to its Murivest-verified listing.
          </p>
          <div className="mt-8 flex gap-6">
            {[
              { label: "All markets", href: "/calendar", active: marketFilter === "all" },
              { label: "Kenya", href: "/calendar?market=kenya", active: marketFilter === "kenya" },
              { label: "United Kingdom", href: "/calendar?market=uk", active: marketFilter === "uk" },
            ].map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={tab.active ? "page" : undefined}
                className={`font-display text-[0.6rem] tracking-[0.25em] uppercase transition-colors ${
                  tab.active
                    ? "text-green border-b border-gold pb-1"
                    : "text-charcoal hover:text-gold"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          {months.map((month) => {
            const monthAuctions = upcoming.filter((g) => {
              const d = new Date(g.date);
              return d.getMonth() === month.month && d.getFullYear() === month.year;
            });
            return (
              <div key={`${month.year}-${month.month}`} className="mb-16">
                <div className="flex items-baseline justify-between mb-6">
                  <h2 className="font-serif text-2xl md:text-3xl font-light text-green">
                    {month.label} {month.year}
                  </h2>
                  <span className="text-[0.55rem] tracking-[0.25em] uppercase text-charcoal">
                    {monthAuctions.length === 0
                      ? "No auctions scheduled"
                      : `${monthAuctions.length} ${
                          monthAuctions.length === 1 ? "auction" : "auctions"
                        }`}
                  </span>
                </div>

                {monthAuctions.length === 0 ? (
                  /* Empty months render as a hairline rule only — no filler */
                  <div className="border-t border-hairline" />
                ) : (
                  <div className="border-t border-hairline">
                    {monthAuctions.map((g) => (
                      <article
                        key={g.key}
                        className="grid gap-6 py-8 border-b border-hairline md:grid-cols-[10rem_1fr_2fr] items-start"
                      >
                        <div>
                          <p className="font-serif text-xl font-light text-green">
                            {formatDate(g.date)}
                          </p>
                          <p className="mt-1 inline-block px-3 py-1 text-[0.55rem] tracking-[0.2em] uppercase font-body bg-green text-cream">
                            {marketLabel(g.market)}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-serif text-lg font-light text-green mb-1">
                            {g.auctionHouse}
                          </h3>
                          <p className="text-[0.85rem] text-charcoal font-body">
                            {g.location}
                          </p>
                          {CATALOGUE_LINKS[g.auctionHouse] ? (
                            <a
                              href={CATALOGUE_LINKS[g.auctionHouse]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 inline-block text-[0.6rem] tracking-[0.25em] uppercase text-gold hover:text-green transition-colors"
                            >
                              Auction house catalogue ↗
                            </a>
                          ) : null}
                        </div>
                        <div>
                          <p className="text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-3">
                            Murivest-verified lots · {g.lots.length}
                          </p>
                          <ul className="space-y-2">
                            {g.lots.map((lot) => (
                              <li key={lot._id}>
                                <Link
                                  href={`/auctions/${lot.slug}`}
                                  className="text-[0.9rem] text-ink hover:text-gold transition-colors"
                                >
                                  {lot.title}
                                  {lot.referenceCode ? ` (${lot.referenceCode})` : ""}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {upcoming.length === 0 ? (
            <div className="border-t border-hairline pt-8">
              <p className="text-[0.95rem] text-charcoal">
                No upcoming auctions are currently scheduled in this view.
                Register interest with the deal team to be notified as lots are
                published.
              </p>
            </div>
          ) : null}

          <div className="mt-8">
            <ArrowLink href="/auctions">Browse all lots</ArrowLink>
          </div>
        </Container>
      </section>
    </>
  );
}
