/* Market hub editorial content — Kenya and UK. The “market data
   last updated” stamp must be refreshed at least every 14 days
   (features spec §7.3). */

import type { MarketHub, SiteSettings } from "@/lib/types";
import { AUCTION_DISCLOSURE } from "@/lib/legal";

export const MARKET_HUBS: Record<"kenya" | "uk", MarketHub> = {
  kenya: {
    market: "kenya",
    name: "Kenya commercial property auctions",
    shortName: "Kenya",
    positioning:
      "Bank sales, receiver sales and private treaty lots across Nairobi, Mombasa, Kisumu and Nakuru.",
    intro: [
      "A commercial property auction in Kenya is a public sale conducted under the Land Act 2012 and the Auctioneers Act (Cap 526), in which a chargee — typically a bank — or a receiver offers land and buildings to the highest bidder above a reserve price. The auction is the final stage of a statutory enforcement process that begins with default and ends with transfer, and it is the principal route through which commercial property changes hands at forced-sale values.",
      "This hub aggregates verified commercial auction listings across Kenya: bank sales, receiver sales, court-ordered sales and private treaty listings. Each lot is presented with its guide price, auction date, selling party and legal pack status, so that buyers can assess the opportunity and the process before committing to bid.",
    ],
    sections: [
      {
        heading: "How commercial property auctions work in Kenya",
        paragraphs: [
          "Kenyan commercial property auctions follow a statutory sequence. When a borrower defaults on a charge, the chargee must serve a 40-day notice of default, followed by a three-month statutory notice of sale, before the property can be offered at auction. The auctioneer then publishes the sale in the Kenya Gazette and newspapers, conducts a public auction, and declares the highest bidder above the reserve price the purchaser.",
          "Under the standard Kenyan conditions the successful bidder pays a deposit — commonly 25% of the purchase price — immediately on the fall of the hammer, in cash or by banker's cheque only, with the balance within 90 days. The deposit amount, payment deadline, payment method and recipient for each lot are set by that lot's conditions of sale, not by Murivest. Completion is not conditional on financing, and failure to complete within the period can result in forfeiture of the deposit and resale of the property. Buyers should treat the settlement period as strict and arrange funding before bidding.",
        ],
      },
      {
        heading: "Bank sales, receiver sales and private treaty — what the difference means for buyers",
        paragraphs: [
          "A bank sale is conducted by the chargee under its statutory power of sale: the bank has appointed an auctioneer and offers the property directly. A receiver sale occurs where the chargee has appointed a receiver over the borrower's undertaking — typically under a debenture — and the receiver sells the property as part of managing the charged business. A court-ordered sale follows judgment in civil proceedings and is conducted under the direction of the court.",
          "The practical differences for buyers are matters of process and risk. Bank and receiver sales move on statutory timetables, and the documentation trail — the notices, the valuation and the auctioneer's licence — is what a diligent buyer verifies first. Private treaty listings, by contrast, are negotiated sales of distressed or motivated assets outside the auction room, with ordinary contract timelines.",
        ],
      },
      {
        heading: "Title, encumbrances and the legal pack",
        paragraphs: [
          "Every Kenyan auction lot is sold subject to the title as it stands: existing encumbrances, easements and caveats disclosed in the register pass to the buyer. The buyer is responsible for verifying title, rates arrears and zoning compliance at the Lands Registry and the relevant county offices. The legal pack — where available — should contain the official search, the encumbrances section, the statutory notices and the conditions of sale.",
          "Buyers should commission an independent official search close to the auction date, because the register can change between publication and the fall of the hammer. Where the legal pack is incomplete, the price should reflect the residual risk, and the buyer's advocate should raise requisitions before bidding rather than after.",
        ],
      },
      {
        heading: "Upcoming auctions by county",
        paragraphs: [
          "Auction activity in Kenya concentrates in Nairobi County, with Mombasa, Kisumu and Nakuru forming the secondary markets. Lots range from CBD office buildings and storefront retail to industrial units along the Mombasa Road corridor. The calendar below groups verified Murivest lots by auction date and county; the selling party and sale authority for each lot are disclosed as the auction notice and conditions of sale require, with full documentation released to qualified buyers through confidential data rooms.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is a commercial property auction in Kenya?",
        answer:
          "A public sale of land or buildings conducted under the Land Act 2012 and the Auctioneers Act (Cap 526), in which a chargee or receiver offers the property to the highest bidder above a reserve price. The successful bidder pays the deposit set by the conditions of sale — commonly 25% on the fall of the hammer — and the balance within the period the conditions state.",
      },
      {
        question: "Can foreigners bid at Kenya property auctions?",
        answer:
          "Yes. Non-Kenyan bidders may purchase and hold commercial property in Kenya, subject to the constitutional and statutory limitations on agricultural land, which is generally restricted to Kenyan citizens. Foreign buyers should confirm the land's designation and any consent requirements with their advocate before bidding.",
      },
      {
        question: "What deposit is payable at a Kenyan commercial property auction?",
        answer:
          "The deposit is set by the conditions of sale for each lot. Under the standard Kenyan conditions it is 25% of the purchase price, payable immediately on the fall of the hammer directly to the auctioneer, with only cash or a banker's cheque accepted at the auction itself and the balance due within 90 days. Always confirm the deposit amount, payment deadline, method and recipient in the conditions of sale for the specific lot before bidding.",
      },
      {
        question: "Is Murivest the auctioneer on these listings?",
        answer:
          "No. Murivest Group Ltd provides commercial real estate services and publishes auction intelligence. Murivest is not the auctioneer, does not receive bids, does not hold deposits, and does not act as principal in any auction transaction. The selling party named on each listing is responsible for the auction process.",
      },
      {
        question: "What taxes and fees does a buyer pay at a Kenyan auction?",
        answer:
          "Stamp duty of 4% of value on urban properties is payable to the Kenya Revenue Authority, plus conveyancing fees under the Advocates Remuneration Order. The buyer also bears the cost of consents, survey fees and any outstanding land rates not cleared by the seller, and auctioneer's commission is payable in addition to the hammer price.",
      },
    ],
    dataLastUpdated: "2026-11-10",
  },
  uk: {
    market: "uk",
    name: "United Kingdom commercial property auctions",
    shortName: "United Kingdom",
    positioning:
      "Commercial investment lots across London and regional UK — office, industrial, retail, mixed-use and alternative assets.",
    intro: [
      "A UK commercial property auction is a public sale in which lots are offered under the auction house's conditions — commonly the RICS Common Auction Conditions or the Standard Commercial Property Conditions — and the contract binds buyer and seller on the fall of the hammer. The commercial auction market has matured into a standing channel for investment lot sales, with the national houses publishing catalogues and results on fixed cycles.",
      "This hub aggregates verified commercial auction listings across London and regional UK, from single-let offices and industrial units to mixed-use buildings, retail investments and alternative assets. Each lot is presented with its guide price, auction date, auction house, selling party and legal pack status.",
    ],
    sections: [
      {
        heading: "Unconditional versus conditional auction contracts",
        paragraphs: [
          "The UK commercial auction room trades almost exclusively on unconditional contracts: when the auctioneer knocks down the lot, buyer and seller are bound, the deposit set by the conditions — commonly 10% — is paid, and completion follows on the date in the special conditions — typically 20 working days. There is no cooling-off period, and completion is not conditional on financing.",
          "Conditional contracts, offered by some regional houses and the modern method of auction for residential stock, allow a window after the auction for the buyer to exchange and complete. Commercial buyers should establish which regime applies to a lot before bidding, because the deposit at risk and the funding timetable differ materially between the two.",
        ],
      },
      {
        heading: "The legal pack: what UK buyers must review",
        paragraphs: [
          "The legal pack is the bundle of title documents, searches, leases and special conditions on which the sale will complete. Under the standard conditions the buyer is deemed to purchase with full knowledge of title and raises no objection on matters disclosed in the pack, whether or not they inspected it. Review before bidding is therefore not optional diligence — it is the allocation of risk.",
          "A commercial buyer's solicitor will focus on the register and title plan, the tenure and any rentcharges, the tenancy schedule and lease liabilities, VAT elections, and the special conditions that vary deposit, completion and costs. Where the pack is incomplete at catalogue publication, bidders should track addenda up to the fall of the hammer, because addenda form part of the contract.",
        ],
      },
      {
        heading: "Guide price, reserve price and buyer's premium",
        paragraphs: [
          "The guide price is an indication of the selling party's expectations, not a valuation and not the price at which the lot will necessarily sell. The reserve is the confidential minimum price at or above which the lot will be sold; the auctioneer may regulate bidding and refuse any bid at their discretion. Competitive lots routinely exceed guide, and bidders should set their own limit before the auction.",
          "The buyer's premium is a fee payable by the buyer in addition to the hammer price, stated in the catalogue or special conditions. VAT may also apply where the seller has elected to tax the property. Buyers should total the hammer price, premium and VAT exposure when calculating their maximum bid.",
        ],
      },
      {
        heading: "Upcoming auctions by region",
        paragraphs: [
          "The UK auction calendar is anchored by the national houses — Allsop, Savills and Acuitus among them — supplemented by regional specialists. London lots dominate the investment end of the market, while the regional rooms offer industrial, retail and mixed-use stock at higher yields. The calendar below groups verified Murivest lots by auction date and region.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is a commercial property auction in the UK?",
        answer:
          "A public sale in which commercial lots are offered under the auction house's conditions — commonly the RICS Common Auction Conditions or the Standard Commercial Property Conditions. The contract binds buyer and seller on the fall of the hammer, with the deposit set by the conditions (commonly 10%) paid on exchange and completion typically 20 working days later. The deposit and timetable for any specific lot are set by that lot's conditions.",
      },
      {
        question: "Do I need a solicitor to buy at a UK property auction?",
        answer:
          "Yes. Under the standard conditions the buyer is deemed to purchase with full knowledge of title and raises no objection on matters disclosed in the legal pack. A solicitor's review of the pack before bidding is the only reliable way to understand what is being bought and on what terms.",
      },
      {
        question: "What is the difference between guide price and reserve price?",
        answer:
          "The guide price is an indication of the selling party's expectations, not a valuation. The reserve price is the confidential minimum at or above which the lot will be sold. Lots routinely exceed guide in competitive rooms, so bidders should set their own limit before the auction.",
      },
      {
        question: "Is Murivest the auctioneer on these listings?",
        answer:
          "No. Murivest Group Ltd provides commercial real estate services and publishes auction intelligence. Murivest is not the auctioneer, does not receive bids, does not hold deposits, and does not act as principal in any auction transaction. The selling party named on each listing is responsible for the auction process.",
      },
      {
        question: "Can I finance a purchase at a UK commercial auction?",
        answer:
          "Completion at auction is not conditional on financing, so funding must be arranged before bidding. Bridging facilities and auction-completion lending are commonly used where permanent finance cannot be drawn inside the completion window. A buyer who fails to complete forfeits the deposit and may be liable for the seller's losses.",
      },
    ],
    dataLastUpdated: "2026-11-10",
  },
};

export const SITE_SETTINGS: SiteSettings = {
  officeEmail: "office@murivest.com",
  officePhone: "+254 115 277 610",
  auctionDisclosure: AUCTION_DISCLOSURE,
};
