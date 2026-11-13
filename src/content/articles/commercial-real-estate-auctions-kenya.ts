import type { Article } from "@/lib/types";

/* Cluster: buying-at-auction. The commercial buyer's framework —
   why income-producing assets surface at Kenyan auctions, the
   institutional diligence file, submarket grounding and hedged
   yield reference bands. Voice per the Murivest Manual:
   institutional, Kenya-grounded, no filler. */

export const article: Article = {
  _id: "article-buying-2",
  title: "Commercial Real Estate Auctions in Kenya: An Institutional Framework",
  slug: "commercial-real-estate-auctions-kenya",
  market: "kenya",
  category: "analysis",
  cluster: "buying-at-auction",
  intent: "Investment Research",
  excerpt:
    "Commercial assets reach Kenyan auction rooms through the same statutory machinery as residential stock, but they are bought as income instruments. The framework institutional buyers use — tenancy files, cost files, submarket grounding and hedged yield bands.",
  seoTitle: "Commercial Real Estate Auctions in Kenya: Framework",
  metaDescription:
    "Why commercial assets surface at Kenyan auctions, the institutional diligence file from tenancy to title, Nairobi submarkets, and referenced yield bands.",
  author: "Murivest Research",
  publishedAt: "2026-10-26T08:00:00+03:00",
  body: [
    {
      type: "p",
      text: "Commercial assets reach Kenyan auction rooms through the same statutory machinery as residential stock, yet they are bought differently — as income-producing instruments, not houses. The institutional buyer underwrites the tenancy, the operating cost base and the title with the rigour a fund would apply to a negotiated acquisition, then asks what the auction discount is paying for. That is the correct frame. This analysis sets out why commercial assets surface at auction in Kenya, the diligence file institutional buyers run before bidding, where Nairobi's established submarkets sit, and which yield reference bands are commonly quoted for them.",
    },
    { type: "h2", text: "Why commercial assets come to auction" },
    {
      type: "p",
      text: "Commercial stock surfaces at Kenyan auctions for four recurring reasons. Loan workouts: a facility secured over an office block or godown complex has defaulted, and the chargee is exercising its power of sale under the Land Act 2012. Receiverships: the borrower is a company, and a receiver appointed under a debenture is realising assets to repay secured creditors — a different process, run by a different fiduciary, with its own accountability line. Estate liquidations: a deceased owner's commercial property must be sold to distribute the estate, and the auction route is faster than private treaty when the executors need certainty of outcome. Partnership disputes: co-owners who cannot agree find that an auction resolves the deadlock at a price nobody can later dispute.",
    },
    {
      type: "p",
      text: "The common thread is compulsion. Nobody's favourite building goes to auction. Somebody's deadline does, and the deadline — not the building's quality — is what the buyer is being paid to absorb.",
    },
    { type: "h2", text: "The tenancy file: leases, schedules, service charge" },
    {
      type: "p",
      text: "Institutional buyers open the file with the tenancy, because the tenancy is the income and the income is the asset. A full tenant schedule, verified against executed lease documents rather than a vendor's summary, establishes who occupies what, on what terms, until when, and at what rent. The leases are read for the clauses that move value: rent review mechanics, renewal options, break rights, repair obligations, and any consents or waivers buried in the documentation. Arrears are the tell. A tenant schedule showing current rent and no arrears describes a performing asset; the same schedule carrying six months of arrears describes a discount that is not really a discount.",
    },
    {
      type: "p",
      text: "Service charge history comes next. For offices and mixed-use assets, the service charge is a second rent, and its history — collections, arrears, and what the charge actually funded — is often the difference between the stated yield and the true one. A building that recovers 60% of its service charge income is not the asset its headline yield describes.",
    },
    { type: "h2", text: "The cost and title file: rates, capex, zoning, searches" },
    {
      type: "p",
      text: "The second half of the file prices the standing cost of the asset and the state of its title. Rates and land rent: arrears of county rates follow the land, and unpaid statutory rent on a leasehold threatens the lease itself; both are checked at source before bidding. Operating costs: the actual cost of running the building — security, common-area utilities, insurance, management — measured against service charge income, to establish genuine net operating income. Capital expenditure: plant, roofs, lifts, electrical installations and water systems all have ages, and the buyer inherits every one of them; a condition survey prices what the next five years will demand. Zoning and approved use: the county's records confirm what the land may lawfully be used for, and a building operating outside its approved use is a liability wearing an income stream. Title verification: official searches at the registry confirm ownership, encumbrances and caveats.",
    },
    {
      type: "p",
      text: "One line at a time, the file converts an advertised yield into an underwritten one. The advertised number is the seller's arithmetic. The underwritten number is the buyer's, and it is the only one that should set a bid.",
    },
    { type: "h2", text: "Grounding the submarkets" },
    {
      type: "p",
      text: "Nairobi's commercial auction stock is not evenly distributed. Office assets concentrate in Westlands — the established professional and corporate node with the deepest tenant market — and Upper Hill, where newer stock has carried elevated vacancy in recent years and where auction lots appear accordingly. Logistics and industrial stock runs along Mombasa Road, the primary distribution corridor, and through the Industrial Area, the older, denser manufacturing grid nearer the CBD, where titles tend to be older and the diligence correspondingly longer. Kilimani anchors the mixed-use segment: residential-led towers with retail podiums, where the buyer is really purchasing a bundle of small tenancies and a service-charge regime rather than a single letting.",
    },
    {
      type: "p",
      text: "Submarket is not a footnote. The same building type prices differently across these nodes because tenant depth, vacancy risk and exit liquidity differ, and a bid formed without submarket context is a bid formed blind. The institutional file always asks the locational question before the yield question — what this asset, in this node, does that a competitor two kilometres away does not.",
    },
    { type: "h2", text: "Yield reference bands, properly hedged" },
    {
      type: "p",
      text: "Yields circulate in the Kenyan market as reference bands, and they deserve careful handling. The ranges commonly referenced for Nairobi offices cluster roughly between 8.5 and 10.5 per cent; for industrial and logistics assets, roughly between 10 and 13 per cent. These are commonly referenced market ranges, not verified statistics, and they move with tenancy quality, lease length, building age and the specific node — a fully let, long-lease Westlands office at the bottom of the band and a vacant Upper Hill floor plate nearer the top are not the same asset at the same yield.",
    },
    {
      type: "p",
      text: "The discipline is to treat any quoted band as the beginning of underwriting, never its conclusion. The institutional method inverts the question: not what yield this submarket trades at, but what yield this specific tenancy file, cost base and capex schedule justifies. The band tells you where the market stands. Only the file tells you where you should.",
    },
    { type: "h2", text: "Where the institutional discount comes from" },
    {
      type: "p",
      text: "Auction pricing for commercial assets sits below private-treaty pricing, and the discount has a precise economic identity: it is the consideration paid for absorbing what a negotiated sale would not impose. Speed — the deposit at the hammer and the balance inside the completion window, with no conditions to hide behind. Condition risk — sold as seen, with no vendor warranties and no disclosure schedule. Occupied possession, where it exists, transferred with the lot. Process risk — statutory notices, auctioneer conduct and completion mechanics that the buyer, not the seller, must verify. And dead time: the income lost between research, auction and registration.",
    },
    {
      type: "p",
      text: "Each of these is quantifiable. The disciplined buyer prices every one, adds them to the hammer ceiling, and bids only where the discount exceeds the total. Where it does, the auction is the cheapest route to institutional-grade stock in Kenya. Where it does not, the discount was never a discount. Murivest publishes verified commercial auction intelligence and represents buyers under separate mandate; Murivest is not the auctioneer, and engagements run by mandate only, subject to KYC and AML verification.",
    },
  ],
  faqs: [
    {
      question: "Are commercial auctions riskier than residential?",
      answer:
        "The risks are different in kind, not simply larger. Commercial files carry tenancy, capex, zoning and service-charge exposures that residential files rarely do. Each is quantifiable with the right diligence, which is what the institutional checklist exists to do — and why commercial buyers run longer files than residential ones.",
    },
    {
      question: "What yield should a commercial buyer target?",
      answer:
        "There is no single target. Ranges commonly referenced in the Nairobi market run roughly 8.5 to 10.5 per cent for offices and 10 to 13 per cent for industrial, but these are reference bands, not verified statistics. The target yield should fall out of the tenancy file, cost base and capex schedule of the specific asset.",
    },
    {
      question: "Can commercial auction purchases be financed?",
      answer:
        "Yes. Kenyan banks lend against commercial property bought at auction, subject to their own valuation and tenancy assessment. The binding constraint is timing: the deposit falls due at the hammer and the balance inside the completion window, so the facility must be disbursable, not merely approved, before bidding.",
    },
    {
      question: "What happens to sitting tenants?",
      answer:
        "A genuine, current lease binds the purchaser; the buyer steps into the landlord's position on the existing terms. This is why the tenancy file matters as much as the title file. Occupiers without a documented tenancy are a possession question, priced and planned before the auction, not after.",
    },
  ],
  sources: [
    { label: "Kenya Law — Land Act 2012, section 96", url: "https://new.kenyalaw.org" },
    { label: "Central Bank of Kenya — prudential guidance", url: "https://www.centralbank.go.ke" },
    { label: "Murivest Group Ltd — commercial auction intelligence", url: "https://murivest.com" },
  ],
  related: [
    { label: "Commercial property auctions in Kenya: a buyer's guide", href: "/intelligence/commercial-property-auctions-kenya-buyers-guide" },
    { label: "Bank Repossessed Properties in Kenya: Where the Value Sits, and Where the Risk Sits", href: "/intelligence/bank-repossessed-properties-kenya" },
    { label: "Auction vs Private Treaty in Kenya: A Buyer's Comparison", href: "/intelligence/auction-vs-private-treaty-kenya-buyer-comparison" },
  ],
};
