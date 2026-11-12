import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { getArticles } from "@/lib/content";
import { formatDateShort, marketLabel } from "@/lib/format";
import { CLUSTER_LABELS } from "@/lib/types";
import type { Article, ArticleCluster } from "@/lib/types";
import { SITE } from "@/lib/brand";

export const revalidate = 300;

export const metadata = buildMetadata({
  title:
    "Auction Research & Property Market Intelligence — Kenya | Murivest",
  description:
    "Institutional research on Kenyan property auctions: avoiding auction as a borrower, trusts and asset structuring, auction machinery, due diligence, financing and buyer representation.",
  path: "/intelligence",
});

const CLUSTER_ORDER: ArticleCluster[] = [
  "auction-defence",
  "auction-machinery",
  "trusts-structuring",
  "buying-at-auction",
  "finance-diligence",
  "buyer-representation",
  "kenya-market",
  "uk-market",
  "fundamentals",
];

const CLUSTER_INTROS: Partial<Record<ArticleCluster, string>> = {
  "auction-defence":
    "The borrower's side of the auction cycle — statutory notices, restructuring, redemption and the defences that actually work.",
  "auction-machinery":
    "How the machinery works: the chain of authority from default to auctioneer, the power of sale, and the valuation logic behind reserve prices.",
  "trusts-structuring":
    "Trusts, companies and asset structuring — what legal separation achieves, what it costs, and where its limits sit.",
  "buying-at-auction":
    "The buyer's mechanics: how Kenyan auctions run, what bank-repossessed lots really carry, and what the hammer price never includes.",
  "finance-diligence":
    "Financing, due diligence and title verification — the file that must exist before anyone bids.",
  "buyer-representation":
    "Buyer-side brokerage, the 2% model, bank disposal logic and off-market intelligence.",
  "kenya-market": "Kenya auction market analysis from the research desk.",
  "uk-market": "UK commercial auction market analysis from the research desk.",
  fundamentals: "Evergreen references — glossaries, legal packs, registration.",
};

export default async function IntelligencePage() {
  const articles = await getArticles();
  const featured =
    articles.find((a) => a.featured) ?? articles[0];
  const clusters = CLUSTER_ORDER.map((cluster) => ({
    cluster,
    label: CLUSTER_LABELS[cluster],
    intro: CLUSTER_INTROS[cluster] ?? "",
    articles: articles.filter((a) => a.cluster === cluster),
  })).filter((g) => g.articles.length > 0);

  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd(
            "Auction research and market intelligence — Kenya and UK",
            "Institutional research on property auctions in Kenya and the UK from the Murivest research desk.",
            "/intelligence"
          ),
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Research", url: "/intelligence" },
          ]),
        ]}
      />

      {/* Gallery-style research room header */}
      <section className="py-16 md:py-24 border-b border-hairline">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="flex flex-wrap items-center gap-2 text-[0.6rem] tracking-[0.2em] uppercase text-charcoal font-display">
              <li>
                <Link href="/" className="hover:text-gold transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-green">
                Research
              </li>
            </ol>
          </nav>
          <div className="grid gap-10 lg:grid-cols-[2fr_1fr] lg:items-end">
            <div>
              <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-5">
                Murivest Research
              </span>
              <h1 className="font-serif font-light text-green leading-[1.15] text-[clamp(2.2rem,4vw,3.6rem)] mb-6">
                Auction intelligence,
                <br />
                written for decisions.
              </h1>
              <p className="max-w-[42rem] text-[1.05rem] leading-[1.9] text-ink">
                Analysis of how property auctions work in Kenya and the UK —
                from the borrower&apos;s statutory windows to the buyer&apos;s
                diligence file. Every article carries a named author, cited
                sources, and an FAQ block. Nothing on this page is investment
                advice.
              </p>
            </div>
            <div className="border border-hairline bg-white p-8">
              <p className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-4">
                The research library
              </p>
              <p className="font-serif text-5xl font-light text-green leading-none mb-3">
                {String(articles.length).padStart(2, "0")}
              </p>
              <p className="text-[0.85rem] leading-[1.7] text-ink mb-6">
                articles across {clusters.length} subject clusters, published
                by the Murivest research desk.
              </p>
              <a
                href={SITE.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 font-display text-[0.6rem] tracking-[0.24em] uppercase text-green hover:text-gold transition-colors"
              >
                Register for auction alerts
                <span
                  aria-hidden="true"
                  className="w-7 h-7 border border-current flex items-center justify-center text-xs"
                >
                  ↗
                </span>
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured analysis */}
      {featured ? (
        <section className="py-14 md:py-20">
          <Container>
            <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-6">
              Featured analysis
            </span>
            <FeaturedArticle article={featured} />
          </Container>
        </section>
      ) : null}

      {/* Cluster sections */}
      {clusters.map((group, gi) => (
        <section
          key={group.cluster}
          className={`py-14 md:py-20 ${gi === 0 ? "border-t border-hairline" : "border-t border-hairline"}`}
        >
          <Container>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
              <div className="max-w-[46rem]">
                <span className="block font-display text-[0.55rem] tracking-[0.3em] uppercase text-sand mb-3">
                  {String(gi + 1).padStart(2, "0")}
                </span>
                <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-3">
                  {group.label}
                </h2>
                {group.intro ? (
                  <p className="text-[0.95rem] leading-[1.8] text-ink">
                    {group.intro}
                  </p>
                ) : null}
              </div>
              <p className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-charcoal whitespace-nowrap pt-2">
                {String(group.articles.length).padStart(2, "0")} articles
              </p>
            </div>
            <div className="grid gap-px bg-hairline border border-hairline md:grid-cols-2 lg:grid-cols-3">
              {group.articles.map((a) => (
                <ArticleCard key={a._id} article={a} />
              ))}
            </div>
          </Container>
        </section>
      ))}

      {/* Portal CTA */}
      <section className="border-t border-hairline bg-green py-16 md:py-20">
        <Container>
          <div className="max-w-[46rem]">
            <span className="block font-display text-[0.55rem] tracking-[0.3em] uppercase text-[color:var(--mv-on-dark-faint)] mb-5">
              Auction alerts
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-light text-cream mb-5">
              Hear about verified lots before the public notice.
            </h2>
            <p className="text-[0.95rem] leading-[1.8] text-[color:var(--mv-on-dark)] mb-8">
              Registered buyers receive auction and off-market notifications
              through the Murivest client portal — including early sight of
              verified lots, auction dates and documentation as it becomes
              available.
            </p>
            <a
              href={SITE.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 text-[0.65rem] tracking-[0.25em] uppercase font-display border border-cream text-cream hover:bg-cream hover:text-green transition-colors"
            >
              Register at portal.murivest.com
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}

function FeaturedArticle({ article }: { article: Article }) {
  return (
    <article className="grid lg:grid-cols-2 gap-px bg-hairline border border-hairline">
      <div className="bg-green p-8 md:p-12 flex flex-col">
        <span className="block font-display text-[0.55rem] tracking-[0.3em] uppercase text-[color:var(--mv-on-dark-faint)] mb-5">
          {article.cluster ? CLUSTER_LABELS[article.cluster] : null} ·{" "}
          {article.market === "both"
            ? "Kenya & UK"
            : marketLabel(article.market)}{" "}
          · {formatDateShort(article.publishedAt)}
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-light text-cream leading-tight mb-6">
          {article.title}
        </h2>
        <p className="text-[0.95rem] leading-[1.8] text-[color:var(--mv-on-dark)] mb-8">
          {article.excerpt}
        </p>
        <div className="mt-auto">
          <Link
            href={`/intelligence/${article.slug}`}
            className="inline-flex items-center gap-3 font-display text-[0.65rem] tracking-[0.22em] uppercase text-cream/75 hover:text-gold transition-colors group"
          >
            Read the analysis
            <span
              aria-hidden="true"
              className="w-7 h-7 border border-current flex items-center justify-center text-xs transition-colors group-hover:bg-gold group-hover:text-green"
            >
              ↗
            </span>
          </Link>
        </div>
      </div>
      <div className="bg-cream p-8 md:p-12">
        <span className="block font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-5">
          In this piece
        </span>
        <ul className="space-y-4">
          {article.body
            .filter((b) => b.type === "h2")
            .slice(0, 6)
            .map((heading, i) => (
              <li
                key={i}
                className="flex gap-4 text-[0.9rem] leading-[1.7] text-ink"
              >
                <span className="text-gold font-serif">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{(heading as { text: string }).text}</span>
              </li>
            ))}
        </ul>
      </div>
    </article>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="bg-cream p-8 flex flex-col group">
      <span className="text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-3 font-display">
        {article.market === "both" ? "Kenya & UK" : marketLabel(article.market)}
        {" · "}
        {formatDateShort(article.publishedAt)}
      </span>
      <h3 className="font-serif text-xl font-light text-green leading-snug mb-3">
        {article.title}
      </h3>
      <p className="text-[0.9rem] leading-[1.7] text-ink mb-6">{article.excerpt}</p>
      <div className="mt-auto pt-4 border-t border-hairline">
        <Link
          href={`/intelligence/${article.slug}`}
          className="text-[0.6rem] tracking-[0.3em] uppercase text-gold hover:text-green transition-colors font-display"
        >
          Read analysis →
        </Link>
      </div>
    </article>
  );
}
