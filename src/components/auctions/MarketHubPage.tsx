import Image from "next/image";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import {
  breadcrumbJsonLd,
  collectionPageJsonLd,
  faqPageJsonLd,
} from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { LotsFilterBar } from "@/components/auctions/LotsFilterBar";
import { Reveal } from "@/components/ui/Reveal";
import { getProperties, getMarketHub } from "@/lib/content";
import { formatDate } from "@/lib/format";
import type { Market } from "@/lib/types";

export const revalidate = 300;

export async function MarketHubPage({
  market,
  searchParams,
  heroImage,
  heroAlt,
}: {
  market: Market;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  heroImage: string;
  heroAlt: string;
}) {
  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp[k];
    return typeof v === "string" && v.length > 0 ? v : undefined;
  };

  const hub = getMarketHub(market);
  const lots = await getProperties({
    market,
    region: get("region"),
    assetType: get("assetType"),
    status: get("status"),
    price: get("price"),
    q: get("q"),
  });
  const allLots = await getProperties({ market });
  const regions = Array.from(
    new Set(allLots.map((l) => l.region).filter((r): r is string => Boolean(r)))
  );

  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd(
            hub.name,
            hub.positioning,
            market === "kenya" ? "/kenya" : "/uk"
          ),
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            {
              name: market === "kenya" ? "Kenya auctions" : "UK auctions",
              url: market === "kenya" ? "/kenya" : "/uk",
            },
          ]),
          faqPageJsonLd(hub.faqs),
        ]}
      />
      {/* Metadata is exported by the thin page files */}

      {/* Search filter bar — top of page, below the site header;
          scrolls away with the page (not fixed) */}
      <LotsFilterBar
        market={market}
        regions={regions}
        current={{
          region: get("region") ?? "",
          assetType: get("assetType") ?? "",
          status: get("status") ?? "",
          price: get("price") ?? "",
          q: get("q") ?? "",
        }}
        action={market === "kenya" ? "/kenya" : "/uk"}
      />

      {/* Hero — image, 60vh */}
      <section className="relative h-[46vh] md:h-[60vh] flex items-end">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt={heroAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-green/10 via-green/40 to-green/75" />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 pb-12 w-full">
          <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-[color:var(--mv-on-dark-faint)] mb-5">
            Market hub · market data updated {formatDate(hub.dataLastUpdated)}
          </span>
          <h1 className="font-serif font-light text-cream leading-[1.15] text-[clamp(2rem,3.5vw,3.2rem)] max-w-[44rem]">
            {market === "kenya"
              ? "Kenya commercial property auctions."
              : "United Kingdom commercial property auctions."}
          </h1>
          <p className="mt-4 max-w-[36rem] text-[1rem] leading-[1.8] text-[color:var(--mv-on-dark)]">
            {hub.positioning}
          </p>
        </div>
      </section>

      {/* Editorial intro */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="max-w-[42rem]">
            {hub.intro.map((paragraph, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "text-[1.1rem] leading-[1.9] text-ink mb-6"
                    : "text-[1.05rem] leading-[1.9] text-ink mb-6"
                }
              >
                {paragraph}
              </p>
            ))}
          </div>
        </Container>
      </section>

      {/* Lots grid */}
      <section className="pb-20 md:pb-28" id="lots">
        <Container>
          {lots.length === 0 ? (
              <div className="border-t border-sand pt-8">
                <p className="text-[0.95rem] text-charcoal">
                  {allLots.length === 0
                    ? "No lots are currently published in this market. Verified lots are published here as they clear the Murivest four-check standard — create your account for auction alerts."
                    : "No lots match the current filters in this market. Clear the filters or"}{" "}
                  {allLots.length > 0 ? (
                    <>
                      <a
                        href={`mailto:office@murivest.com?subject=${encodeURIComponent(
                          "Auction enquiry"
                        )}`}
                        className="text-gold hover:text-green transition-colors"
                      >
                        contact the deal team
                      </a>{" "}
                      to register a buying mandate.
                    </>
                  ) : null}
                </p>
              </div>
            ) : (
              <div className="grid gap-px bg-hairline border border-hairline md:grid-cols-2 lg:grid-cols-3">
                {lots.map((lot, i) => (
                  <Reveal key={lot._id} delay={i * 70} className="bg-white">
                    <PropertyCard property={lot} />
                  </Reveal>
                ))}
              </div>
            )}
        </Container>
      </section>

      {/* Market context — editorial sections */}
      <section className="border-t border-hairline py-20 md:py-28" id="market-context">
        <Container>
          <SectionHeader
            numeral="I"
            eyebrow={market === "kenya" ? "Kenya market" : "UK market"}
            title={
              market === "kenya"
                ? "Understanding the Kenyan auction market."
                : "Understanding the UK auction market."
            }
            className="mb-16"
          />
          <div className="grid gap-12 lg:grid-cols-2">
            {hub.sections.map((section, i) => (
              <Reveal key={section.heading} delay={i * 60}>
                <h2 className="font-serif text-2xl font-light text-green mb-5">
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph, j) => (
                  <p key={j} className="text-[0.95rem] leading-[1.8] text-ink mb-4">
                    {paragraph}
                  </p>
                ))}
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="border-t border-hairline py-20 md:py-28">
        <Container>
          <SectionHeader
            numeral="II"
            eyebrow="Frequently asked questions"
            title="Questions buyers ask about this market."
          />
          <div className="max-w-[42rem]">
            {hub.faqs.map((faq, i) => (
              <FaqItem key={i} question={faq.question} answer={faq.answer} />
            ))}
          </div>
          <div className="mt-12 flex flex-col sm:flex-row gap-6">
            <ArrowLink href="/how-auctions-work">How auctions work</ArrowLink>
            <ArrowLink href="/calendar">Auction calendar</ArrowLink>
          </div>
        </Container>
      </section>

      {/* CTA band */}
      <section className="bg-green py-16 md:py-20">
        <Container>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-[36rem]">
              <h2 className="font-serif text-2xl md:text-3xl font-light text-cream mb-3">
                Buying or selling in this market?
              </h2>
              <p className="text-[0.95rem] leading-[1.8] text-[color:var(--mv-on-dark)]">
                Murivest publishes verified auction intelligence and routes
                qualified buyers to the selling party. Engagements are by
                mandate only and subject to KYC/AML verification.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 text-[0.65rem] tracking-[0.22em] uppercase font-body bg-cream text-green hover:bg-gold hover:text-cream transition-colors"
              >
                Contact the deal team
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border-t border-hairline py-5 [&:last-of-type]:border-b">
      <summary className="flex items-center justify-between gap-6 cursor-pointer list-none">
        <span className="font-serif text-lg font-light text-green">
          {question}
        </span>
        <span
          aria-hidden="true"
          className="flex-shrink-0 w-7 h-7 border border-sand flex items-center justify-center text-xs text-green group-open:bg-green group-open:text-cream transition-colors"
        >
          +
        </span>
      </summary>
      <p className="mt-4 text-[0.95rem] leading-[1.8] text-ink max-w-[40rem]">
        {answer}
      </p>
    </details>
  );
}
