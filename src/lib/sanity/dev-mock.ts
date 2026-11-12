/* ============================================================
   DEV-ONLY MOCK LOTS — never active in production.

   Serves Sanity-shaped auctionProperty records when:
     1. Sanity is NOT configured (no NEXT_PUBLIC_SANITY_PROJECT_ID),
        and
     2. SANITY_DEV_MOCK=1 is set explicitly.

   Purpose: local development and end-to-end testing of the
   account flows (bid submission, save/like, profiles) without a
   live Sanity project. The production content path is untouched:
   with Sanity configured, or without SANITY_DEV_MOCK, this module
   is never read.
   ============================================================ */

interface MockDoc {
  _id: string;
  _type: string;
  title: string;
  slug: string;
  market: string;
  region: string;
  location: string;
  assetType: string;
  status: string;
  tenure: string;
  size: string;
  guidePrice: string;
  auctionDate: string;
  auctionHouse: string;
  sellingParty: string;
  legalPackAvailable: boolean;
  referenceCode: string;
  isNewListing: boolean;
  description: { children: { text: string }[] }[];
  keyHighlights: string[];
  facts: Record<string, unknown>;
  conditionsOfSale: Record<string, unknown>;
  publishedAt: string;
  featured: boolean;
}

const p = (text: string) => [{ children: [{ text }] }];

export const DEV_MOCK_LOTS: MockDoc[] = [
  {
    _id: "dev-mock-001",
    _type: "auctionProperty",
    title: "Riverside Drive Commercial Block, Westlands",
    slug: "riverside-drive-commercial-block-westlands",
    market: "kenya",
    region: "Nairobi",
    location: "Riverside Drive, Westlands, Nairobi",
    assetType: "Office",
    status: "for-sale-by-auction",
    tenure: "Leasehold — 99 years from 2010",
    size: "48,500 sq ft",
    guidePrice: "KES 720,000,000",
    auctionDate: "2026-12-04",
    auctionHouse: "To be confirmed in the auction notice",
    sellingParty: "Chargee (financial institution) — named in the auction notice",
    legalPackAvailable: true,
    referenceCode: "MVR-NRB-0142",
    isNewListing: true,
    description: p(
      "A five-storey commercial block on Riverside Drive, let to a mix of corporate and diplomatic tenants, offered by public auction under a statutory power of sale. The building carries a verified tenancy schedule and a documented service charge history; the four-check verification file is published with the listing."
    ),
    keyHighlights: [
      "Five storeys, 48,500 sq ft, two basement levels of parking",
      "Multi-tenanted — corporate and diplomatic covenants",
      "Verified tenancy schedule and service charge history",
      "Guide price KES 720m (approx. KES 14,845 per sq ft)",
    ],
    facts: {
      price: 720_000_000,
      currency: "KES",
      noi: 58_900_000,
      occupancy: 92,
      tenancy: "Multi-tenanted, rolling leases",
      yearBuilt: 2012,
      buildingClass: "A",
    },
    conditionsOfSale: {
      jurisdiction: "Kenya",
      summaryPoints: [
        "Deposit payable to the auctioneer's identified account on the fall of the hammer",
        "Balance of the purchase price within the period stated in the conditions of sale",
        "Sale subject to the auctioneer's conditions of sale as published in the auction notice",
      ],
      depositPercent: 25,
      depositDue: "On the fall of the hammer",
      depositPaymentMethod: "Bankers cheque or RTGS to the auctioneer's account",
      depositPayee: "The auctioneer, as instructed in the auction notice",
      balanceDays: 90,
    },
    publishedAt: "2026-11-01",
    featured: true,
  },
  {
    _id: "dev-mock-002",
    _type: "auctionProperty",
    title: "Bermondsey Trade Park, Unit 4, London SE16",
    slug: "bermondsey-trade-park-unit-4-london-se16",
    market: "uk",
    region: "London",
    location: "Bermondsey, London SE16",
    assetType: "Industrial",
    status: "for-sale-by-auction",
    tenure: "Freehold",
    size: "12,300 sq ft",
    guidePrice: "£2,150,000",
    auctionDate: "2026-11-27",
    auctionHouse: "To be confirmed in the auction notice",
    sellingParty: "Receivers — named in the auction notice",
    legalPackAvailable: true,
    referenceCode: "MVR-LDN-0087",
    isNewListing: false,
    description: p(
      "A terraced industrial unit of approximately 12,300 sq ft within a secured trade park, offered with vacant possession on completion. The unit benefits from a clear eaves height of 6.1m, three-phase power and a secure yard; the legal pack includes the title, searches and the receivers' conditions of sale."
    ),
    keyHighlights: [
      "Terraced industrial unit, 12,300 sq ft NIA",
      "Vacant possession on completion",
      "6.1m clear eaves, three-phase power, secure yard",
      "Guide price £2.15m (approx. £175 per sq ft)",
    ],
    facts: {
      price: 2_150_000,
      pricePerSf: 175,
      currency: "GBP",
      noi: 129_000,
      occupancy: 0,
      tenancy: "Vacant possession",
      yearBuilt: 1988,
      subtype: "Terraced trade unit",
    },
    conditionsOfSale: {
      jurisdiction: "UK",
      summaryPoints: [
        "Deposit payable to the auctioneers' client account on the fall of the hammer",
        "Completion within the period stated in the conditions of sale",
        "Sale subject to the special conditions and the receivers' conditions of sale",
      ],
      depositPercent: 10,
      depositDue: "On the fall of the hammer",
      depositPaymentMethod: "Bank transfer to the auctioneers' client account",
      depositPayee: "The auctioneers, as stated in the catalogue",
      balanceDays: 20,
    },
    publishedAt: "2026-10-20",
    featured: true,
  },
  {
    _id: "dev-mock-003",
    _type: "auctionProperty",
    title: "Kisumu Lakeview Retail Arcade",
    slug: "kisumu-lakeview-retail-arcade",
    market: "kenya",
    region: "Kisumu",
    location: "Oginga Odinga Street, Kisumu",
    assetType: "Retail",
    status: "sold",
    tenure: "Leasehold — 45 years from 2005",
    size: "21,000 sq ft",
    guidePrice: "KES 185,000,000",
    auctionDate: "2026-09-18",
    auctionHouse: "Named in the auction notice",
    sellingParty: "Chargee (financial institution) — named in the auction notice",
    legalPackAvailable: false,
    referenceCode: "MVR-KSM-0119",
    isNewListing: false,
    description: p(
      "A three-storey retail arcade on Oginga Odinga Street, sold at auction in September 2026. The transaction has completed; the listing is retained for market intelligence."
    ),
    keyHighlights: [
      "Three storeys, 21,000 sq ft retail arcade",
      "Sold at auction — September 2026",
    ],
    facts: {
      price: 185_000_000,
      currency: "KES",
      occupancy: 84,
      tenancy: "Multi-tenanted retail",
    },
    conditionsOfSale: {
      jurisdiction: "Kenya",
      summaryPoints: [
        "Sale completed — deposit and balance paid under the conditions of sale",
      ],
      depositPercent: 25,
      balanceDays: 90,
    },
    publishedAt: "2026-08-02",
    featured: false,
  },
];
