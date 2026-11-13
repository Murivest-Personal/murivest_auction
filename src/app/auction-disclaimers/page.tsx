import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AUCTION_DISCLOSURE } from "@/lib/legal";

export const metadata = buildMetadata({
  title: "Auction Disclaimers | Murivest Group Ltd",
  description:
    "Disclaimers governing auction listings on auctions.murivest.com — lot information, guide prices, verification limits, and the selling party's terms.",
  path: "/auction-disclaimers",
});

export default function AuctionDisclaimersPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Auction disclaimers", url: "/auction-disclaimers" },
        ])}
      />

      <section className="py-16 md:py-24 border-b border-hairline">
        <Container>
          <SectionHeader
            numeral="—"
            eyebrow="Legal"
            title="Auction disclaimers."
          />
          <p className="max-w-[42rem] text-[1.05rem] leading-[1.9] text-ink">
            All lot information published on auctions.murivest.com is provided
            in good faith from particulars supplied by the selling party.
            Buyers must conduct their own due diligence. Guide prices are not
            valuations. The selling party&rsquo;s terms prevail.
          </p>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <div className="max-w-[42rem] space-y-12">
            <section>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Lot information
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink">
                Particulars, photographs, income figures and metrics are
                derived from selling-party particulars. They are believed to
                be correct but their accuracy is not guaranteed, and they do
                not constitute a representation by Murivest Group Ltd. Figures
                derived from selling-party particulars are not valuations —
                verify against the legal pack.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Guide prices are not valuations
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink">
                A guide price is an indication of the selling party&rsquo;s
                expectations. It is not a valuation, not an asking price, and
                not a prediction of the hammer price. Lots may sell above or
                below guide. Independent valuation advice should be obtained
                before bidding.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Verification has limits
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink">
                The verification summary on each lot states what Murivest has
                verified and what it has not. Verification is a discipline of
                disclosure, not a warranty of title, income or outcome, and it
                does not replace the buyer&rsquo;s own due diligence against
                the legal pack.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                The selling party&rsquo;s terms prevail
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink">
                All lots are subject to the selling party&rsquo;s terms, due
                diligence, and formal contract. The full conditions of sale,
                together with any special conditions and addenda, govern the
                transaction. Murivest Group Ltd is not a party to any sale
                contract.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Auction disclosure
              </h2>
              <div className="border border-hairline bg-cream p-6 text-[0.75rem] leading-[1.7] text-charcoal font-body">
                {AUCTION_DISCLOSURE}
              </div>
            </section>
          </div>
        </Container>
      </section>
    </>
  );
}
