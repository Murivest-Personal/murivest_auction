import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { articleJsonLd, breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";
import {
  getArticleBySlug,
  getArticles,
  getRelatedArticles,
} from "@/lib/content";
import { formatDate, marketLabel } from "@/lib/format";
import { SITE } from "@/lib/brand";
import { RESEARCH_DISCLAIMER } from "@/lib/legal";
import { CLUSTER_LABELS } from "@/lib/types";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(4, Math.round(words / 220));
}

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article)
    return buildMetadata({
      title: "Article not found | Murivest Group Ltd",
      description: "This article could not be found.",
      path: `/intelligence/${slug}`,
    });
  return buildMetadata({
    title: `${article.seoTitle ?? article.title} | Murivest`,
    description: article.metaDescription ?? article.excerpt,
    path: `/intelligence/${article.slug}`,
  });
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article, 2);
  const bodyWords = article.body
    .filter((b) => b.type === "p")
    .map((b) => (b as { text: string }).text)
    .join(" ");
  const minutes = readingMinutes(bodyWords);

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd(article),
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Research", url: "/intelligence" },
            ...(article.cluster
              ? [
                  {
                    name: CLUSTER_LABELS[article.cluster],
                    url: `/intelligence#${article.cluster}`,
                  },
                ]
              : []),
            { name: article.title, url: `/intelligence/${article.slug}` },
          ]),
          faqPageJsonLd(article.faqs),
        ]}
      />

      {/* Typographic article hero */}
      <section className="border-b border-hairline py-16 md:py-24">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="flex flex-wrap items-center gap-2 text-[0.6rem] tracking-[0.2em] uppercase text-charcoal font-display">
              <li>
                <Link href="/" className="hover:text-gold transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href="/intelligence"
                  className="hover:text-gold transition-colors"
                >
                  Research
                </Link>
              </li>
            </ol>
          </nav>
          <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-5">
            {article.cluster ? `${CLUSTER_LABELS[article.cluster]} · ` : ""}
            {article.market === "both"
              ? "Kenya & UK"
              : marketLabel(article.market)}{" "}
            · {article.category === "guide" ? "Guide" : "Analysis"}
            {article.intent ? ` · ${article.intent}` : ""}
          </span>
          <h1 className="font-serif font-light text-green leading-[1.2] text-[clamp(2rem,3.5vw,3.2rem)] max-w-[44rem] mb-6">
            {article.title}
          </h1>
          <p className="text-[1.05rem] leading-[1.9] text-ink max-w-[42rem] mb-8">
            {article.excerpt}
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[0.55rem] tracking-[0.25em] uppercase text-charcoal font-display">
            <span>
              By{" "}
              <a
                href={SITE.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green hover:text-gold transition-colors"
              >
                {article.author}
              </a>{" "}
              — the research desk of Murivest Group Ltd
            </span>
            <time dateTime={article.publishedAt}>
              {formatDate(article.publishedAt)}
            </time>
            <span>{minutes} min read</span>
            {article.updatedAt ? (
              <span>Updated {formatDate(article.updatedAt)}</span>
            ) : null}
          </div>
        </Container>
      </section>

      {/* Prose body */}
      <section className="py-14 md:py-20">
        <Container>
          <Prose blocks={article.body} />

          {/* Editorial related links (manual §8.4 — max 3) */}
          {article.related && article.related.length > 0 ? (
            <div className="max-w-[42rem] mt-14 pt-8 border-t border-hairline">
              <p className="font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-5">
                Related analysis
              </p>
              <ul className="space-y-3">
                {article.related.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-3 font-display text-[0.62rem] tracking-[0.2em] uppercase text-green hover:text-gold transition-colors"
                    >
                      <span
                        aria-hidden="true"
                        className="w-7 h-7 border border-current flex items-center justify-center text-[0.6rem] transition-colors group-hover:bg-green group-hover:text-cream"
                      >
                        ↗
                      </span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Author + disclosure */}
          <div className="max-w-[42rem] mt-12 border border-hairline bg-white p-8">
            <p className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-4">
              About the author
            </p>
            <p className="text-[0.95rem] leading-[1.8] text-ink mb-4">
              <span className="text-green">{article.author}</span> is the
              research desk of Murivest Group Ltd, publishing verified auction
              intelligence across East Africa, the United Kingdom and
              international markets. Murivest represents buyers under separate
              mandate and is not the auctioneer in any sale.
            </p>
            <p className="text-[0.8rem] leading-[1.7] text-charcoal">
              {RESEARCH_DISCLAIMER}
            </p>
          </div>
        </Container>
      </section>

      {/* Sources — co-citation readiness */}
      {article.sources.length > 0 ? (
        <section className="border-t border-hairline py-14 md:py-20">
          <Container>
            <h2 className="font-serif text-2xl font-light text-green mb-6">
              Sources and further reading
            </h2>
            <ul className="max-w-[42rem] border-t border-hairline">
              {article.sources.map((source) => (
                <li
                  key={source.url + source.label}
                  className="border-b border-hairline"
                >
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 py-4 text-[0.9rem] text-ink hover:text-gold transition-colors"
                  >
                    <span>{source.label}</span>
                    <span aria-hidden="true" className="text-gold">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {/* FAQ accordion */}
      <section className="border-t border-hairline py-14 md:py-20 bg-white">
        <Container>
          <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-8">
            Frequently asked questions
          </h2>
          <div className="max-w-[42rem]">
            {article.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group border-t border-hairline py-5 [&:last-of-type]:border-b"
              >
                <summary className="flex items-center justify-between gap-6 cursor-pointer list-none">
                  <span className="font-serif text-lg font-light text-green">
                    {faq.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex-shrink-0 w-7 h-7 border border-sand flex items-center justify-center text-xs text-green group-open:bg-green group-open:text-cream transition-colors"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 text-[0.95rem] leading-[1.8] text-ink max-w-[40rem]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* Related articles */}
      {related.length > 0 ? (
        <section className="border-t border-hairline py-14 md:py-20">
          <Container>
            <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-10">
              Related intelligence
            </h2>
            <div className="grid gap-px bg-hairline border border-hairline md:grid-cols-2">
              {related.map((a) => (
                <article key={a._id} className="bg-cream p-8">
                  <span className="text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-3 font-display">
                    {a.cluster ? `${CLUSTER_LABELS[a.cluster]} · ` : ""}
                    {formatDate(a.publishedAt)}
                  </span>
                  <h3 className="font-serif text-xl font-light text-green leading-snug mb-3">
                    {a.title}
                  </h3>
                  <Link
                    href={`/intelligence/${a.slug}`}
                    className="text-[0.6rem] tracking-[0.3em] uppercase text-gold hover:text-green transition-colors font-display"
                  >
                    Read analysis →
                  </Link>
                </article>
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
