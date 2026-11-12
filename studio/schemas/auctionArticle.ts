import { defineField, defineType } from "sanity";

export const auctionArticle = defineType({
  name: "auctionArticle",
  title: "Auction Article",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "market",
      type: "string",
      options: { list: ["kenya", "uk", "both"] },
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: { list: ["analysis", "guide"], layout: "radio" },
      initialValue: "analysis",
    }),
    defineField({
      name: "cluster",
      title: "Topic cluster",
      description: "Blog cluster taxonomy (blog manual §13).",
      type: "string",
      options: {
        list: [
          { title: "Auction defence & borrowers", value: "auction-defence" },
          { title: "How auctions actually work", value: "auction-machinery" },
          { title: "Trusts & asset structuring", value: "trusts-structuring" },
          { title: "Buying at auction", value: "buying-at-auction" },
          { title: "Finance & due diligence", value: "finance-diligence" },
          { title: "Buyer representation & fees", value: "buyer-representation" },
          { title: "Kenya auction market", value: "kenya-market" },
          { title: "UK auction market", value: "uk-market" },
          { title: "Auction fundamentals", value: "fundamentals" },
        ],
      },
    }),
    defineField({
      name: "intent",
      title: "Search intent",
      description: "Search-intent classification (blog manual §3.2).",
      type: "string",
      options: {
        list: [
          "Informational-Investigative",
          "Commercial Investigation",
          "Transactional",
          "Investment Research",
        ],
      },
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "excerpt", type: "text", rows: 3, validation: (r) => r.max(240) }),
    defineField({
      name: "seoTitle",
      title: "SEO title",
      description: "Meta title, max 60 characters.",
      type: "string",
      validation: (r) => r.max(60),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      description: "150–160 characters.",
      type: "text",
      rows: 2,
      validation: (r) => r.max(170),
    }),
    defineField({ name: "updatedAt", title: "Last substantive revision", type: "datetime" }),
    defineField({
      name: "author",
      type: "string",
      initialValue: "Murivest Research",
    }),
    defineField({
      name: "body",
      type: "array",
      of: [
        { type: "block" },
        { type: "image", fields: [{ name: "alt", type: "string" }] },
      ],
    }),
    defineField({ name: "coverImage", type: "image", options: { hotspot: true } }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "faqs",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "question", type: "string" },
            { name: "answer", type: "text", rows: 3 },
          ],
        },
      ],
    }),
    defineField({
      name: "sources",
      title: "Sources (co-citation)",
      description:
        "At least two external authoritative sources per article (features spec §7.3).",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string" },
            { name: "url", type: "url" },
          ],
        },
      ],
    }),
    defineField({
      name: "related",
      title: "Related analysis links",
      description: "Max 3 contextual internal links (blog manual §8.4).",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string" },
            { name: "href", type: "string" },
          ],
        },
      ],
      validation: (r) => r.max(3),
    }),
  ],
});
