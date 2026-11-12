/* Legal copy. The auction disclosure and fee texts are locked —
   render verbatim, never edit without board approval. */

export const AUCTION_DISCLOSURE =
  "Auction disclosure. Murivest Group Ltd provides commercial real estate services and publishes auction intelligence. Murivest is not the auctioneer and does not act as principal in any auction transaction. Bid registrations submitted through this website are expressions of buyer intent, are not binding bids, and are routed by Murivest to the authorised sale channel. Deposits payable under the auction conditions are paid to the selling party, not to Murivest; the deposit amount, deadline, payment method and recipient are set by the conditions of sale for each individual lot and are never set by Murivest. Murivest acts for buyers under a separate engagement and charges the successful purchaser a brokerage fee of 2% of the final purchase price, payable after the deposit required under the lot's conditions of sale. Guide prices are not valuations. All lots are subject to the selling party’s terms, due diligence, and formal contract. This information does not constitute an offer, solicitation, or investment advice. All engagements are by mandate only and subject to KYC/AML verification.";

/** Selling party block (property detail page) — mandatory sentence. */
export const SELLING_PARTY_STATEMENT =
  "Murivest is not the auctioneer, does not receive binding bids, and does not hold deposits.";

/** The bold 2% buyer brokerage consent recorded with every bid
    registration (user requirement — must render in bold). The
    deposit percentage is deliberately NOT stated here: it is set
    per lot by that lot's conditions of sale (issue #1 — never
    hardcode one deposit percentage across markets). */
export const FEE_CONSENT_TEXT =
  "I accept that Murivest Group Ltd charges a buyer brokerage fee of 2% of the final purchase price, payable after I have paid the deposit of the purchase price required under the conditions of sale for the lot, to the selling party under those conditions.";

/** Version tag for the consent text stored with each bid record. */
export const FEE_CONSENT_VERSION = "buyer-fee-2pct-v2";

/** Terms consent text recorded with every bid registration. */
export const TERMS_CONSENT_TEXT =
  "I accept the Terms of Service and Privacy Policy, and confirm that this registration is a registration of intent, not a binding bid.";

export const TERMS_CONSENT_VERSION = "terms-v2";

/** Short fee line used on the buyer-fees page and listing sidebars. */
export const FEE_SUMMARY =
  "Murivest charges the successful buyer a brokerage fee of 2% of the final purchase price. The fee becomes payable after the buyer has paid the deposit required under the conditions of sale for the lot. The deposit amount, deadline, payment method and recipient are set by each lot's conditions of sale, not by Murivest. The fee is separate from the deposit, separate from the auctioneer’s charges, and is never paid by the selling bank or institution.";

/** Investment metrics footnote (addendum §1.4) */
export const METRICS_FOOTNOTE =
  "Figures derived from selling-party particulars. Not a valuation. Verify against the legal pack.";

/** Definitional note required on metric-bearing pages (addendum §1.2) */
export const METRIC_DEFINITIONS =
  "Net yield is NOI divided by total acquisition cost (price plus fees). Cap rate is NOI divided by value. Where no acquisition costs are supplied, the two are equal. GRM uses gross annual rent, not NOI — where gross rent is not disclosed by the selling party, GRM is shown as “Not disclosed.”";

/** Conditions of sale summary disclaimer (addendum §3.4) */
export const CONDITIONS_DISCLAIMER =
  "Summary only. The full conditions of sale, together with any special conditions and addenda, govern the transaction. Murivest Group Ltd is not a party to the sale contract. Buyers must read the full legal pack before bidding.";

/** Bid registration sub-line (features spec §3.5) — updated for the
    buyer-brokerage model and source confidentiality. */
export const BID_SUBLINE =
  "Bids submitted here are registrations of buyer intent. Murivest, acting as your buyer-side auction brokerage, will route your registration to the authorised sale channel and support your acquisition. The selling institution and appointed auctioneer are identified in the formal auction notice issued to registered bidders. This is not a binding bid.";

/* ============================================================
   Confidentiality agreement (NDA) — data room access.
   ============================================================ */

/** Version tag stored with every NDA acceptance. */
export const NDA_TERMS_VERSION = "nda-v1";

export const NDA_INTRO =
  "Before the documentation for this property is released to you, you must accept the confidentiality terms below. Your acceptance is recorded with a timestamp against your buyer record, and access can be revoked at any time.";

export const NDA_TERMS: string[] = [
  "Confidential information. The documentation, reports, tenancy details, financial particulars and other information made available in the data room for this property (the \"Confidential Information\") are provided by or on behalf of the selling party for the sole purpose of evaluating a possible acquisition.",
  "Use restriction. You will use the Confidential Information solely to decide whether to pursue an acquisition of the property. You will not copy, reproduce, distribute or publish it, in whole or in part, except to your professional advisers who are bound by equivalent confidentiality obligations.",
  "Source protection. You will not use the Confidential Information to identify, contact or negotiate directly with the selling party, the selling party's advisers, tenants or staff, or any auctioneer connected with the property, except through Murivest or as expressly permitted by the auction conditions.",
  "No circumvention. Any bid, offer or negotiation in respect of the property will be conducted through the channels stated in the auction conditions or the formal auction notice, and not by bypassing Murivest's sourcing relationships.",
  "Legal disclosure preserved. Nothing in these terms prevents disclosure required by law, by a regulator, or by the auction notice and conditions of sale, including the identification of the legally appointed auctioneer and the sale authority where disclosure is required.",
  "Accuracy and verification. The Confidential Information is supplied by the selling party. Murivest publishes its verification status alongside each check but does not guarantee the completeness or accuracy of selling-party documents. You remain responsible for your own due diligence.",
  "Access control. Access is personal to you, is granted per property, is logged, and may be suspended or revoked at any time. Download permissions are set per document. Expired or superseded document versions are withdrawn from access.",
  "Duration. These obligations apply for as long as you hold the Confidential Information and for three years after access ceases.",
];

export const NDA_CONSENT_TEXT =
  "I accept the confidentiality terms above. I understand that my acceptance is timestamped and recorded, that my access to this data room is logged, and that access may be revoked at any time.";

/** Comment form guidance (addendum §4.5) */
export const COMMENT_INTRO =
  "Leave a comment. Comments are moderated before publication. Your email address is never displayed. Do not post confidential information, legal advice, or anything that could identify a third party.";

/** Comment legal footer (addendum §4.7) — also lives in the Terms of Service. */
export const COMMENT_LEGAL =
  "Comments are the views of the authors and not of Murivest Group Ltd. Murivest does not verify, endorse, or adopt any comment. Murivest reserves the right to remove any comment that is unlawful, defamatory, misleading, or that discloses confidential information, and to report unlawful content to the relevant authorities.";

/** Research disclaimer carried on every article (blog manual §9.3). */
export const RESEARCH_DISCLAIMER =
  "This analysis is for informational purposes only and does not constitute investment, legal, or tax advice. Figures and statutory timelines are stated as generally applicable in Kenya and may vary with the facts of a specific matter. Obtain professional advice before acting.";
