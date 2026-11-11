import type { Article } from "@/lib/types";

export const article: Article = {
  _id: "article-guide-1",
  title: "Auction glossary: Kenya and UK commercial property terms",
  slug: "auction-glossary-kenya-uk-commercial-property-terms",
  market: "both",
  category: "guide",
  excerpt:
    "A working glossary of the commercial property auction terms used in Kenya and the UK, from guide price and reserve to chargee sale and special conditions.",
  author: "Murivest Research",
  publishedAt: "2026-11-03T09:00:00Z",
  body: [
    {
      type: "p",
      text: "An auction glossary is the working vocabulary through which sellers, bidders and their advisers describe a commercial property sale before, during and after the fall of the hammer. The terminology used in Nairobi and London overlaps considerably, but the same expression can carry materially different legal consequences in each jurisdiction, and a bidder who assumes the two regimes are interchangeable takes on avoidable risk. This guide sets out the terms common to both markets first, then the vocabulary specific to Kenya and to the United Kingdom, and closes with the mechanics that diverge most sharply between them.",
    },
    { type: "h2", text: "The shared vocabulary of the auction room" },
    {
      type: "p",
      text: "The terms below appear in commercial auction catalogues in both markets and describe the same concepts: the price expectations of the selling party, the threshold below which a lot cannot be sold, and the documents a bidder is expected to have examined before the auction. In both jurisdictions the burden of enquiry rests with the buyer. A catalogue entry, however detailed, is no substitute for the legal pack or for the independent verification a purchaser is expected to undertake before committing a deposit.",
    },
    {
      type: "ul",
      items: [
        "Guide price — an indication of the selling party's expectations, published in the catalogue, not a valuation and not a term of the contract.",
        "Reserve price — the minimum figure below which the auctioneer will not sell the lot, confidential to the seller and the auctioneer until the auction has concluded.",
        "Hammer price — the highest bid accepted by the auctioneer on the fall of the hammer, before buyer's premium, stamp duty or other costs are added.",
        "Lot — a single property, or a group of properties offered together as one parcel, allocated a number in the auction catalogue.",
        "Legal pack — the bundle of title documents, searches, tenancy information and contract conditions that a bidder is expected to review before the auction.",
        "Buyer's premium — an additional charge payable by the buyer to the auctioneer on top of the hammer price, set out in the conditions of sale.",
        "Exchange of contracts — the point at which buyer and seller become contractually bound, which in an auction occurs on the fall of the hammer.",
        "Completion — the final step of the transaction, when the balance of the purchase price is paid and ownership is transferred to the buyer.",
      ],
    },
    { type: "h2", text: "Terms specific to the Kenyan market" },
    {
      type: "p",
      text: "Kenyan auctions are shaped by the Land Act 2012 and the Auctioneers Act Cap 526, particularly where the selling party is a chargee exercising its statutory power of sale. The vocabulary reflects that statutory spine: notices with prescribed periods, valuations prepared on forced-sale assumptions and instruments of payment dictated by practice rather than preference. The buyer in Kenya is also expected to verify title independently, by conducting an official search at the Lands Registry and confirming rates arrears and zoning at the relevant county offices, rather than relying on the selling party's disclosure alone.",
    },
    {
      type: "ul",
      items: [
        "Chargee sale — the exercise by a lender of its statutory power of sale over a charged property, conducted under the Land Act 2012 and the Auctioneers Act Cap 526.",
        "Statutory notice of sale — the three-month notice that must be served before a charged property may be sold at auction, distinct from the forty-day notice of default that precedes it.",
        "Forced-sale valuation — a valuation prepared on the assumption of a sale within a restricted marketing period, against which the reserve in a chargee sale is usually set.",
        "Official search — a search at the Lands Registry that reveals the registered owner of a property and the interests registered against its title.",
        "Encumbrance — any registered burden on title, such as a charge, lien or restriction, which the buyer takes subject to unless it is discharged before completion.",
        "Caveat — a formal caution lodged against a title to prevent the registration of further dealings until the caveator's claim has been determined.",
        "Easement — a registered right benefiting one parcel of land over another, such as a right of way or a right to pass services.",
        "Stamp duty — the tax charged on the transfer at four per cent of the property's value in urban areas, payable by the buyer before registration.",
        "Banker's cheque — the instrument through which the twenty-five per cent deposit is paid at the fall of the hammer; personal cheques are not accepted.",
      ],
    },
    { type: "h2", text: "Terms specific to the UK market" },
    {
      type: "p",
      text: "Commercial auctions in the United Kingdom run on standardised conditions of sale — the RICS Common Auction Conditions, currently in their fourth edition, or the Standard Commercial Property Conditions — which the seller's solicitors vary through special conditions. The buyer is deemed to purchase with full knowledge of title, the lot is sold subject to all faults, risk passes on exchange and there is no cooling-off period. Two items in UK packs — the rentcharge and the vendor's position on VAT — have no direct Kenyan equivalent and deserve particular attention before bidding.",
    },
    {
      type: "ul",
      items: [
        "Unconditional contract — a contract that binds the buyer on the fall of the hammer, with no cooling-off period and no ability to make completion conditional on financing.",
        "Conditional contract — a contract in which completion depends on a defined event, such as the grant of a planning permission, permitted only where the special conditions expressly allow it.",
        "Special conditions — the seller's modifications to the standard contract, which prevail over the general conditions wherever the two are inconsistent.",
        "General conditions — the standardised contractual base, typically the RICS Common Auction Conditions (4th edition) or the Standard Commercial Property Conditions, on which each lot is sold unless varied.",
        "Rentcharge — a legacy annual sum charged on freehold land for the benefit of another party, encountered in some titles and disclosed in the legal pack.",
        "Elected to tax — the vendor's VAT election, meaning that VAT is charged on the sale price where the election applies; a point a bidder must establish before the auction.",
      ],
    },
    { type: "h2", text: "Where the mechanics diverge" },
    {
      type: "p",
      text: "The clearest differences between the two markets lie not in vocabulary but in the mechanics the vocabulary describes. Deposits, completion timetables and the auctioneer's remuneration are fixed on different bases in Nairobi and London, and a bidder active in both markets should hold both sets of figures in mind when arranging funding.",
    },
    {
      type: "ul",
      items: [
        "Deposit in Kenya — twenty-five per cent of the hammer price, payable at the fall of the hammer in cash or by banker's cheque only.",
        "Deposit in the UK — ten per cent of the purchase price, payable on exchange of contracts, which in an auction occurs at the fall of the hammer.",
        "Balance in Kenya — the remaining seventy-five per cent, due within ninety days of the auction, failing which the deposit may be forfeited.",
        "Balance in the UK — typically due within twenty working days of exchange under the standard conditions, although the special conditions can vary this timetable.",
        "Auctioneer's commission in Kenya — commonly between 1.5 and 2.5 per cent of the hammer price plus VAT, set by regulation rather than by negotiation.",
      ],
    },
    {
      type: "p",
      text: "Risk allocation differs as well. In the United Kingdom the buyer is deemed to purchase with full knowledge of title, the lot is sold subject to all faults and risk passes on exchange, so the weeks between the fall of the hammer and completion are spent preparing to complete rather than re-examining the purchase. In Kenya the ninety-day completion window is longer by design: buyers use it to arrange registration, the discharge of any charge being sold under and the payment of stamp duty, while the forfeiture provisions concentrate the buyer's obligations at the outset.",
    },
    { type: "h2", text: "Using this glossary" },
    {
      type: "p",
      text: "Murivest Group Ltd publishes verified auction intelligence across both markets, including glossary-level detail on every commercial property it lists by mandate. Murivest is not the auctioneer, does not receive bids and does not hold deposits: a registration of interest submitted through the Murivest portal is routed to the selling party, and formal bidder registration takes place with the auctioneer. All engagements are by mandate only and subject to KYC and AML verification. Where a term in a specific catalogue is used differently from the usage described here, the definitions in the conditions of sale for that auction prevail.",
    },
  ],
  faqs: [
    {
      question: "Is a guide price the same as a valuation?",
      answer:
        "No. A guide price is an indication of the selling party's expectations, published in the auction catalogue to frame bidding. A valuation is a professional assessment of worth prepared on defined assumptions, and in a Kenyan chargee sale the reserve is usually set against a forced-sale valuation rather than a guide price.",
    },
    {
      question: "What is the difference between the reserve price and the guide price?",
      answer:
        "The reserve price is the confidential minimum below which the auctioneer will not sell the lot. The guide price is the published indication of the selling party's expectations. A lot may sell above the guide price, but it cannot sell below the reserve.",
    },
    {
      question: "Do Kenya and the UK use the same contract conditions?",
      answer:
        "No. UK commercial auctions typically run on the RICS Common Auction Conditions (4th edition) or the Standard Commercial Property Conditions, varied by special conditions that prevail over the general conditions. Kenyan auctions are governed by the Land Act 2012 and the Auctioneers Act Cap 526, with conditions of sale prepared for each auction.",
    },
    {
      question: "Why is the deposit higher in Kenya than in the UK?",
      answer:
        "In Kenya the buyer pays twenty-five per cent of the hammer price in cash or by banker's cheque at the fall of the hammer, with the balance due within ninety days. In the UK the deposit is ten per cent on exchange, with completion typically twenty working days later. Each timetable reflects the statutory and conveyancing framework of its own market.",
    },
    {
      question: "Does Murivest conduct the auctions described in its listings?",
      answer:
        "No. Murivest is not the auctioneer, does not receive bids and does not hold deposits. Murivest lists commercial properties for auction by mandate, routes registrations of intent to the selling party and publishes verified auction intelligence, with all engagements subject to KYC and AML verification.",
    },
  ],
  sources: [
    { label: "Kenya Law — Land Act 2012 and Auctioneers Act", url: "https://new.kenyalaw.org" },
    { label: "RICS — Common Auction Conditions", url: "https://www.rics.org" },
    { label: "Murivest Group Ltd", url: "https://murivest.com" },
  ],
};
