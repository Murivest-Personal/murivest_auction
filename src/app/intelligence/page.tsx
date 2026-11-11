import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatDateShort, marketLabel } from "@/lib/format";
import { getArticles } from "@/lib/content";
import type { Article, ArticleMarket } from "@/lib/types";

export const revalidate = 300;

export const metadata = buildMetadata({
  title: "Commercial Property Auction Market Intelligence — Kenya & UK | Murivest",
  description:
    "Analysis of commercial property auction markets in Kenya and the UK — sale rates, pricing trends, sector performance and buyer behaviour.",
  path: "/intelligence",
});

export default async function IntelligencePage() {
  const articles = await getArticles();
  const [featured, ...rest] = articles;
  const groups: { market: ArticleMarket | "guide"; label: string }[] = [
    { market: "kenya", label: "Kenya auction market" },
    { market: "uk", label: "UK auction market" },
    { market: "guide", label: "Evergreen guides" },
  ];

  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd(
            "Auction market intelligence — Kenya and UK",
            "Analysis of commercial property auction markets in Kenya and the UK from the Murivest research desk.",
            "/intelligence"
          ),
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Market intelligence", url: "/intelligence" },
          ]),
        ]}
      />

      <section className="py-16 md:py-24 border-b border-hairline">
        <Container>
          <SectionHeader
            numeral="—"
            eyebrow="Murivest Research"
            title="Auction market intelligence."
          />
          <p className="max-w-[42rem] text-[1.05rem] leading-[1.9] text-ink">
            Murivest publishes market intelligence under its fiduciary
            standards: analysis is editorial, sources are cited, and live deal
            terms are never published. Every article carries a named author
            and an FAQ block, and links to the lots and hubs it discusses.
          </p>
        </Container>
      </section>

      {/* Featured analysis */}
      {featured ? (
        <section className="py-14 md:py-20">
          <Container>
            <span className="block font-body text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-6">
              Featured analysis
            </span>
            <FeaturedArticle article={featured} />
          </Container>
        </section>
      ) : null}

      {/* Archive grouped by market */}
      {groups.map((group) => {
        const list = rest.filter((a) =>
          group.market === "guide"
            ? a.category === "guide"
            : a.market === group.market
        );
        if (list.length === 0) return null;
        return (
          <section
            key={group.label}
            className="border-t border-hairline py-14 md:py-20"
          >
            <Container>
              <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-10">
                {group.label}
              </h2>
              <div className="grid gap-px bg-hairline border border-hairline md:grid-cols-2 lg:grid-cols-3">
                {list.map((a) => (
                  <ArticleCard key={a._id} article={a} />
                ))}
              </div>
            </Container>
          </section>
        );
      })}
    </>
  );
}

function FeaturedArticle({ article }: { article: Article }) {
  return (
    <article className="grid lg:grid-cols-2 gap-px bg-hairline border border-hairline">
      <div className="bg-green p-8 md:p-12 flex flex-col">
        <span className="block font-body text-[0.55rem] tracking-[0.3em] uppercase text-[color:var(--mv-on-dark-faint)] mb-5">
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
            className="inline-flex items-center gap-3 font-body text-[0.65rem] tracking-[0.22em] uppercase text-cream/75 hover:text-gold transition-colors group"
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
        <span className="block font-body text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-5">
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
                <span className="text-gold font-serif">{String(i + 1).padStart(2, "0")}</span>
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
    <article className="bg-cream p-8 flex flex-col">
      <span className="text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-3">
        {article.market === "both" ? "Kenya & UK" : marketLabel(article.market)}{" "}
        · {formatDateShort(article.publishedAt)}
      </span>
      <h3 className="font-serif text-xl font-light text-green leading-snug mb-3">
        {article.title}
      </h3>
      <p className="text-[0.9rem] leading-[1.7] text-ink mb-6">{article.excerpt}</p>
      <div className="mt-auto pt-4 border-t border-hairline">
        <Link
          href={`/intelligence/${article.slug}`}
          className="text-[0.6rem] tracking-[0.3em] uppercase text-gold hover:text-green transition-colors"
        >
          Read analysis →
        </Link>
      </div>
    </article>
  );
}
