import Image from "next/image";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { websiteJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { ButtonLink } from "@/components/ui/Buttons";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { Reveal } from "@/components/ui/Reveal";
import { EditorialDivider } from "@/components/layout/EditorialDivider";
import { getProperties, getLatestArticles, isSampleData } from "@/lib/content";
import { formatDateShort, marketLabel } from "@/lib/format";

export const revalidate = 300;

export const metadata = buildMetadata({
  title: "Commercial Property Auctions — Kenya & UK | Murivest Group Ltd",
  description:
    "Verified commercial property auction listings across Kenya and the UK. Bank sales, receiver sales and investment lots, presented by Murivest Group Ltd. Mandate-only access.",
  path: "/",
  ogImage: "/images/hero-home.webp",
});

const VERIFICATION_STAGES = [
  {
    number: "01",
    title: "Title check",
    body: "The register is reviewed before a lot is listed: tenure, encumbrances, easements and caveats disclosed in the title are recorded and presented to buyers up front.",
  },
  {
    number: "02",
    title: "Occupancy and lease validation",
    body: "Tenancy schedules and lease documentation are examined so that the income position on which guide yields are based can be traced to the legal pack.",
  },
  {
    number: "03",
    title: "Pricing sanity check against reserve",
    body: "Guide prices are tested against the reserve and the income particulars. Guide prices are not valuations, and we say so on every listing.",
  },
  {
    number: "04",
    title: "Legal pack readiness",
    body: "The readiness of the legal pack — available, on request, or in preparation — is stated on the lot, so buyers can judge the diligence runway before bidding.",
  },
];

export default async function HomePage() {
  const [lots, articles] = await Promise.all([
    getProperties({ market: "all" }),
    getLatestArticles(3),
  ]);
  const latestLots = lots.slice(0, 6);
  const sample = isSampleData();

  return (
    <>
      <JsonLd data={websiteJsonLd()} />

      {/* Hero — full-bleed image, deep green overlay (§5.11) */}
      <section className="relative min-h-[80vh] flex items-end">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-home.webp"
            alt="Nairobi skyline at dusk, photographed from an elevated position"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-green/10 via-green/40 to-green/75" />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 pb-20 md:pb-24 w-full">
          <div className="max-w-[42rem]">
            <Reveal hero>
              <span className="block font-body text-[0.6rem] tracking-[0.3em] uppercase text-[color:var(--mv-on-dark-faint)] mb-6">
                Verified auction intelligence · Kenya &amp; United Kingdom
              </span>
              <h1 className="font-serif font-light text-cream leading-[1.1] text-[clamp(2.8rem,5vw,5rem)] mb-8">
                Commercial property auctions. Kenya. United Kingdom.
              </h1>
              <p className="text-[1.1rem] leading-[1.9] text-[color:var(--mv-on-dark)] mb-10 max-w-[36rem]">
                Murivest Group Ltd aggregates verified commercial auction
                opportunities across two markets and routes qualified buyers to
                the selling party. Every listing names the selling party, the
                auction mechanism and the legal pack status.
              </p>
              <div className="flex flex-wrap gap-4">
                <ButtonLink href="/auctions">Browse current lots</ButtonLink>
                <Link
                  href="/how-auctions-work"
                  className="inline-flex items-center justify-center px-8 py-3 text-[0.65rem] tracking-[0.22em] uppercase font-body text-cream border border-cream hover:bg-cream hover:text-green transition-colors"
                >
                  How auctions work
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Market selector — two panels */}
      <section className="py-20 md:py-28">
        <Container>
          <SectionHeader
            numeral="I"
            eyebrow="Two markets"
            title={
              <>
                Choose your market. <em>Read the lots.</em>
              </>
            }
          />
          <div className="grid md:grid-cols-2 gap-px bg-hairline border border-hairline">
            {[
              {
                name: "Kenya auctions",
                href: "/kenya",
                positioning:
                  "Bank sales, receiver sales and private treaty lots across Nairobi, Mombasa, Kisumu and Nakuru.",
                meta: "Land Act 2012 · Auctioneers Act · 25% deposit · 90-day completion",
              },
              {
                name: "UK auctions",
                href: "/uk",
                positioning:
                  "Commercial investment lots across London and regional UK — office, industrial, retail, mixed-use and alternatives.",
                meta: "Common Auction Conditions · 10% deposit · 20-working-day completion",
              },
            ].map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="group bg-cream p-8 md:p-12 hover:bg-white transition-colors"
              >
                <span className="block font-body text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
                  Market hub
                </span>
                <h3 className="font-serif text-3xl font-light text-green mb-4">
                  {m.name}
                </h3>
                <p className="text-[0.95rem] leading-[1.8] text-ink mb-6 max-w-[30rem]">
                  {m.positioning}
                </p>
                <p className="text-[0.55rem] tracking-[0.25em] uppercase text-charcoal mb-8">
                  {m.meta}
                </p>
                <span className="link-rule">
                  Enter the hub
                  <span className="arrow-box" aria-hidden="true">
                    ↗
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Latest lots */}
      <section className="py-20 md:py-28 border-t border-hairline">
        <Container>
          <SectionHeader
            numeral="II"
            eyebrow="Current opportunities"
            title="Latest lots across both markets"
          />
          {sample ? (
            <p className="text-[0.55rem] tracking-[0.25em] uppercase text-charcoal mb-6">
              Sample listings for demonstration — live listings publish through
              Sanity
            </p>
          ) : null}
          <div className="grid gap-px bg-hairline border border-hairline md:grid-cols-2 lg:grid-cols-3">
            {latestLots.map((lot, i) => (
              <Reveal key={lot._id} delay={i * 90} className="bg-white">
                <PropertyCard property={lot} />
              </Reveal>
            ))}
          </div>
          <div className="mt-12">
            <ArrowLink href="/auctions">View all lots</ArrowLink>
          </div>
        </Container>
      </section>

      <Container>
        <EditorialDivider />
      </Container>

      {/* Verification narrative — editorial split */}
      <section className="py-20 md:py-28 bg-white">
        <Container>
          <SectionHeader
            numeral="III"
            eyebrow="Governance & Transparency"
            title={
              <>
                How Murivest verifies <em>auction lots.</em>
              </>
            }
          />
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <div className="max-w-[42rem]">
              <p className="text-[1.05rem] leading-[1.9] text-ink mb-6">
                A commercial property auction moves quickly, and the buyer&rsquo;s
                protection is preparation. Before a lot is published on this
                portal, the Murivest deal team applies the same verification
                standard the firm applies to its brokerage mandates — adapted to
                the auction context.
              </p>
              <p className="text-[1.05rem] leading-[1.9] text-ink mb-6">
                Four checks stand behind every listing. They do not replace the
                buyer&rsquo;s own due diligence — the legal pack governs, and the
                selling party&rsquo;s terms prevail. What the checks do is
                establish that what is being offered is what it appears to be:
                the title exists, the income is documented, the pricing is
                coherent, and the legal process is ready to be completed.
              </p>
              <p className="text-[1.05rem] leading-[1.9] text-ink">
                Where a check cannot be completed, the lot says so. Verification
                is a discipline of disclosure, not a promise of outcome.
              </p>
            </div>
            <ol className="divide-y divide-hairline border-y border-hairline">
              {VERIFICATION_STAGES.map((stage) => (
                <li key={stage.number} className="py-8 grid grid-cols-[4rem_1fr] gap-6">
                  <span className="font-serif text-3xl font-light text-gold">
                    {stage.number}
                  </span>
                  <div>
                    <h3 className="font-serif text-xl font-light text-green mb-2">
                      {stage.title}
                    </h3>
                    <p className="text-[0.95rem] leading-[1.8] text-ink">
                      {stage.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* Market intelligence preview */}
      <section className="py-20 md:py-28 border-t border-hairline">
        <Container>
          <SectionHeader
            numeral="IV"
            eyebrow="Market intelligence"
            title="Analysis from the research desk"
          />
          <div className="grid gap-px bg-hairline border border-hairline md:grid-cols-3">
            {articles.map((a) => (
              <article key={a._id} className="bg-cream p-8 flex flex-col">
                <span className="text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-3">
                  {a.market === "both"
                    ? "Kenya & UK"
                    : marketLabel(a.market)}{" "}
                  · {formatDateShort(a.publishedAt)}
                </span>
                <h3 className="font-serif text-xl font-light text-green leading-snug mb-3">
                  {a.title}
                </h3>
                <p className="text-[0.9rem] leading-[1.7] text-ink mb-6">
                  {a.excerpt}
                </p>
                <div className="mt-auto pt-4 border-t border-hairline">
                  <Link
                    href={`/intelligence/${a.slug}`}
                    className="text-[0.6rem] tracking-[0.3em] uppercase text-gold hover:text-green transition-colors"
                  >
                    Read analysis →
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-12">
            <ArrowLink href="/intelligence">All market intelligence</ArrowLink>
          </div>
        </Container>
      </section>

      {/* CTA band — deep green, full-bleed */}
      <section className="bg-green py-20 md:py-28">
        <Container>
          <div className="max-w-[42rem]">
            <span className="block font-body text-[0.6rem] tracking-[0.3em] uppercase text-[color:var(--mv-on-dark-faint)] mb-6">
              Engage the deal team
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-cream leading-tight mb-6">
              Submit a buyer mandate or list a property for auction.
            </h2>
            <p className="text-[1rem] leading-[1.9] text-[color:var(--mv-on-dark)] mb-10">
              Murivest Group Ltd provides commercial real estate services —
              brokerage, property and asset management, and investment property
              services. All engagements are by mandate only, non-pooled, and
              subject to KYC/AML verification.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 text-[0.65rem] tracking-[0.22em] uppercase font-body bg-cream text-green hover:bg-gold hover:text-cream transition-colors"
              >
                Submit a buyer mandate
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 font-body text-[0.65rem] tracking-[0.22em] uppercase text-cream/75 hover:text-gold transition-colors group"
              >
                List a property for auction
                <span
                  aria-hidden="true"
                  className="w-7 h-7 border border-current flex items-center justify-center text-xs transition-colors group-hover:bg-gold group-hover:text-green"
                >
                  ↗
                </span>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
