import { defineField, defineType } from "sanity";

export const auctionProperty = defineType({
  name: "auctionProperty",
  title: "Auction Property",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required().max(160) }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "market",
      type: "string",
      options: {
        list: [
          { title: "Kenya", value: "kenya" },
          { title: "UK", value: "uk" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "region",
      type: "string",
      description: "County (Kenya) or region (UK).",
    }),
    defineField({ name: "location", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "assetType",
      type: "string",
      options: {
        list: ["Office", "Industrial", "Retail", "Hospitality", "Mixed-Use", "Land", "Alternative"],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "status",
      type: "string",
      options: {
        list: [
          { title: "For Sale", value: "for-sale" },
          { title: "For Sale by Auction", value: "for-sale-by-auction" },
          { title: "Under Offer", value: "under-offer" },
          { title: "Sold", value: "sold" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "isNewListing",
      title: "New listing",
      type: "boolean",
      description: "Shows the amber “New listing” badge. Amber is reserved for this badge only.",
      initialValue: false,
    }),
    defineField({
      name: "featured",
      title: "Featured lot",
      type: "boolean",
      description: "Show this lot in the “Featured lots” showcase on the homepage. If no lots are featured, the homepage falls back to the latest published lots.",
      initialValue: false,
    }),
    defineField({
      name: "tenure",
      type: "string",
      options: { list: ["Freehold", "Leasehold", "Unknown"] },
    }),
    defineField({ name: "size", type: "string" }),
    defineField({ name: "guidePrice", type: "string" }),
    defineField({ name: "reservePrice", type: "string" }),
    defineField({ name: "yield", type: "string" }),
    defineField({ name: "auctionDate", type: "datetime" }),
    defineField({ name: "auctionHouse", type: "string" }),
    defineField({
      name: "sellingParty",
      type: "string",
      description: "Mandatory — bank / receiver / auctioneer / vendor.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "legalPackAvailable",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "referenceCode", type: "string" }),
    defineField({
      name: "description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "keyHighlights",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.max(5),
    }),
    defineField({ name: "viewingDetails", type: "string" }),
    /* ---------- Property facts (addendum §1.1) ---------- */
    defineField({
      name: "facts",
      title: "Property Facts",
      type: "object",
      fields: [
        defineField({
          name: "saleType",
          type: "string",
          options: { list: ["Investment", "Owner-Occupier", "Development", "Mixed"] },
        }),
        defineField({
          name: "tenure",
          type: "string",
          options: { list: ["Freehold", "Leasehold", "Unknown"] },
        }),
        defineField({
          name: "subtype",
          type: "string",
          description: "e.g. Storefront Retail/Residential",
        }),
        defineField({
          name: "buildingClass",
          type: "string",
          options: { list: ["A", "B", "C", "Not applicable"] },
        }),
        defineField({ name: "yearBuilt", type: "number" }),
        defineField({
          name: "price",
          type: "number",
          validation: (r) => r.positive(),
        }),
        defineField({
          name: "currency",
          type: "string",
          options: { list: ["USD", "GBP", "KES"] },
          initialValue: "USD",
        }),
        defineField({ name: "pricePerSf", type: "number" }),
        defineField({
          name: "noi",
          title: "NOI",
          type: "number",
          description: "Annual net operating income.",
        }),
        defineField({
          name: "grossAnnualRent",
          type: "number",
          description: "Required for GRM. Leave blank if undisclosed.",
        }),
        defineField({
          name: "tenancy",
          type: "string",
          options: { list: ["Single", "Multi", "Vacant"] },
        }),
        defineField({
          name: "buildingHeight",
          type: "number",
          description: "Stories",
        }),
        defineField({
          name: "far",
          type: "number",
          description: "Floor area ratio",
        }),
        defineField({ name: "lotSizeAc", type: "number" }),
        defineField({
          name: "buildingSf",
          type: "number",
          description: "Net lettable / gross building area.",
        }),
        defineField({
          name: "occupancy",
          type: "number",
          description: "Percent occupied, 0–100.",
        }),
      ],
    }),
    /* ---------- Conditions of sale (addendum §3.1; issue #1 —
       deposit terms are per lot, never hardcoded by market) ---------- */
    defineField({
      name: "conditionsOfSale",
      title: "Conditions of Sale",
      type: "object",
      fields: [
        defineField({
          name: "jurisdiction",
          type: "string",
          options: { list: ["Kenya", "UK", "Other"] },
        }),
        defineField({
          name: "summaryPoints",
          title: "Summary (bullet points)",
          type: "array",
          of: [{ type: "string" }],
          validation: (r) => r.min(4).max(12),
        }),
        defineField({
          name: "depositPercent",
          title: "Deposit — percentage of purchase price",
          type: "number",
          description: "From this lot's actual conditions of sale. NEVER assume a market default.",
          validation: (r) => r.min(0).max(100),
        }),
        defineField({
          name: "depositDue",
          title: "Deposit — payment deadline",
          type: "string",
          description: "e.g. 'On the fall of the hammer' / 'On exchange of contracts'.",
        }),
        defineField({
          name: "depositPaymentMethod",
          title: "Deposit — payment method",
          type: "string",
          description: "e.g. 'Cash or banker's cheque only' / 'Electronic transfer to the selling party's solicitors'.",
        }),
        defineField({
          name: "depositPayee",
          title: "Deposit — recipient (payee)",
          type: "string",
          description: "Who receives the deposit, e.g. 'The auctioneer as agent for the selling party' or the advocates' client account.",
        }),
        defineField({
          name: "balanceDays",
          title: "Balance due within (days)",
          type: "number",
        }),
        defineField({ name: "buyersPremium", type: "string" }),
        defineField({
          name: "fullDocument",
          type: "file",
          options: { accept: ".pdf" },
        }),
        defineField({
          name: "documentLabel",
          type: "string",
          initialValue: "Full conditions of sale (PDF)",
        }),
      ],
    }),
    defineField({
      name: "coordinates",
      title: "Coordinates",
      type: "object",
      fields: [
        defineField({
          name: "lat",
          type: "number",
          validation: (r) => r.required().min(-90).max(90),
        }),
        defineField({
          name: "lng",
          type: "number",
          validation: (r) => r.required().min(-180).max(180),
        }),
        defineField({
          name: "zoom",
          type: "number",
          initialValue: 14,
          validation: (r) => r.min(3).max(20),
        }),
      ],
    }),
    defineField({
      name: "mainImage",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string" }],
    }),
    defineField({
      name: "gallery",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", type: "string" }],
        },
      ],
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "location", media: "mainImage", status: "status" },
    prepare: ({ title, subtitle, media, status }) => ({
      title,
      subtitle: `${status ?? ""} · ${subtitle ?? ""}`,
      media,
    }),
  },
});
