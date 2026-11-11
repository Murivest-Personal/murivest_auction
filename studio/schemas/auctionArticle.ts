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
    defineField({ name: "excerpt", type: "text", rows: 3, validation: (r) => r.max(240) }),
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
  ],
});
