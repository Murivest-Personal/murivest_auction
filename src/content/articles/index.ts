/* Launch articles — 12 market articles + 4 evergreen guides.
   Ordered by publishedAt descending at render time. */

import type { Article } from "@/lib/types";

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

export const ARTICLES: Article[] = [
  keBuyersGuide,
  keBankReceiver,
  keTitleLegalPack,
  keMarket2026,
  keFailedAuctions,
  keRegional,
  ukBuyersGuide,
  ukGuideReserve,
  ukMarket2026,
  ukLondonRegional,
  ukAlternatives,
  ukFinancing,
  evGlossary,
  evRegisterBid,
  evLegalPack,
  evSellersChecklist,
];
