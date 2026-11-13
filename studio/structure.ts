import type { StructureResolver } from "sanity/structure";

/** Desk structure — listings first, then intelligence, then settings. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Murivest Auctions")
    .items([
      S.documentTypeListItem("auctionProperty").title("Auction properties"),
      S.documentTypeListItem("auctionArticle").title("Articles"),
      S.documentTypeListItem("auctionMarket").title("Markets"),
      S.divider(),
      S.singleton()
        .documentTypeListItem("siteSettings")
        .title("Site settings")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings")
        ),
    ]);
