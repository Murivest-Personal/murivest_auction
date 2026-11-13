import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";

export const metadata = buildMetadata({
  title: "Auction Glossary — Kenya & UK Commercial Property Terms | Murivest",
  description:
    "Commercial property auction terms for Kenya and the UK — guide price, reserve, chargee sale, statutory notice, special conditions, buyer's premium and more.",
  path: "/how-auctions-work/glossary",
});

const FAQS = [
  {
    question: "What is the difference between guide price and reserve price?",
    answer:
      "The guide price is an indication of the selling party's expectations, not a valuation. The reserve price is the confidential minimum at or above which the lot will be sold. Lots routinely exceed guide in competitive rooms.",
  },
  {
    question: "What does 'sold as seen' mean at auction?",
    answer:
      "The lot is sold subject to all faults and defects, with no warranty as to condition, repair or fitness for purpose. The buyer takes the property in its actual state, which is why inspections and the legal pack matter more than the photographs.",
  },
  {
    question: "What is a chargee sale?",
    answer:
      "A sale by a lender exercising its statutory power of sale under the Land Act 2012 after a borrower's default — the form most Kenyan commercial auctions take. The chargee must serve the statutory notices before the auction can proceed.",
  },
];

const SECTIONS: { heading: string; terms: [string, string][] }[] = [
  {
    heading: "Shared vocabulary",
    terms: [
      ["Guide price", "An indication of the selling party's expectations published in the catalogue. Not a valuation, and not the price at which the lot will necessarily sell."],
      ["Reserve price", "The confidential minimum price at or above which the lot will be sold. The auctioneer may refuse any bid below it."],
      ["Hammer price", "The winning bid at which the auctioneer knocks down the lot. The contract price before additionals such as buyer's premium, commission, duties and VAT."],
      ["Lot", "A single property or parcel offered in the auction catalogue, identified by its lot or reference number."],
      ["Legal pack", "The bundle of title documents, searches, tenancy information and conditions on which the lot will sell and complete."],
      ["Buyer's premium", "A fee payable by the buyer in addition to the hammer price, stated in the catalogue or special conditions. Common in UK rooms; not a feature of Kenyan chargee sales, where auctioneer's commission applies instead."],
      ["Exchange and completion", "Exchange is the moment the contract becomes binding — at auction, on the fall of the hammer. Completion is the transfer of title against payment of the balance."],
      ["Deposit", "The portion of the price paid on exchange. Kenya: 25% immediately, cash or banker's cheque. UK: 10% to the auctioneer as agent for the seller."],
    ],
  },
  {
    heading: "Kenya-specific terms",
    terms: [
      ["Chargee sale", "A sale by a lender exercising its statutory power of sale under the Land Act 2012 (ss. 90–97) after default on a charge."],
      ["Statutory notice of sale", "The three-month notice that must be served before a chargee sale can proceed, following the 40-day notice of default."],
      ["Forced-sale valuation", "The valuation basis on which the reserve in a chargee sale is usually set — the price achievable on a constrained timetable."],
      ["Official search", "A search at the Lands Registry revealing the current register position: proprietorship, encumbrances, cautions and caveats."],
      ["Encumbrance", "Any registered burden on the title — a charge, easement, restriction or caveat — that passes to the buyer unless discharged."],
      ["Caveat and caution", "Registry instruments lodged to protect an interest in land. They can block registration of a transfer and must be investigated before bidding."],
      ["Banker's cheque", "The only instrument, alongside cash, accepted for the deposit at a Kenyan auction."],
      ["Stamp duty", "A tax on the transfer at 4% of value for urban properties, payable to the Kenya Revenue Authority."],
      ["Advocates Remuneration Order", "The statutory scale governing conveyancing fees in Kenya."],
    ],
  },
  {
    heading: "United Kingdom-specific terms",
    terms: [
      ["Unconditional contract", "The standard auction contract: binding on the fall of the hammer, deposit paid, no cooling-off period, completion on the date in the special conditions."],
      ["Conditional contract", "A contract allowing a window after the auction for exchange or completion, used by some regional houses."],
      ["General conditions", "The standard terms printed in the auction catalogue, commonly the RICS Common Auction Conditions (4th edition) or the Standard Commercial Property Conditions."],
      ["Special conditions", "The lot-specific terms that vary the general conditions — deposit, completion date, costs, notices. Special conditions prevail in the event of conflict."],
      ["Elected to tax", "A seller's VAT election. Where the property is elected, VAT is payable on the price in addition to the hammer price."],
      ["Rentcharge", "A periodic payment secured on land, distinct from a rent under a lease, encountered on some freehold titles."],
      ["Requisitions", "A buyer's formal objection or enquiry on title. Under the standard conditions the buyer raises no requisition on matters disclosed in the legal pack."],
      ["Addenda", "Corrections or additions to the catalogue issued before the auction. Addenda form part of the contract."],
    ],
  },
];

export default function GlossaryPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "How auctions work", url: "/how-auctions-work" },
            { name: "Auction glossary", url: "/how-auctions-work/glossary" },
          ]),
          faqPageJsonLd(FAQS),
        ]}
      />

      <section className="py-16 md:py-24 border-b border-hairline">
        <Container>
          <SectionHeader
            numeral="IV"
            eyebrow="Reference"
            title="Auction glossary — Kenya and UK terms."
          />
          <p className="max-w-[42rem] text-[1.05rem] leading-[1.9] text-ink">
            The vocabulary of commercial property auctions, in three groups:
            the shared vocabulary of the auction room, the statutory language
            of Kenyan chargee sales, and the contractual language of the UK
            catalogue.
          </p>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <div className="grid gap-16 lg:grid-cols-2">
            {SECTIONS.map((section) => (
              <div key={section.heading}>
                <h2 className="font-serif text-2xl font-light text-green mb-6">
                  {section.heading}
                </h2>
                <dl className="border-t border-hairline">
                  {section.terms.map(([term, definition]) => (
                    <div key={term} className="py-5 border-b border-hairline">
                      <dt className="font-display text-[0.7rem] tracking-[0.25em] uppercase text-gold mb-2">
                        {term}
                      </dt>
                      <dd className="text-[0.95rem] leading-[1.8] text-ink">
                        {definition}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-hairline py-14 md:py-20">
        <Container>
          <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-8">
            Frequently asked questions
          </h2>
          <div className="max-w-[42rem]">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group border-t border-hairline py-5 [&:last-of-type]:border-b"
              >
                <summary className="flex items-center justify-between gap-6 cursor-pointer list-none">
                  <span className="font-serif text-lg font-light text-green">
                    {faq.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex-shrink-0 w-7 h-7 border border-sand flex items-center justify-center text-xs text-green group-open:bg-green group-open:text-cream transition-colors"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 text-[0.95rem] leading-[1.8] text-ink max-w-[40rem]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
          <div className="mt-12">
            <ArrowLink href="/intelligence">
              Read the research desk on these terms
            </ArrowLink>
          </div>
        </Container>
      </section>
    </>
  );
}
