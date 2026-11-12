import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";

export const metadata = buildMetadata({
  title: "Buying at a Commercial Property Auction — Kenya & UK | Murivest",
  description:
    "How to buy commercial property at auction in Kenya and the UK — preparation, legal packs, deposits, the fall of the hammer and completion.",
  path: "/how-auctions-work/buying",
});

const FAQS = [
  {
    question: "Can foreigners bid at Kenya property auctions?",
    answer:
      "Yes, subject to the constitutional and statutory limitations on agricultural land, which is generally restricted to Kenyan citizens. Foreign buyers should confirm the land's designation and any consent requirements with their advocate before bidding.",
  },
  {
    question: "Do I need a solicitor or advocate to bid?",
    answer:
      "In both markets, yes in practice. Under the standard conditions the buyer is deemed to purchase with full knowledge of title and raises no objection on matters disclosed in the legal pack. Review before bidding is the allocation of risk.",
  },
  {
    question: "What happens if I win but cannot complete?",
    answer:
      "In the UK the deposit — commonly 10% under the standard conditions — is forfeited and the buyer may be liable for the seller's losses. In Kenya, under the standard conditions, failure to pay the balance within 90 days can result in forfeiture of the deposit (commonly 25%) and resale of the property. The deposit and completion terms for any specific lot are set by that lot's conditions of sale — read them before bidding.",
  },
  {
    question: "Can I view the property before the auction?",
    answer:
      "Viewings are arranged through the selling party or their agent. Murivest lots state their viewing arrangements on the listing, and the deal team arranges access where the selling party permits.",
  },
];

export default function BuyingPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "How auctions work", url: "/how-auctions-work" },
            { name: "Buying at auction", url: "/how-auctions-work/buying" },
          ]),
          faqPageJsonLd(FAQS),
        ]}
      />

      <section className="py-16 md:py-24 border-b border-hairline">
        <Container>
          <SectionHeader
            numeral="I"
            eyebrow="Buyer's guide"
            title="Buying at a commercial property auction."
          />
          <p className="max-w-[42rem] text-[1.1rem] leading-[1.9] text-ink">
            Buying commercial property at auction is a preparation exercise
            conducted at speed. The legal work happens before the auction, the
            funding is arranged before the hammer, and the deposit is ready the
            moment the lot is knocked down. This guide covers both markets.
          </p>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <div className="max-w-[42rem] space-y-12">
            <div>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Before the auction
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink mb-4">
                Start with the legal pack. In both markets the buyer is deemed
                to purchase with full knowledge of title and cannot later
                object to matters disclosed in it. Engage a solicitor or
                advocate, review the title, the tenancy schedule and the
                special conditions, and track any addenda published before the
                auction — addenda form part of the contract.
              </p>
              <p className="text-[1rem] leading-[1.9] text-ink">
                Arrange funding next. Completion at auction is not conditional
                on financing. A lender&rsquo;s indicative terms are not enough:
                the deposit must be liquid on the day, and the balance must be
                capable of being drawn within the settlement period — 90 days
                in Kenya, typically 20 working days in the UK.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Kenya — the auction day
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink mb-4">
                A Kenyan chargee sale requires that statutory notices have been
                served — a 40-day notice of default and a three-month statutory
                notice of sale — before the auction can proceed. Verify the
                notices in the legal pack and confirm the auctioneer&rsquo;s
                licence before bidding.
              </p>
              <p className="text-[1rem] leading-[1.9] text-ink">
                Under the standard Kenyan conditions the successful bidder
                pays a deposit — commonly 25% — immediately on the
                fall of the hammer, in cash or by banker&rsquo;s cheque only,
                and the balance within 90 days. The deposit amount, payment
                method and recipient for each lot are set by that lot&apos;s
                conditions of sale. Stamp duty of 4% of value
                on urban properties is payable to the Kenya Revenue Authority,
                plus conveyancing fees under the Advocates Remuneration Order
                and auctioneer&rsquo;s commission of 1.5–2.5% plus VAT.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                United Kingdom — the auction day
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink mb-4">
                UK commercial rooms trade almost exclusively on unconditional
                contracts under the RICS Common Auction Conditions or the
                Standard Commercial Property Conditions. When the lot is knocked
                down, buyer and seller are bound; there is no cooling-off
                period.
              </p>
              <p className="text-[1rem] leading-[1.9] text-ink">
                A deposit — commonly 10% under the Common Auction Conditions,
                always as the special conditions direct — is paid to the
                auctioneer as agent for the
                seller, with the balance due on the completion date in the
                special conditions — typically 20 working days. The buyer
                insures from exchange, bears the buyer&rsquo;s premium where
                stated, and accounts for VAT where the seller has elected to
                tax.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Setting your limit
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink mb-4">
                The guide price is an indication of the selling party&rsquo;s
                expectations, not a valuation and not the price at which the
                lot will necessarily sell. The reserve is the confidential
                minimum. Competitive lots routinely exceed guide.
              </p>
              <p className="text-[1rem] leading-[1.9] text-ink">
                Set your limit from the numbers, not the room: the net yield
                against your target, the debt the income will service, and the
                total cost including duties, premiums and fees. The calculators
                on this portal do exactly this arithmetic.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Registering through Murivest
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink">
                Every Murivest listing carries a bid registration form. A
                registration captures your intent and amount and routes it to
                the selling party named on the listing — it is not a binding
                bid, and Murivest is not the auctioneer, does not receive bids
                and does not hold deposits.
              </p>
            </div>
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
          <div className="mt-12 flex flex-col sm:flex-row gap-6">
            <ArrowLink href="/auctions">Browse current lots</ArrowLink>
            <ArrowLink href="/how-auctions-work/legal-pack">
              Legal pack and due diligence
            </ArrowLink>
          </div>
        </Container>
      </section>
    </>
  );
}
