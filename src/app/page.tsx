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
import { getProperties, getFeaturedProperties, getLatestArticles } from "@/lib/content";
import { formatDateShort, marketLabel } from "@/lib/format";

export const revalidate = 300;

export const metadata = buildMetadata({
  title: "Commercial Property Auction Marketplace | Kenya & UK | Murivest",
  description:
    "Browse, watch and participate in verified commercial property auctions across Kenya and the UK. A curated marketplace for buyers and sellers operated by Murivest Group Ltd.",
  path: "/",
  ogImage: "/images/home.webp",
});

const MARKETPLACE_STEPS = [
  {
    number: "01",
    title: "Discover lots",
    body: "Browse verified commercial auction opportunities by market, asset type, status and price with clear guide information and lot details.",
  },
  {
    number: "02",
    title: "Register and participate",
    body: "Create an account to save lots, receive alerts, follow verification status and submit bids or expressions of interest on eligible lots.",
  },
  {
    number: "03",
    title: "Evaluate with confidence",
    body: "Review particulars, conditions of sale and documentation status. Independent due diligence is essential before taking part in any auction.",
  },
  {
    number: "04",
    title: "Sell through review",
    body: "Submit properties for marketplace review. Approved opportunities are prepared and published with transparent terms and timelines.",
  },
];

export default async function HomePage() {
  const [featured, allLots, articles] = await Promise.all([
    getFeaturedProperties(6),
    getProperties({ market: "all" }),
    getLatestArticles(3),
  ]);
  const showcase = featured.length > 0 ? featured : allLots.slice(0, 6);
  const liveCount = allLots.filter(
    (l) => l.status === "for-sale" || l.status === "for-sale-by-auction"
  ).length;

  return (
    <>
      <JsonLd data={websiteJsonLd()} />

      <section className="relative flex min-h-[48vh] flex-col justify-end overflow-hidden bg-[#081522]">
        <div className="absolute inset-0">
          <Image
            src="/images/home.webp"
            alt="Commercial property auction marketplace"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#081522]/70 via-[#081522]/35 to-[#081522]/75" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#081522]/85 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 pb-20 pt-36 md:px-12 md:pb-24 lg:px-16">
          <Reveal hero>
            <div className="max-w-[46rem]">
              <div className="mb-6 flex items-center gap-4">
                <span className="h-px w-9 bg-[#D6B77A]" />
                <span className="font-display text-[0.6rem] uppercase tracking-[0.3em] text-white/75">
                  Curated Auction Marketplace · Kenya &amp; United Kingdom
                </span>
              </div>
              <h1 className="mb-6 font-serif text-[clamp(2.8rem,5.5vw,5rem)] font-light leading-[1.03] tracking-tight text-[#FAF9F6]">
                Buy and sell commercial property
                <br />
                <em className="text-[#D6B77A]">through verified auctions.</em>
              </h1>
              <p className="mb-8 max-w-[38rem] text-[1rem] leading-[1.85] text-white/80">
                Browse active lots, create an account to participate and track
                activity, or submit a property for marketplace review. Clear
                terms, transparent lot information and qualified access across
                Kenya and the UK.
              </p>
              <div className="flex flex-wrap gap-4">
                <ButtonLink href="/auctions">Browse auctions</ButtonLink>
                <Link
                  href="/selling"
                  className="inline-flex items-center justify-center px-8 py-3.5 text-[0.65rem] tracking-[0.22em] uppercase font-display text-cream border border-cream/50 hover:bg-cream hover:text-green transition-colors"
                >
                  Sell a property
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-hairline bg-white">
        <Container className="py-8 md:py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-hairline border border-hairline">
            {[
              { label: "Published lots", value: String(allLots.length) },
              { label: "Open opportunities", value: String(liveCount) },
              { label: "Markets", value: "Kenya · UK" },
              { label: "Model", value: "Curated marketplace" },
            ].map((stat) => (
              <div key={stat.label} className="bg-cream p-5 md:p-6">
                <span className="block font-display text-[0.5rem] tracking-[0.28em] uppercase text-charcoal mb-2">
                  {stat.label}
                </span>
                <span className="block font-serif text-xl md:text-2xl font-light text-green">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-28">
        <Container>
          <SectionHeader
            numeral="I"
            eyebrow="Browse by market"
            title={<>Two markets. <em>One marketplace.</em></>}
          />
          <div className="grid md:grid-cols-2 gap-px bg-hairline border border-hairline">
            {[
              {
                name: "Kenya auctions",
                href: "/kenya",
                positioning: "Commercial, mixed-use, land and income-producing opportunities with market-specific guidance and calendar visibility.",
                meta: "Browse Kenya lots",
              },
              {
                name: "UK auctions",
                href: "/uk",
                positioning: "Investment and commercial lots with guide prices, status, conditions and documentation indicators.",
                meta: "Browse UK lots",
              },
            ].map((m) => (
              <Link key={m.href} href={m.href} className="group bg-cream p-8 md:p-12 hover:bg-white transition-colors">
                <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">Market</span>
                <h3 className="font-serif text-3xl font-light text-green mb-4">{m.name}</h3>
                <p className="text-[0.95rem] leading-[1.8] text-ink mb-6 max-w-[30rem]">{m.positioning}</p>
                <span className="link-rule">{m.meta}<span className="arrow-box" aria-hidden="true">↗</span></span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-28 border-t border-hairline">
        <Container>
          <SectionHeader numeral="II" eyebrow="Marketplace inventory" title={featured.length > 0 ? "Featured lots" : "Latest published lots"} />
          {showcase.length === 0 ? (
            <div className="border border-hairline bg-cream p-8 md:p-12 max-w-[42rem]">
              <p className="text-[1.05rem] leading-[1.9] text-ink mb-4">No lots are currently published.</p>
              <p className="text-[0.95rem] leading-[1.8] text-ink mb-6">Create an account for alerts or submit a property for marketplace review.</p>
              <div className="flex flex-wrap gap-4">
                <ArrowLink href="/register">Create account</ArrowLink>
                <ArrowLink href="/selling">Submit a property</ArrowLink>
              </div>
            </div>
          ) : (
            <div className="grid gap-px bg-hairline border border-hairline md:grid-cols-2 lg:grid-cols-3">
              {showcase.map((lot, i) => (
                <Reveal key={lot._id} delay={i * 90} className="bg-white">
                  <PropertyCard property={lot} />
                </Reveal>
              ))}
            </div>
          )}
          <div className="mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <ArrowLink href="/auctions">Browse all lots</ArrowLink>
            <ArrowLink href="/calendar">Auction calendar</ArrowLink>
          </div>
        </Container>
      </section>

      <Container><EditorialDivider /></Container>

      <section className="py-20 md:py-28 bg-white">
        <Container>
          <SectionHeader numeral="III" eyebrow="How it works" title={<>A clear process for <em>buyers and sellers.</em></>} />
          <ol className="grid md:grid-cols-2 gap-px bg-hairline border border-hairline">
            {MARKETPLACE_STEPS.map((step) => (
              <li key={step.number} className="bg-cream p-8 md:p-10">
                <span className="font-serif text-3xl font-light text-gold block mb-4">{step.number}</span>
                <h3 className="font-serif text-xl font-light text-green mb-3">{step.title}</h3>
                <p className="text-[0.95rem] leading-[1.8] text-ink">{step.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-[52rem] text-[0.85rem] leading-[1.8] text-charcoal">
            Murivest operates a curated marketplace. Participation, bids or expressions of interest are subject to lot terms, verification and the applicable sale channel. Deposits and completion are governed by the relevant auction conditions and documentation.
          </p>
        </Container>
      </section>

      <section className="py-20 md:py-28 border-t border-hairline">
        <Container>
          <SectionHeader numeral="IV" eyebrow="Buyers & sellers" title="Built for both sides of the marketplace." />
          <div className="grid gap-px bg-hairline border border-hairline md:grid-cols-2">
            <div className="bg-cream p-8 md:p-10">
              <span className="block font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-4">For buyers</span>
              <h3 className="font-serif text-2xl font-light text-green mb-4">Discover, watch and participate.</h3>
              <p className="text-[0.95rem] leading-[1.8] text-ink mb-6">Create an account to save lots, receive alerts, submit bids or expressions of interest on eligible opportunities and track activity in your dashboard.</p>
              <div className="flex flex-wrap gap-4">
                <ArrowLink href="/buyers">Buyer access</ArrowLink>
                <ArrowLink href="/register">Create account</ArrowLink>
              </div>
            </div>
            <div className="bg-white p-8 md:p-10">
              <span className="block font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-4">For sellers</span>
              <h3 className="font-serif text-2xl font-light text-green mb-4">Submit properties for review.</h3>
              <p className="text-[0.95rem] leading-[1.8] text-ink mb-6">Owners and advisers can present commercial assets for marketplace consideration. Approved listings are prepared with clear particulars and sale terms.</p>
              <div className="flex flex-wrap gap-4">
                <ArrowLink href="/selling">Sell a property</ArrowLink>
                <ArrowLink href="/how-auctions-work/selling">How selling works</ArrowLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-28 border-t border-hairline bg-white">
        <Container>
          <SectionHeader numeral="V" eyebrow="Research & guidance" title="Market intelligence for informed decisions" />
          <div className="grid gap-px bg-hairline border border-hairline md:grid-cols-3">
            {articles.map((a) => (
              <article key={a._id} className="bg-cream p-8 flex flex-col">
                <span className="text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-3">
                  {a.market === "both" ? "Kenya & UK" : marketLabel(a.market)} · {formatDateShort(a.publishedAt)}
                </span>
                <h3 className="font-serif text-xl font-light text-green leading-snug mb-3">{a.title}</h3>
                <p className="text-[0.9rem] leading-[1.7] text-ink mb-6">{a.excerpt}</p>
                <div className="mt-auto pt-4 border-t border-hairline">
                  <Link href={`/intelligence/${a.slug}`} className="text-[0.6rem] tracking-[0.3em] uppercase text-gold hover:text-green transition-colors">Read analysis →</Link>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-12"><ArrowLink href="/intelligence">View all research</ArrowLink></div>
        </Container>
      </section>

      <section className="bg-green py-20 md:py-28">
        <Container>
          <div className="max-w-[42rem]">
            <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-[color:var(--mv-on-dark-faint)] mb-6">Get started</span>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-cream leading-tight mb-6">Participate with clarity.</h2>
            <p className="text-[1rem] leading-[1.9] text-[color:var(--mv-on-dark)] mb-10">
              Browse current opportunities, create an account to watch lots and track activity, or submit a property for marketplace review.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/auctions" className="inline-flex items-center justify-center px-8 py-3 text-[0.65rem] tracking-[0.22em] uppercase font-display bg-cream text-green hover:bg-gold hover:text-cream transition-colors">Browse auctions</Link>
              <Link href="/register" className="inline-flex items-center gap-3 font-display text-[0.65rem] tracking-[0.22em] uppercase text-cream/75 hover:text-gold transition-colors group">Create account <span aria-hidden="true" className="w-7 h-7 border border-current flex items-center justify-center text-xs transition-colors group-hover:bg-gold group-hover:text-green">→</span></Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
