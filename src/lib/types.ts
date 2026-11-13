/* ============================================================
   Shared types for auctions.murivest.com
   Mirrors the Sanity schemas (auctionProperty, auctionArticle,
   auctionMarket, siteSettings) and the Supabase tables
   (auction_bids, property_comments).
   ============================================================ */

export type Market = "kenya" | "uk";

export type PropertyStatus =
  | "for-sale"
  | "for-sale-by-auction"
  | "under-offer"
  | "sold";

export interface PropertyImage {
  url: string;
  alt: string;
}

/** Property facts — expanded field set (addendum §1.1) */
export interface PropertyFacts {
  saleType?: "Investment" | "Owner-Occupier" | "Development" | "Mixed";
  tenure?: "Freehold" | "Leasehold" | "Unknown";
  subtype?: string;
  buildingClass?: "A" | "B" | "C" | "Not applicable";
  yearBuilt?: number;
  price?: number;
  currency?: "USD" | "GBP" | "KES";
  pricePerSf?: number;
  noi?: number;
  /** Annual gross rent. Required for GRM — leave blank if undisclosed. */
  grossAnnualRent?: number;
  tenancy?: "Single" | "Multi" | "Vacant";
  buildingHeight?: number;
  far?: number;
  lotSizeAc?: number;
  buildingSf?: number;
  occupancy?: number;
}

/** Conditions of sale (addendum §3.1; issue #1 — every deposit
    term is per lot, never hardcoded by market) */
export interface ConditionsOfSale {
  jurisdiction: "Kenya" | "UK" | "Other";
  summaryPoints: string[];
  depositPercent?: number;
  /** When the deposit falls due, e.g. "on the fall of the hammer". */
  depositDue?: string;
  /** Accepted instrument(s), e.g. "cash or banker's cheque". */
  depositPaymentMethod?: string;
  /** Who receives the deposit, e.g. "the selling party's advocates' client account". */
  depositPayee?: string;
  balanceDays?: number;
  buyersPremium?: string;
  fullDocumentUrl?: string;
  documentLabel: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
  zoom: number;
}

export type VerificationState = "verified" | "not-disclosed" | "failed";

export interface VerificationSummary {
  titleCheck: VerificationState;
  occupancyCheck: VerificationState;
  reserveSanityCheck: VerificationState;
  legalPackReadiness: VerificationState;
}

/** Full auctionProperty document (normalised for rendering) */
export interface Property {
  _id: string;
  title: string;
  slug: string;
  market: Market;
  region?: string;
  location: string;
  assetType: string;
  status: PropertyStatus;
  tenure?: string;
  size?: string;
  guidePrice?: string;
  reservePrice?: string;
  yield?: string;
  auctionDate?: string;
  auctionHouse?: string;
  sellingParty: string;
  legalPackAvailable: boolean;
  referenceCode?: string;
  isNewListing?: boolean;
  /** Normalised paragraphs from the portable-text description. */
  description: string[];
  keyHighlights: string[];
  coordinates?: Coordinates;
  mainImage: PropertyImage | null;
  gallery: PropertyImage[];
  publishedAt: string;
  facts: PropertyFacts;
  conditionsOfSale?: ConditionsOfSale;
  viewingDetails?: string;
}

/** Card projection used across grids (homepage, hubs, related lots) */
export interface PropertyCardData {
  _id: string;
  title: string;
  slug: string;
  market: Market;
  region?: string;
  location: string;
  assetType: string;
  status: PropertyStatus;
  guidePrice?: string;
  yield?: string;
  auctionDate?: string;
  auctionHouse?: string;
  sellingParty: string;
  referenceCode?: string;
  isNewListing?: boolean;
  size?: string;
  mainImage: PropertyImage | null;
  /** Numeric price from facts, for price-band filtering. */
  factsPrice?: number;
  factsCurrency?: string;
}

/* ---------------- Articles ---------------- */

export type ArticleMarket = "kenya" | "uk" | "both";
export type ArticleCategory = "analysis" | "guide";

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string };

export interface ArticleSource {
  label: string;
  url: string;
}

export interface Faq {
  question: string;
  answer: string;
}

/** Search-intent classification (blog manual §3.2). */
export type ArticleIntent =
  | "Informational-Investigative"
  | "Commercial Investigation"
  | "Transactional"
  | "Investment Research";

/** Topic clusters — the Murivest taxonomy (blog manual §13). */
export type ArticleCluster =
  | "auction-defence"
  | "auction-machinery"
  | "trusts-structuring"
  | "buying-at-auction"
  | "finance-diligence"
  | "buyer-representation"
  | "kenya-market"
  | "uk-market"
  | "fundamentals";

export const CLUSTER_LABELS: Record<ArticleCluster, string> = {
  "auction-defence": "Auction defence & borrowers",
  "auction-machinery": "How auctions actually work",
  "trusts-structuring": "Trusts & asset structuring",
  "buying-at-auction": "Buying at auction",
  "finance-diligence": "Finance & due diligence",
  "buyer-representation": "Buyer representation & fees",
  "kenya-market": "Kenya auction market",
  "uk-market": "UK auction market",
  fundamentals: "Auction fundamentals",
};

export interface ArticleRelatedLink {
  label: string;
  href: string;
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  market: ArticleMarket;
  category: ArticleCategory;
  excerpt: string;
  author: string;
  publishedAt: string;
  body: ArticleBlock[];
  faqs: Faq[];
  sources: ArticleSource[];
  /* --- Blog manual extensions (SEO output requirements §5.1) --- */
  /** Meta title, ≤60 characters. Falls back to title. */
  seoTitle?: string;
  /** Meta description, 150–160 characters. Falls back to excerpt. */
  metaDescription?: string;
  /** Search-intent classification. */
  intent?: ArticleIntent;
  /** Topic cluster. */
  cluster?: ArticleCluster;
  /** Last substantive revision. */
  updatedAt?: string;
  /** Editorial “related analysis” links, max 3 (manual §8.4). */
  related?: ArticleRelatedLink[];
  /** Featured placement on the blog index. */
  featured?: boolean;
}

/* ---------------- Markets ---------------- */

export interface MarketHub {
  market: Market;
  name: string;
  shortName: string;
  positioning: string;
  intro: string[];
  sections: { heading: string; paragraphs: string[] }[];
  faqs: Faq[];
  dataLastUpdated: string;
}

/* ---------------- Site settings ---------------- */

export interface SiteSettings {
  officeEmail: string;
  officePhone: string;
  auctionDisclosure: string;
}

/* ---------------- Comments (Supabase) ---------------- */

export interface PublicComment {
  author_name: string;
  body: string;
  created_at: string;
}
