import type { Article } from "@/lib/types";

/* Cluster: auction-machinery. Pre-emptive borrower structuring —
   how the decisions taken at purchase determine whether the
   auctioneer is ever instructed. Voice per the Murivest Manual:
   institutional, understated, no filler. */

export const article: Article = {
  _id: "article-machinery-5",
  title: "Buying Property on a Loan: Structuring the Purchase So Auction Never Enters the Story",
  slug: "how-to-buy-property-on-loan-without-being-auctioned",
  market: "kenya",
  category: "guide",
  cluster: "auction-machinery",
  intent: "Transactional",
  excerpt:
    "Most auction files are made on signing day, not default day. The structure of the purchase loan — the stress test, the buffers, the covenants, the maturity plan — decides whether an auctioneer is ever instructed at all.",
  seoTitle: "Buying Property on a Loan Without Being Auctioned",
  metaDescription:
    "Auction risk is decided at purchase, not default. How to structure a Kenyan property loan: stress tests, LTV buffers, covenants and refinancing lead time.",
  author: "Murivest Research",
  publishedAt: "2026-11-02T08:00:00+03:00",
  body: [
    {
      type: "p",
      text: "Auction files are made on signing day, not default day. By the time a Kenyan borrower is reading statutory notices, the structural facts that determined the outcome were set long before: the loan-to-value at drawdown, the covenants in the facility letter, the mismatch between the loan's term and the investment's rhythm, the absence of any plan for maturity. Lending structures fail quietly for years before they fail loudly. This guide is about the quiet years — the decisions taken at purchase that decide whether the auctioneer is ever instructed, and the small administrative habits that catch trouble while it is still cheap to fix.",
    },
    { type: "h2", text: "Stress-test the income before you borrow, not after" },
    {
      type: "p",
      text: "The bank will stress-test the loan before approving it, for the bank's protection. Borrowers should run their own, harsher version, for theirs. Model the income at realistic vacancy, not at the letting agent's brochure rate. Model a rate reset in either direction, and if the facility is dollar-linked, model the shilling moving against you. Model the tenant of consequence leaving, because single-tenant income is concentration risk wearing a rent roll's clothes. Then ask the only question that matters: at which combination of these stresses does monthly servicing break? If the answer is a scenario that has occurred within living memory, the loan is sized wrong, whatever the approval letter says.",
    },
    {
      type: "p",
      text: "The right size is not the maximum offered. It is the amount that survives your own stress test with margin still standing — and no one else will impose that discipline for you, because the lender's test protects the lender. Write the stressed case down and keep it with the facility documents; when the numbers wobble years later, the record of what you once assumed is a better adviser than optimism.",
    },
    { type: "h2", text: "Loan-to-value discipline and the buffers" },
    {
      type: "p",
      text: "Loan-to-value is the first structural buffer, and it belongs to the borrower as much as to the lender. Kenyan chargees lend against value — commonly anchored to the forced-sale valuation rather than the open-market figure — and the margin between those numbers is the headroom that protects against a downturn. A conservative starting LTV leaves three things: room for the property's value to fall before the loan is underwater, capacity to raise further funds against the same security if genuine need arrives, and credibility in any later restructuring conversation, because a borrower with equity is a borrower worth accommodating. Stretching to the maximum advance buys a larger property and a smaller margin for error. That trade is usually priced wrongly. Note also what the lender advances against: where the facility is sized off the forced-sale valuation, the true cushion is smaller than the open-market arithmetic suggests, and the dashboard should use the harsher number.",
    },
    {
      type: "p",
      text: "Buffers compound. A modest LTV, a repayment cushion and an income reserve are three separate shock absorbers, and the loan that has all three rarely meets an auctioneer.",
    },
    { type: "h2", text: "Facility terms worth negotiating" },
    {
      type: "p",
      text: "The facility letter is negotiable more often than borrowers believe, and the moments before signature are the only moments of equal bargaining power. Terms worth pressing: a moratorium sized to the real duration of a development or fit-out; a rescheduling framework — what happens, and at whose cost, if terms must be revised; the interest basis and how resets are determined; and what the security documentation actually captures, including whether further charges or cross-collateralisation over other assets are contemplated. Read the events-of-default clause personally, not through the lender's summary. The covenants you sign on day one are the ones the workout department will hold you to on the worst day, and an informal accommodation is not a defence any of them will accept.",
    },
    {
      type: "p",
      text: "Take the facility letter and the charge to a lawyer who works for you, before signature. The review costs a fraction of one restructuring, and it is the only time changes are cheap. Ask for every covenant that carries a default consequence to be marked, and for the cure of each to be priced — that memo becomes the covenant calendar the dashboard runs on.",
    },
    { type: "h2", text: "Covenant hygiene: the defaults nobody sees coming" },
    {
      type: "p",
      text: "Facilities are lost on covenants while servicing is still current. Insurance must be in force on the terms the security documents require, with the lender noted where specified; a lapsed policy is a breach. Rates and rent must be paid to the county, and arrears surface at the worst moments — in a restructuring negotiation, or in a sale. Landlord consents, licences and lease documentation for income property must exist in writing. Use conditions, where they attach, must be observed. None of this is exciting. All of it appears in the events-of-default clause, and every item can be cured for a fraction of what it costs to breach. The discipline is a calendar, checked monthly, by someone whose job it is to check. Lease paperwork belongs in the same file: undocumented tenancies, side letters and informal rent concessions are invisible until a lender, a valuer or a buyer looks, and each one is a small discount off the security when discovered.",
    },
    {
      type: "p",
      text: "Where professional management is in place, covenant compliance should be a standing agenda item, not a crisis response.",
    },
    { type: "h2", text: "Rent-direct arrangements for income property" },
    {
      type: "p",
      text: "Where the property's rent services the loan, structure the collections so they actually do. The standard mechanism is a rent-direct or collection-account arrangement: tenants pay into an account from which the loan instalment is applied before anything else, with the mandate disclosed in the lease and, commonly, acknowledged by the lender. The virtues are several. Collections cannot be diverted to other pressures in a thin month. The lender sees the income performing in real time, which matters disproportionately when the account is stressed — a visible rent roll is the single most persuasive exhibit in a restructuring file. And the arrangement disciplines the landlord's own cash management, which is quietly where most investment borrowers come unstuck.",
    },
    {
      type: "p",
      text: "Negotiate it at the start, when it is a term of the deal. Retrofitting a rent-direct mandate onto a tenanted building mid-distress is far harder, and tenants smell distress in the paperwork. Done early, the arrangement reads as professionalism; done late, it reads as surrender of control, and the lender prices the two readings differently. Keep the rent roll audit-ready — leases, statements, arrears position — because it is the first exhibit every counterparty asks to see.",
    },
    { type: "h2", text: "The maturity wall and the early-warning dashboard" },
    {
      type: "p",
      text: "Performing loans end up in the auction pages through one mechanism more than any other: the facility matured and the takeout never arrived. Five-year money against a ten-year investment is a structure, not a loan — it only works if refinancing is treated as a project with its own lead time. Begin the refinancing conversation well before maturity; for sizeable facilities, a year ahead is prudent, because valuation, credit and legal take months even in normal conditions, and conditions are not always normal. Alongside it, run a simple dashboard: arrears days, covenant dates, insurance expiry, rates clearance status, facility expiry. One page, reviewed monthly. Where the file shows a borrower who was later auctioned, it usually also shows a dashboard-shaped hole — a date that was known for years and acted on never.",
    },
    {
      type: "p",
      text: "Auction is the failure mode of an unmanaged structure, not a random event. Murivest publishes verified auction intelligence and represents property owners and buyers under separate mandate; Murivest is not the auctioneer, and engagements are by mandate only, subject to KYC and AML verification.",
    },
  ],
  faqs: [
    {
      question: "What loan-to-value ratio is prudent?",
      answer:
        "There is no universal figure, and each lender sets its own ceiling. Prudence is better defined by stress: a starting LTV that keeps the loan comfortably secured if values fall, and leaves the borrower with equity and credibility if terms must ever be renegotiated. Borrowing the maximum on offer rarely survives that test.",
    },
    {
      question: "What covenants should I watch?",
      answer:
        "The events-of-default clause, read in full: insurance on the specified terms, rates and rent paid, consents in place, use conditions observed. These breach quietly while servicing is current. Calendar every one of them and review monthly — cures are cheap early and expensive late.",
    },
    {
      question: "How should rental income be structured?",
      answer:
        "Through a rent-direct or collection-account arrangement: tenants pay into an account that services the loan instalment before anything else, with the mandate disclosed in the lease and acknowledged by the lender. Collections stay visible to the bank and cannot be diverted in a thin month.",
    },
    {
      question: "How early before maturity should I arrange refinancing?",
      answer:
        "Treat refinancing as a project with lead time, not an errand. For sizeable facilities, begin at least a year before maturity: valuation, credit and legal take months in normal conditions, and a maturing facility with no takeout in sight is the classic path to auction.",
    },
  ],
  sources: [
    { label: "Central Bank of Kenya — prudential guidance", url: "https://www.centralbank.go.ke" },
    { label: "Kenya Bankers Association — member practice", url: "https://www.kba.co.ke" },
    { label: "Kenya Law — Land Act 2012", url: "https://new.kenyalaw.org" },
  ],
  related: [
    { label: "How to Avoid Being Auctioned in Kenya: The Borrower's Defence Sequence", href: "/intelligence/how-to-avoid-being-auctioned-kenya-borrower-defence" },
    { label: "How Banks Exercise the Statutory Power of Sale in Kenya", href: "/intelligence/how-banks-exercise-power-of-sale-kenya" },
    { label: "Bank-Repossessed Properties in Kenya", href: "/intelligence/bank-repossessed-properties-kenya" },
  ],
};
