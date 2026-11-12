import type { Article } from "@/lib/types";

/* Cluster: buying-at-auction. The bank-sale file read end to end —
   how repossessed stock actually reaches the market, why it prices
   below open-market levels, the risk stack that travels with it,
   and the verification discipline that separates the two. Voice
   per the Murivest Manual: institutional, Kenya-grounded,
   no filler. */

export const article: Article = {
  _id: "article-buying-3",
  title: "Bank Repossessed Properties in Kenya: Where the Value Sits, and Where the Risk Sits",
  slug: "bank-repossessed-properties-kenya",
  market: "kenya",
  category: "analysis",
  cluster: "buying-at-auction",
  intent: "Informational-Investigative",
  excerpt:
    "'Bank repossessed' describes a statutory process, not a finished product. The value comes from forced-sale pricing; the risk stack comes with it, and the conditions of sale hand most of it to the buyer.",
  seoTitle: "Bank Repossessed Properties in Kenya: Value and Risk",
  metaDescription:
    "Bank-sale pricing is anchored to forced-sale valuations, not sentiment. The risk stack behind the discount, and the checks that separate value from risk.",
  author: "Murivest Research",
  publishedAt: "2026-10-22T08:00:00+03:00",
  body: [
    {
      type: "p",
      text: "'Bank repossessed' suggests a finished product — a bank that owns a property and wants it gone. What actually exists is a statutory process: a chargee or a receiver selling through a licensed auctioneer, inside a timetable fixed by the Land Act 2012, at a price anchored to a forced-sale valuation rather than to sentiment. The discount is real. So is the risk stack that produces it, and the conditions of sale hand most of that stack to the buyer. This analysis maps where the value sits, where the risk sits, and the verification file that tells the two apart before the hammer falls. The buyer's job is to buy the first and manage the second.",
    },
    { type: "h2", text: "How bank-owned stock actually comes to market" },
    {
      type: "p",
      text: "Two distinct processes sell what buyers loosely call repossessed property. The first is the chargee sale. A lender exercising its statutory power of sale under the Land Act 2012 serves the chargor with a 90-day notice of default under section 90, then issues the notification of sale at least 40 days before the auction under section 96 as amended in 2016; the sale itself is by public auction unless the parties agree otherwise. The lender never owned the property — it sells the charged asset to realise its security, and any surplus returns to the borrower.",
    },
    {
      type: "p",
      text: "The second is the receivership sale. Where the borrower is a company, a receiver appointed under a debenture takes control of the asset and sells it as an officer accountable to the appointing secured creditor. Both processes end at the same place — a public auction conducted by a licensed auctioneer — and both can deliver a sound title. The difference lies in what must be verified on the way there. The practical test is documentary: a chargee sale produces the chargor's notices and the chargee's instructions; a receivership produces the debenture, the appointment and the receiver's reports. Ask which file exists, and read the documents that answer.",
    },
    { type: "h2", text: "The value thesis: anchored to valuations, not sentiment" },
    {
      type: "p",
      text: "Bank-sale pricing is not sentimental pricing. A chargee exercising its statutory power of sale is entitled to sell at the best price reasonably obtainable in the circumstances, and the practical anchor is the forced-sale valuation commissioned before the auction — a methodology that assumes a constrained marketing period and a buyer who must transact quickly, not an open-market search for the best possible purchaser. Reserves are set from that basis. Bidders compete from it. The result is a price that can sit meaningfully below what an unstressed, unpressured seller would accept in private-treaty negotiation, and that difference is the discount which draws the market to these sales.",
    },
    {
      type: "p",
      text: "This is the honest source of the discount: process, not defect. A price below market tells you the sale is compelled. It does not tell you the property is defective, and it does not tell you the property is sound. Defects are established separately, by the buyer, before bidding — which is what the risk stack below describes. Buyers who read the discount as proof of quality, or as proof of the opposite, are reading the wrong document.",
    },
    { type: "h2", text: "The risk stack, layer by layer" },
    {
      type: "p",
      text: "Five layers recur in Kenyan bank-sale files, and each one has ended somebody's purchase. Process irregularity: a defective section 90 or section 96 notice, inadequate service, or a miscounted period — any of which can ground a challenge to the sale long after the hammer. Occupation: the property may carry a sitting tenant, a former borrower in possession, or third parties whose status only a site visit and the court record will reveal. Encumbrances and caveats: charges, caveats and inhibitions disclosed — or not disclosed — by the official search, some of which survive the sale and attach to the buyer's title. Arrears: county rates and utility arrears that follow the land and land on the purchaser. Undisclosed condition: structural, drainage, access or title-condition defects that a sold-as-seen sale leaves entirely with the buyer.",
    },
    {
      type: "p",
      text: "None of these is exotic. All of them are priced, or they are absorbed. The difference between a professional auction purchase and an expensive one is whether the stack was quantified before the hammer or discovered after it — and the quantification has a name: the verification file, assembled before the auction rather than after it.",
    },
    { type: "h2", text: "The verification file" },
    {
      type: "p",
      text: "The buyer's protection is a file, not a promise. It opens with the statutory notices themselves — the section 90 notice of default, the section 96 notification of sale, and the proofs of service attached to each — read against the statutory requirements rather than assumed. It continues with the valuation basis: which value the reserve was anchored to, and whether the advertised price is consistent with it. The auctioneer's licence is verified within the Auctioneers Act framework, because an unlicensed or lapsed auctioneer conducting a statutory sale is a defect, not a formality. Official searches at the lands registry and the county confirm title, encumbrances and rates status at source, on the day of the search and again close to the auction date. Where any document in that chain cannot be produced, the bid waits until it can be.",
    },
    {
      type: "p",
      text: "The file's purpose is narrow and decisive. It either supports the premise that the sale is regular, or it identifies the specific irregularity that should change the bid — or end it. What it never does is leave the buyer relying on the selling party's assurances. Those are worth exactly what the conditions of sale say they are worth, which in a sold-as-seen sale is usually nothing.",
    },
    { type: "h2", text: "Price is not cost: pricing the process" },
    {
      type: "p",
      text: "The disciplined buyer separates two numbers before bidding. The price is the hammer figure. The total cost of acquisition is the price plus the deposit mechanics, stamp duty at 4% of market value within municipalities and 2% outside as at writing, legal and conveyancing fees, any auctioneer's charges the conditions allocate to the purchaser, rates and utility arrears cleared, possession costs where the lot is occupied, and the refurbishment the condition demands. The process itself is a line item too — verification, counsel, and the dead time between hammer and registration during which the asset earns nothing for the buyer.",
    },
    {
      type: "p",
      text: "Budgeting the first number and not the second is the most common failure in Kenyan auction purchases, and it fails at exactly the wrong moment: when the completion window closes. The bid ceiling should be built backwards from total cost of acquisition, never forwards from the hammer price. Murivest publishes verified auction intelligence — title checks, occupancy checks, reserve sanity checks — and represents buyers under separate mandate. Murivest is not the auctioneer, and every engagement runs by mandate only, subject to KYC and AML verification.",
    },
  ],
  faqs: [
    {
      question: "Are titles from bank sales clean?",
      answer:
        "A properly conducted statutory sale transfers a good title, and many do. 'Properly conducted' is the operative phrase — the buyer's protection is the verification file, not the label. Search the title, read the notices and their proofs of service, and confirm the auctioneer's licence before bidding.",
    },
    {
      question: "Why are bank-sale prices below market?",
      answer:
        "Because the process compels them. The reserve is anchored to a forced-sale valuation, the marketing timetable is fixed by statute, and the chargee must realise rather than negotiate for the best conceivable price. The discount reflects process, not necessarily defect — defects are established separately, by diligence.",
    },
    {
      question: "Can the losing borrower challenge the sale after I have bought?",
      answer:
        "Challenges are possible, and notices, service and timing are the usual grounds. A regular process is the main defence, which is why the verification file is assembled before bidding. A registered transfer from a properly conducted sale is difficult to unwind; take counsel's view on the specific facts early.",
    },
    {
      question: "Which checks are non-negotiable?",
      answer:
        "The official search, the statutory notices with their proofs of service, the auctioneer's licence, rates and land rent status, and the occupation position on the ground. Every one is verifiable before the auction. A lot that cannot pass these five checks is not a bargain; it is a liability with a guide price.",
    },
  ],
  sources: [
    { label: "Kenya Law — Land Act 2012, sections 90 and 96", url: "https://new.kenyalaw.org" },
    { label: "Kenya Law — Auctioneers Act and Auctioneers Rules", url: "https://new.kenyalaw.org" },
    { label: "Murivest Group Ltd — verified auction intelligence", url: "https://murivest.com" },
  ],
  related: [
    { label: "Bank sales vs receiver sales in Kenya: what commercial buyers need to know", href: "/intelligence/bank-sales-vs-receiver-sales-kenya" },
    { label: "Auction Property Due Diligence in Kenya", href: "/intelligence/auction-property-due-diligence-kenya" },
    { label: "How Property Auctions Work in Kenya: The Complete Mechanics", href: "/intelligence/how-property-auctions-work-kenya" },
  ],
};
