/* ============================================================
   Content layer. Auction lots (listings, featured auctions,
   related lots) are fetched EXCLUSIVELY from the Sanity project
   (auctionProperty documents) — there is no bundled sample
   dataset. If Sanity is not configured, or a fetch fails, the
   listing surfaces render their empty states.

   Articles try Sanity first (auctionArticle) and fall back to
   the bundled research collection; market hub editorial copy is
   static site content.
   ============================================================ */

import {
  ALL_ARTICLES,
  ALL_PROPERTIES,
  ARTICLE_BY_SLUG,
  FEATURED_PROPERTIES,
  PROPERTY_BY_SLUG,
  RELATED_PROPERTIES,
} from "@/lib/sanity/queries";
import { sanityConfigured, getSanity } from "@/lib/sanity/client";
import { toPropertyImage } from "@/lib/sanity/image";
import { MARKET_HUBS } from "@/data/markets";
import { ARTICLES } from "@/content/articles";
import type {
  Article,
  Faq,
  Market,
  Property,
  PropertyCardData,
} from "@/lib/types";

let warnedUnconfigured = false;
function warnUnconfiguredOnce() {
  if (!warnedUnconfigured) {
    warnedUnconfigured = true;
    console.warn(
      "[content] NEXT_PUBLIC_SANITY_PROJECT_ID is not set — no auction lots can be loaded. " +
        "Set the Sanity environment variables to publish listings."
    );
  }
}

/* ---------- Sanity → normalised Property ---------- */

function blocksToParagraphs(description: unknown): string[] {
  if (!Array.isArray(description)) return [];
  const paragraphs: string[] = [];
  for (const block of description) {
    if (
      block &&
      typeof block === "object" &&
      Array.isArray((block as { children?: unknown }).children)
    ) {
      const text = (block as { children: { text?: string }[] })
        .children.map((c) => c.text ?? "")
        .join("")
        .trim();
      if (text) paragraphs.push(text);
    }
  }
  return paragraphs;
}

function normaliseProperty(raw: Record<string, unknown>): Property | null {
  if (!raw || typeof raw !== "object") return null;
  const get = (k: string) => raw[k];
  const facts = (get("facts") ?? {}) as Record<string, unknown>;
  const cos = get("conditionsOfSale") as Record<string, unknown> | undefined;

  const galleryRaw = Array.isArray(get("gallery")) ? (get("gallery") as unknown[]) : [];
  const gallery = galleryRaw
    .map((g) => toPropertyImage(g, String(get("title") ?? "")))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  return {
    _id: String(get("_id") ?? ""),
    title: String(get("title") ?? ""),
    slug: String(get("slug") ?? ""),
    market: (get("market") === "uk" ? "uk" : "kenya") as Market,
    region: get("region") ? String(get("region")) : undefined,
    location: String(get("location") ?? ""),
    assetType: String(get("assetType") ?? ""),
    status: String(get("status") ?? "for-sale-by-auction") as Property["status"],
    tenure: get("tenure") ? String(get("tenure")) : undefined,
    size: get("size") ? String(get("size")) : undefined,
    guidePrice: get("guidePrice") ? String(get("guidePrice")) : undefined,
    reservePrice: get("reservePrice") ? String(get("reservePrice")) : undefined,
    yield: get("yield") ? String(get("yield")) : undefined,
    auctionDate: get("auctionDate") ? String(get("auctionDate")) : undefined,
    auctionHouse: get("auctionHouse") ? String(get("auctionHouse")) : undefined,
    sellingParty: String(get("sellingParty") ?? ""),
    legalPackAvailable: Boolean(get("legalPackAvailable")),
    referenceCode: get("referenceCode") ? String(get("referenceCode")) : undefined,
    isNewListing: Boolean(get("isNewListing")),
    description: blocksToParagraphs(get("description")),
    keyHighlights: Array.isArray(get("keyHighlights"))
      ? (get("keyHighlights") as string[])
      : [],
    coordinates: get("coordinates") as Property["coordinates"],
    mainImage: toPropertyImage(get("mainImage"), String(get("title") ?? "")),
    gallery,
    publishedAt: String(get("publishedAt") ?? ""),
    facts: facts as Property["facts"],
    conditionsOfSale: cos
      ? {
          jurisdiction: (cos.jurisdiction ?? "Other") as "Kenya" | "UK" | "Other",
          summaryPoints: Array.isArray(cos.summaryPoints)
            ? (cos.summaryPoints as string[])
            : [],
          depositPercent: cos.depositPercent as number | undefined,
          balanceDays: cos.balanceDays as number | undefined,
          buyersPremium: cos.buyersPremium as string | undefined,
          fullDocumentUrl: cos.fullDocumentUrl
            ? String(cos.fullDocumentUrl)
            : undefined,
          documentLabel: String(
            cos.documentLabel ?? "Full conditions of sale (PDF)"
          ),
        }
      : undefined,
    viewingDetails: get("viewingDetails")
      ? String(get("viewingDetails"))
      : undefined,
  };
}

function toCard(p: Property): PropertyCardData {
  return {
    _id: p._id,
    title: p.title,
    slug: p.slug,
    market: p.market,
    region: p.region,
    location: p.location,
    assetType: p.assetType,
    status: p.status,
    guidePrice: p.guidePrice,
    yield: p.yield,
    auctionDate: p.auctionDate,
    auctionHouse: p.auctionHouse,
    sellingParty: p.sellingParty,
    referenceCode: p.referenceCode,
    isNewListing: p.isNewListing,
    size: p.size,
    mainImage: p.mainImage,
    factsPrice: p.facts.price,
    factsCurrency: p.facts.currency,
  };
}

function sortProperties(list: Property[]): Property[] {
  return [...list].sort((a, b) => {
    const da = a.auctionDate ?? a.publishedAt;
    const db = b.auctionDate ?? b.publishedAt;
    return da.localeCompare(db);
  });
}

export interface PropertyFilters {
  market?: Market | "all";
  region?: string;
  assetType?: string;
  status?: string;
  q?: string;
  /** Price band "min-max"; 0 on either side means open. */
  price?: string;
}

export function matchPriceBand(
  factsPrice: number | undefined,
  band: string | undefined
): boolean {
  if (!band) return true;
  const [minRaw, maxRaw] = band.split("-");
  const min = Number(minRaw) || 0;
  const max = Number(maxRaw) || 0;
  if (factsPrice == null) return false;
  if (min > 0 && factsPrice < min) return false;
  if (max > 0 && factsPrice > max) return false;
  return true;
}

export async function getProperties(
  filters: PropertyFilters = {}
): Promise<PropertyCardData[]> {
  const all = await getAllProperties();
  let list = all;
  if (filters.market && filters.market !== "all") {
    list = list.filter((p) => p.market === filters.market);
  }
  if (filters.region) list = list.filter((p) => p.region === filters.region);
  if (filters.assetType) {
    list = list.filter((p) => p.assetType === filters.assetType);
  }
  if (filters.status) list = list.filter((p) => p.status === filters.status);
  if (filters.price) {
    list = list.filter((p) => matchPriceBand(p.facts.price, filters.price));
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    list = list.filter((p) =>
      [p.title, p.location, p.assetType, p.sellingParty, p.referenceCode ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }
  return list.map(toCard);
}

async function getAllProperties(): Promise<Property[]> {
  if (!sanityConfigured()) {
    warnUnconfiguredOnce();
    return [];
  }
  try {
    const raw = await getSanity().fetch(ALL_PROPERTIES, { market: "all" });
    const normalised = (raw as Record<string, unknown>[])
      .map(normaliseProperty)
      .filter((p): p is Property => Boolean(p));
    return sortProperties(normalised);
  } catch (err) {
    console.error("[content] Sanity fetch failed (ALL_PROPERTIES):", err);
    return [];
  }
}

export async function getPropertyBySlug(
  slug: string
): Promise<Property | null> {
  if (!sanityConfigured()) {
    warnUnconfiguredOnce();
    return null;
  }
  try {
    const raw = await getSanity().fetch(PROPERTY_BY_SLUG, { slug });
    const property = normaliseProperty(raw as Record<string, unknown>);
    return property && property.slug ? property : null;
  } catch (err) {
    console.error("[content] Sanity fetch failed (PROPERTY_BY_SLUG):", err);
    return null;
  }
}

export async function getRelatedProperties(property: Property): Promise<PropertyCardData[]> {
  if (!sanityConfigured()) {
    warnUnconfiguredOnce();
    return [];
  }
  try {
    const raw = await getSanity().fetch(RELATED_PROPERTIES, {
      market: property.market,
      assetType: property.assetType,
      slug: property.slug,
    });
    const normalised = (raw as Record<string, unknown>[])
      .map(normaliseProperty)
      .filter((p): p is Property => Boolean(p));
    return normalised.map(toCard);
  } catch (err) {
    console.error("[content] Sanity fetch failed (RELATED_PROPERTIES):", err);
    return [];
  }
}

export async function getAllSlugs(): Promise<string[]> {
  const all = await getAllProperties();
  return all.map((p) => p.slug);
}

/** Featured auctions for the homepage showcase — Sanity documents
    with featured == true, ordered by auction/publish date. Returns
    an empty list when none are flagged or Sanity is unavailable. */
export async function getFeaturedProperties(
  count = 6
): Promise<PropertyCardData[]> {
  if (!sanityConfigured()) {
    warnUnconfiguredOnce();
    return [];
  }
  try {
    const raw = await getSanity().fetch(FEATURED_PROPERTIES, { count });
    const normalised = (raw as Record<string, unknown>[])
      .map(normaliseProperty)
      .filter((p): p is Property => Boolean(p));
    return normalised.map(toCard);
  } catch (err) {
    console.error("[content] Sanity fetch failed (FEATURED_PROPERTIES):", err);
    return [];
  }
}

/** The lot used in the calculator worked examples. Pin a specific
    lot with the WORKED_EXAMPLE_SLUG environment variable;
    otherwise the first published lot with a price is used.
    Returns null when no lots are published — the worked example
    section is omitted. */
export async function getWorkedExampleProperty(): Promise<Property | null> {
  const pinned = process.env.WORKED_EXAMPLE_SLUG;
  if (pinned) return getPropertyBySlug(pinned);
  const lots = await getProperties({ market: "all" });
  const withPrice = lots.find((l) => l.factsPrice != null);
  return withPrice ? getPropertyBySlug(withPrice.slug) : null;
}

/* ---------- Articles ---------- */

export async function getArticles(market?: Market): Promise<Article[]> {
  let list: Article[];
  if (sanityConfigured()) {
    try {
      const raw = await getSanity().fetch(ALL_ARTICLES);
      const normalised = (raw as Record<string, unknown>[]).map(
        normaliseArticle
      );
      if (normalised.length > 0) {
        list = normalised.filter((a): a is Article => Boolean(a));
        return market ? list.filter((a) => a.market === market || a.market === "both") : list;
      }
    } catch {
      /* fall through */
    }
  }
  list = ARTICLES;
  const sorted = [...list].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );
  return market
    ? sorted.filter((a) => a.market === market || a.market === "both")
    : sorted;
}

export async function getLatestArticles(count = 3): Promise<Article[]> {
  const all = await getArticles();
  return [...all]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, count);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (sanityConfigured()) {
    try {
      const raw = await getSanity().fetch(ARTICLE_BY_SLUG, { slug });
      const article = normaliseArticle(raw as Record<string, unknown>);
      if (article && article.slug) return article;
    } catch {
      /* fall through */
    }
  }
  return ARTICLES.find((a) => a.slug === slug) ?? null;
}

export async function getRelatedArticles(current: Article, count = 2): Promise<Article[]> {
  const all = await getArticles();
  return all
    .filter((a) => a.slug !== current.slug)
    .sort((a, b) => {
      const score = (x: Article) =>
        (x.cluster && x.cluster === current.cluster ? 3 : 0) +
        (x.market === current.market ? 2 : 0) +
        (x.category === current.category ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, count);
}

function normaliseArticle(raw: Record<string, unknown>): Article | null {
  if (!raw || !raw.slug) return null;
  return {
    _id: String(raw._id ?? ""),
    title: String(raw.title ?? ""),
    slug: String(raw.slug),
    market: (raw.market ?? "both") as Article["market"],
    category: (raw.category ?? "analysis") as Article["category"],
    excerpt: String(raw.excerpt ?? ""),
    author: String(raw.author ?? "Murivest Research"),
    publishedAt: String(raw.publishedAt ?? ""),
    body: (raw.body as Article["body"]) ?? [],
    faqs: (raw.faqs as Faq[]) ?? [],
    sources: (raw.sources as Article["sources"]) ?? [],
    seoTitle: raw.seoTitle ? String(raw.seoTitle) : undefined,
    metaDescription: raw.metaDescription ? String(raw.metaDescription) : undefined,
    intent: (raw.intent as Article["intent"]) ?? undefined,
    cluster: (raw.cluster as Article["cluster"]) ?? undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
    related: (raw.related as Article["related"]) ?? undefined,
    featured: Boolean(raw.featured),
  };
}

/* ---------- Markets ---------- */

export function getMarketHub(market: Market) {
  return MARKET_HUBS[market];
}
