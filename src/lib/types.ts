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

/** Conditions of sale (addendum §3.1) */
export interface ConditionsOfSale {
  jurisdiction: "Kenya" | "UK" | "Other";
  summaryPoints: string[];
  depositPercent?: number;
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
