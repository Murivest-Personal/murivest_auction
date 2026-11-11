import { defineField, defineType } from "sanity";

export const auctionMarket = defineType({
  name: "auctionMarket",
  title: "Auction Market",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "name" } }),
    defineField({ name: "intro", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "dataLastUpdated", type: "date" }),
  ],
});
