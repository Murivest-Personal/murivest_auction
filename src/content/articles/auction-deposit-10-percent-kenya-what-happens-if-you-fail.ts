import type { Article } from "@/lib/types";

/* Cluster: buying-at-auction. The deposit read as what it is — a
   performance obligation, not a down payment. What default costs
   under the conditions of sale, why completions fail, and how the
   funding should be sequenced before the hammer. Voice per the
   Murivest Manual: institutional, Kenya-grounded, no filler. */

export const article: Article = {
  _id: "article-buying-5",
  title: "The 10 Per Cent Deposit: What Happens When an Auction Buyer Cannot Complete",
  slug: "auction-deposit-10-percent-kenya-what-happens-if-you-fail",
  market: "kenya",
  category: "guide",
  cluster: "buying-at-auction",
  intent: "Transactional",
  excerpt:
    "The 10% deposit binds an auction sale at the fall of the hammer, and forfeiture is the common consequence of a failed completion. Why buyers fail, and how to fund the bid properly.",
  seoTitle: "The 10 Per Cent Deposit and Auction Default in Kenya",
  metaDescription:
    "The 10% deposit binds an auction sale, and forfeiture is the common consequence of default. How auction completion fails, and how to fund the bid properly.",
  author: "Murivest Research",
  publishedAt: "2026-10-16T08:00:00+03:00",
  body: [
    {
      type: "p",
      text: "Kenyan auction buyers treat the 10 per cent deposit as a down payment. It behaves more like a performance bond. At the fall of the hammer the deposit binds the sale; if the buyer then fails to complete, the conditions of sale commonly provide for its forfeiture — and completion fails more often than buyers expect, usually because the 'financing' was a letter of offer rather than a disbursable facility. Under Murivest-listed conditions the deposit is 10 per cent of the purchase price, payable immediately, with the balance due inside the completion window. What follows sets out what the deposit does, what default costs, and how the funding should be sequenced.",
    },
    { type: "h2", text: "What the deposit is actually for" },
    {
      type: "p",
      text: "The deposit has two functions, and neither is a down payment in the ordinary sense. First, it binds. When the hammer falls, the successful bidder owes the deposit immediately under the conditions of sale; paying it concludes the contract and takes the lot off the market. Second, it secures. The deposit stands as the selling party's compensation if the purchaser's performance fails — the fund from which a failed completion is made good before the lot is re-offered.",
    },
    {
      type: "p",
      text: "This is why the deposit is demanded in liquid form, on the day, in the instrument the conditions accept. It is also why the figure is meaningful rather than ceremonial: 10 per cent of a commercial lot is real money, posted at speed, against an asset the buyer has typically known for weeks. A buyer who understands the deposit as a performance obligation bids with a different discipline than one who understands it as the first instalment of the price. Same amount. Different instrument entirely.",
    },
    { type: "h2", text: "What the conditions of sale provide on default" },
    {
      type: "p",
      text: "Deposits and defaults are governed by the conditions of sale — the specific document, not a general rule of law — and the buyer should read the default clause before bidding rather than after winning. What follows describes how the mechanism commonly appears in Kenyan conditions of sale; each sale's document controls.",
    },
    {
      type: "p",
      text: "The common sequence runs in three steps. Forfeiture: the deposit is forfeited to the selling party as compensation for the failed completion. Re-offer: the lot is re-advertised or re-auctioned, and the market, not the defaulter, sets the recovery price. Shortfall: where the resale achieves less than the defaulting buyer's price — after the costs of the second sale — the conditions commonly make the defaulter liable for the difference, together with the selling party's costs of both exercises. The exposure, in other words, is not capped at the deposit. Buyers who assume it is have read the conditions as a down-payment schedule rather than as a contract.",
    },
    {
      type: "p",
      text: "Two further points deserve attention. The selling party is usually not obliged to pursue completion against a defaulting buyer; the conditions generally permit it to treat the failure as repudiation and move straight to re-offer. And a buyer who knows completion will fail should say so early. An early, documented admission gives the selling party room to re-market quickly, and sometimes room to negotiate a partial release that a silent default never obtains.",
    },
    { type: "h2", text: "Why buyers fail: the letter of offer problem" },
    {
      type: "p",
      text: "Completion failures cluster around three causes, and the first is the most common. Financing that was never financing: the buyer held a letter of offer — a statement of willingness to lend, subject to conditions — and treated it as money. It is not money. A disbursable facility has completed valuation, security and documentation, and can pay inside the completion window; a letter of offer is an invitation to start that process, which takes longer than the window allows. Unarranged balances: the buyer planned to 'organise the rest' after winning, discovering only then that no lender moves that fast, and that family and chama money needs longer than a completion window too. Late diligence: a search result, a caveat or an occupation issue surfaced in week three of a four-week window, the lender withdrew, and the deposit followed.",
    },
    {
      type: "p",
      text: "None of these is a market problem. All three are sequencing problems, and sequencing is chosen by the buyer. The pattern is so consistent it could be printed on every bidding paddle: the deal that fails is the deal that was funded after it was won. Lenders price certainty of timetable; auctions remove the timetable. The buyer's job is to put the certainty back, by bringing a finished facility to a process designed for finished buyers.",
    },
    { type: "h2", text: "Funding discipline: arrange the money before the hammer" },
    {
      type: "p",
      text: "The rule is short. The deposit liquid, the balance committed, before bidding — not before completion. In practice this means the buyer enters the auction with the deposit in an account that can produce an acceptable instrument the same day, and with a facility the lender has taken to disbursement stage, secured on terms the lender has already accepted. Where the balance is to come from own funds, investments or partners, the mobilisation timetable is tested against the completion window before the bid, with a margin for slippage.",
    },
    {
      type: "p",
      text: "Buyers resist this discipline because arranging funding for a lot one may not win feels wasteful. It is cheaper than the alternative. The cost of a facility prepared and unused is arrangement and commitment; the cost of a deposit forfeited is the deposit, plus any shortfall on resale, plus costs, plus the deal. Where the completion window is genuinely too short for any lender, the honest options are a bridge facility priced into the bid or a lower bid that leaves room — never a hopeful timetable. Auction success is decided in the weeks before the auction, and funded then or not at all.",
    },
    { type: "h2", text: "Sequencing the buyer-side fee" },
    {
      type: "p",
      text: "Buyer-side fees follow their own sequence, and it is worth stating plainly. Murivest charges the successful buyer a brokerage fee of 2% of the final purchase price. It becomes payable after the buyer has paid the 10% deposit — after the sale is bound, not before — and it is separate from the deposit and from any auctioneer's charges. It is never paid by the selling bank or the auctioneer; the engagement is between Murivest and the buyer, under mandate, subject to KYC and AML verification.",
    },
    {
      type: "p",
      text: "The sequencing is deliberate. Representation is engaged during diligence and bidding, when it changes outcomes; it is paid once the outcome exists. A buyer budgeting for an auction should carry both lines: the 10% deposit at the hammer, and the 2% fee after it — with the balance, stamp duty, legal fees and the lot-specific costs behind them. That full stack, computed before bidding, is total cost of acquisition, and it is the only ceiling worth taking into the room. Murivest publishes verified auction intelligence and represents buyers under separate mandate; Murivest is not the auctioneer.",
    },
  ],
  faqs: [
    {
      question: "Is the auction deposit refundable?",
      answer:
        "Not in the ordinary case. If the buyer completes, the deposit forms part of the purchase price. If the buyer defaults, the conditions of sale commonly provide for its forfeiture. There is no statutory cooling-off period; the specific conditions of the sale govern, so read them before bidding.",
    },
    {
      question: "What if my lender delays disbursement?",
      answer:
        "The completion window still closes on schedule, and the delay is the buyer's risk. The conditions of sale govern the default. Mitigation is arranged in advance: a disbursable facility before bidding, or a bridge facility priced into the bid, never a hope that the lender accelerates.",
    },
    {
      question: "Can I lose more than the deposit?",
      answer:
        "Yes. The conditions of sale commonly make a defaulting buyer liable for the shortfall where the lot is re-offered and achieves less, together with the selling party's costs of the second sale. This is a common contractual mechanism, not a statutory rule — read the specific conditions before bidding.",
    },
    {
      question: "When exactly is the 2% brokerage fee payable?",
      answer:
        "After the buyer has paid the 10% deposit. Murivest charges the successful buyer 2% of the final purchase price for buyer-side representation; it is separate from the deposit and from any auctioneer's charges, and it is never paid by the selling bank.",
    },
  ],
  sources: [
    { label: "Kenya Law — Auctioneers Act and Auctioneers Rules", url: "https://new.kenyalaw.org" },
    { label: "Kenya Law — Land Act 2012", url: "https://new.kenyalaw.org" },
    { label: "Murivest Group Ltd — buyer representation and fee structure", url: "https://murivest.com" },
  ],
  related: [
    { label: "How Property Auctions Work in Kenya: The Complete Mechanics", href: "/intelligence/how-property-auctions-work-kenya" },
    { label: "Financing an Auction Purchase in Kenya", href: "/intelligence/financing-an-auction-purchase-kenya" },
    { label: "The True Cost of Buying Auction Property in Kenya: Beyond the Hammer Price", href: "/intelligence/cost-of-buying-auction-property-kenya" },
  ],
};
