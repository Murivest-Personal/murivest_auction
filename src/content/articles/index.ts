/* Research desk article registry — 16 launch articles + 30
   auction-intelligence articles (borrower defence, auction
   machinery, trusts & structuring, buying at auction, finance &
   diligence, buyer representation). Ordered by publishedAt
   descending at render time. */

import type { Article, ArticleCluster } from "@/lib/types";

import { article as keBuyersGuide } from "./commercial-property-auctions-kenya-buyers-guide";
import { article as keBankReceiver } from "./bank-sales-vs-receiver-sales-kenya";
import { article as keTitleLegalPack } from "./title-encumbrances-legal-pack-kenya-due-diligence";
import { article as keMarket2026 } from "./kenya-commercial-auction-market-2026";
import { article as keFailedAuctions } from "./why-commercial-property-auctions-fail-kenya";
import { article as keRegional } from "./nairobi-vs-mombasa-vs-kisumu-auction-opportunities";
import { article as ukBuyersGuide } from "./uk-commercial-property-auctions-buyers-guide";
import { article as ukGuideReserve } from "./guide-price-vs-reserve-price-uk-auction-catalogue";
import { article as ukMarket2026 } from "./uk-commercial-auction-market-2026";
import { article as ukLondonRegional } from "./london-vs-regional-uk-auction-yields-2026";
import { article as ukAlternatives } from "./alternative-assets-uk-auction-hotels-care-homes";
import { article as ukFinancing } from "./financing-a-uk-auction-purchase-bridging-debt";
import { article as evGlossary } from "./auction-glossary-kenya-uk-commercial-property-terms";
import { article as evRegisterBid } from "./how-to-register-to-bid-commercial-property-auction";
import { article as evLegalPack } from "./what-is-a-legal-pack-what-should-it-contain";
import { article as evSellersChecklist } from "./selling-commercial-property-at-auction-sellers-checklist";

/* --- Auction defence & borrowers --- */
import { article as deAvoidAuction } from "./how-to-avoid-being-auctioned-kenya-borrower-defence";
import { article as deStatutoryNotice } from "./what-to-do-when-you-receive-a-statutory-notice-kenya";
import { article as deWhyDefault } from "./why-borrowers-default-and-get-auctioned-kenya";
import { article as deStopAuction } from "./how-to-stop-a-bank-auction-kenya";
import { article as deRestructureVsRefinance } from "./loan-restructuring-vs-refinancing-distressed-property-kenya";
import { article as deRedemption } from "./redemption-rights-kenya-before-and-after-the-hammer";

/* --- Auction machinery --- */
import { article as maChainOfAuthority } from "./how-auctioneers-get-to-sell-your-property-kenya";
import { article as maPowerOfSale } from "./how-banks-exercise-power-of-sale-kenya";
import { article as maAuctioneersAct } from "./auctioneers-act-kenya-borrowers-buyers-guide";
import { article as maForcedSaleValuation } from "./forced-sale-valuation-reserve-prices-kenya";
import { article as maBuyOnLoanSafely } from "./how-to-buy-property-on-loan-without-being-auctioned";

/* --- Trusts & asset structuring --- */
import { article as trRegisterTrust } from "./register-a-trust-to-avoid-owning-anything-kenya";
import { article as trOwnNothing } from "./what-to-do-to-avoid-owning-anything-and-not-get-auctioned";
import { article as trFamilyTrust } from "./family-trust-kenya-registration-costs-protection";
import { article as trCompanyVsTrust } from "./company-vs-trust-property-ownership-kenya";
import { article as trLimits } from "./limits-of-asset-protection-trusts-kenya";

/* --- Buying at auction --- */
import { article as byHowAuctionsWork } from "./how-property-auctions-work-kenya";
import { article as byCommercialAuctions } from "./commercial-real-estate-auctions-kenya";
import { article as byBankRepossessed } from "./bank-repossessed-properties-kenya";
import { article as byTrueCost } from "./cost-of-buying-auction-property-kenya";
import { article as byTenPercentDeposit } from "./auction-deposit-10-percent-kenya-what-happens-if-you-fail";
import { article as byOccupied } from "./occupied-auction-properties-tenants-possession-kenya";
import { article as byVsPrivateTreaty } from "./auction-vs-private-treaty-kenya-buyer-comparison";

/* --- Finance & due diligence --- */
import { article as fiFinancing } from "./financing-an-auction-purchase-kenya";
import { article as fiDueDiligence } from "./auction-property-due-diligence-kenya";
import { article as fiTitleVerification } from "./title-verification-encumbrances-kenya-auction-buyer";

/* --- Buyer representation & market --- */
import { article as rpTwoPercentModel } from "./buyer-brokerage-2-percent-model-why-sellers-bank-never-pays";
import { article as rpDisposalLogic } from "./why-banks-sell-through-auctioneers-not-portals";
import { article as rpOffMarket } from "./off-market-auction-intelligence-kenya";
import { article as rpNairobiSubmarkets } from "./nairobi-auction-submarkets-westlands-upper-hill-industrial";

/** Legacy launch articles carry no cluster in their source files;
    assign them here so the blog groups cleanly. */
function withCluster(
  article: Article,
  cluster: ArticleCluster
): Article {
  return article.cluster ? article : { ...article, cluster };
}

export const ARTICLES: Article[] = [
  // Kenya launch set
  withCluster(keBuyersGuide, "kenya-market"),
  withCluster(keBankReceiver, "kenya-market"),
  withCluster(keTitleLegalPack, "finance-diligence"),
  withCluster(keMarket2026, "kenya-market"),
  withCluster(keFailedAuctions, "kenya-market"),
  withCluster(keRegional, "kenya-market"),
  // UK launch set
  withCluster(ukBuyersGuide, "uk-market"),
  withCluster(ukGuideReserve, "uk-market"),
  withCluster(ukMarket2026, "uk-market"),
  withCluster(ukLondonRegional, "uk-market"),
  withCluster(ukAlternatives, "uk-market"),
  withCluster(ukFinancing, "uk-market"),
  // Evergreen guides
  withCluster(evGlossary, "fundamentals"),
  withCluster(evRegisterBid, "fundamentals"),
  withCluster(evLegalPack, "fundamentals"),
  withCluster(evSellersChecklist, "fundamentals"),
  // Auction defence & borrowers
  deAvoidAuction,
  deStatutoryNotice,
  deWhyDefault,
  deStopAuction,
  deRestructureVsRefinance,
  deRedemption,
  // Auction machinery
  maChainOfAuthority,
  maPowerOfSale,
  maAuctioneersAct,
  maForcedSaleValuation,
  maBuyOnLoanSafely,
  // Trusts & asset structuring
  trRegisterTrust,
  trOwnNothing,
  trFamilyTrust,
  trCompanyVsTrust,
  trLimits,
  // Buying at auction
  byHowAuctionsWork,
  byCommercialAuctions,
  byBankRepossessed,
  byTrueCost,
  byTenPercentDeposit,
  byOccupied,
  byVsPrivateTreaty,
  // Finance & due diligence
  fiFinancing,
  fiDueDiligence,
  fiTitleVerification,
  // Buyer representation & market
  rpTwoPercentModel,
  rpDisposalLogic,
  rpOffMarket,
  rpNairobiSubmarkets,
];
