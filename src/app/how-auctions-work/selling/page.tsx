import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";

export const metadata = buildMetadata({
  title: "Selling Commercial Property at Auction — A Seller's Checklist | Murivest",
  description:
    "How to sell commercial property at auction in Kenya and the UK — choosing the route, reserve strategy, the legal pack, and timing against the auction calendar.",
  path: "/how-auctions-work/selling",
});

const FAQS = [
  {
    question: "When is auction the right route for a seller?",
    answer:
      "Auction suits sellers who value certainty of outcome and a fixed timetable over price maximisation — chargees and receivers discharging statutory duties, estates and funds with defined exit windows, and vendors of assets that trade more readily on a published deadline.",
  },
  {
    question: "How is the reserve price set?",
    answer:
      "The reserve is the confidential minimum price at or above which the lot will be sold. In Kenya it is usually set on a forced-sale valuation. A reserve set too close to the guide suppresses competitive bidding; set too far below expectation, it risks an undersale.",
  },
  {
    question: "How does Murivest list properties for auction?",
    answer:
      "By mandate. Murivest works with the seller or the chargee to verify the lot, prepare the particulars and the legal pack position, and publish it to qualified buyers. Murivest is not the auctioneer — the selling party named on each listing remains responsible for the auction process.",
  },
];

export default function SellingPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "How auctions work", url: "/how-auctions-work" },
            { name: "Selling at auction", url: "/how-auctions-work/selling" },
          ]),
          faqPageJsonLd(FAQS),
        ]}
      />

      <section className="py-16 md:py-24 border-b border-hairline">
        <Container>
          <SectionHeader
            numeral="II"
            eyebrow="Seller's guide"
            title="Selling commercial property at auction."
          />
          <p className="max-w-[42rem] text-[1.1rem] leading-[1.9] text-ink">
            Selling at auction trades a measure of price for certainty of
            process: a published date, a binding contract on the fall of the
            hammer, and a deposit that is at risk from the moment the lot is
            knocked down. This checklist sets out what a seller should prepare
            before the catalogue goes out.
          </p>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <div className="max-w-[42rem] space-y-12">
            <div>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Choose the route deliberately
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink mb-4">
                Auction is not a discount channel — it is a certainty channel.
                It suits chargees and receivers discharging statutory duties,
                estates and funds with defined exit windows, and assets whose
                value is better discovered on a deadline than negotiated over
                months.
              </p>
              <p className="text-[1rem] leading-[1.9] text-ink">
                If the asset needs an occupier&rsquo;s story, a planning
                narrative or a phased exit, private treaty will usually serve
                better. If the story is income, title and deadline, auction
                will.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Prepare the legal pack before the catalogue
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink mb-4">
                The most common cause of a weak auction outcome is a thin
                legal pack. Title documents, searches, the tenancy schedule,
                statutory notices where applicable, and the special conditions
                should be assembled before the catalogue is published —
                institutional buyers will not bid confidently on a lot they
                cannot diligence.
              </p>
              <p className="text-[1rem] leading-[1.9] text-ink">
                In Kenya, confirm that the statutory notice position is clean
                before the sale is advertised; irregular notices are the
                leading ground on which auction sales are challenged. In the
                UK, disclose everything material — the buyer is deemed to
                purchase with full knowledge of title, and surprises after the
                hammer become disputes.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Set the reserve against the evidence
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink mb-4">
                The reserve is the confidential minimum at or above which the
                lot will sell. In Kenya it is usually set on a forced-sale
                valuation. The guide price that accompanies it is an
                indication of expectations, not a valuation.
              </p>
              <p className="text-[1rem] leading-[1.9] text-ink">
                A reserve set too close to the guide suppresses competitive
                bidding; set too far below expectation, it risks an undersale.
                Test both against the income particulars — the yield the
                market will apply is the discipline behind the number.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Time the sale against the calendar
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink mb-4">
                Auction rooms publish their calendars months ahead, and lots
                that miss a catalogue wait for the next cycle. Work backwards
                from the auction date: legal pack assembled, particulars
                verified, viewing arrangements made, and the deposit and
                completion mechanics confirmed with the auctioneer.
              </p>
              <p className="text-[1rem] leading-[1.9] text-ink">
                The Murivest auction calendar aggregates verified lots across
                both markets, and the deal team lists properties for auction
                by mandate.
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
          <div className="mt-12">
            <ArrowLink href="/contact">Discuss a sale by mandate</ArrowLink>
          </div>
        </Container>
      </section>
    </>
  );
}
