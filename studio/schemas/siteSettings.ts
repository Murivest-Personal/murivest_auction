import { defineField, defineType } from "sanity";
import { AUCTION_DISCLOSURE } from "../../src/lib/legal";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "officeEmail",
      type: "string",
      initialValue: "office@murivest.com",
    }),
    defineField({
      name: "officePhone",
      type: "string",
      initialValue: "+254 115 277 610",
    }),
    defineField({
      name: "auctionDisclosure",
      title: "Auction disclosure (locked copy)",
      type: "text",
      rows: 5,
      initialValue: AUCTION_DISCLOSURE,
    }),
  ],
});
