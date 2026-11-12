import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SITE } from "@/lib/brand";
import { COMMENT_LEGAL } from "@/lib/legal";

export const metadata = buildMetadata({
  title: "Terms of Service | Murivest Auctions",
  description:
    "Terms of Service for auctions.murivest.com — the auction intelligence website of Murivest Group Ltd. Murivest is not the auctioneer and does not receive binding bids or hold deposits.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Terms of Service", url: "/terms" },
        ])}
      />

      <section className="py-16 md:py-24 border-b border-hairline">
        <Container>
          <SectionHeader
            numeral="—"
            eyebrow="Legal"
            title="Terms of Service."
          />
          <p className="max-w-[42rem] text-[1.05rem] leading-[1.9] text-ink">
            These terms govern the use of auctions.murivest.com, the auction
            auction intelligence website of Murivest Group Ltd. By accessing the website
            or submitting any form on it, you accept these terms.
          </p>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <div className="max-w-[42rem] space-y-12">
            <section id="nature-of-service">
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Nature of the service
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink mb-4">
                Murivest Group Ltd provides commercial real estate services
                and publishes auction intelligence. The website aggregates,
                verifies and presents auction opportunities, and routes
                qualified buyers to the appropriate auctioneer, receiver or
                bank process.
              </p>
              <p className="text-[1rem] leading-[1.9] text-ink">
                Murivest is not the auctioneer, does not receive bids, does
                not hold deposits, and does not act as principal in any
                auction transaction. Murivest does not guarantee lot
                availability or sale outcomes. The selling party named on each
                listing is responsible for the auction process, the legal
                pack, and the sale contract.
              </p>
            </section>

            <section id="bid-registrations">
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Bid registrations
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink mb-4">
                Bidding is exclusive to registered accounts on this
                website. A bid submitted from a property page is a
                registration of intent, not a binding bid: it captures the
                bidder&rsquo;s intent and amount and routes it to the selling
                party named on the listing. Submission does not create an
                agency relationship between the bidder and Murivest, and does
                not constitute participation in any auction.
              </p>
              <p className="text-[1rem] leading-[1.9] text-ink">
                Submitters warrant that the information provided is accurate
                and that they are legally entitled to make the registration.
                Registrations are rate-limited and monitored for abuse.
              </p>
            </section>

            <section id="listings">
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Listings and information
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink mb-4">
                Lot information is provided in good faith from particulars
                supplied by the selling party. Guide prices are not
                valuations. All lots are subject to the selling party&rsquo;s
                terms, due diligence, and formal contract. Figures derived
                from selling-party particulars are not valuations and must be
                verified against the legal pack.
              </p>
              <p className="text-[1rem] leading-[1.9] text-ink">
                This information does not constitute an offer, solicitation,
                or investment advice.
              </p>
            </section>

            <section id="calculators">
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Calculators
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink">
                The calculators on this website are arithmetic tools that run
                in the browser. No data entered into them is transmitted or
                stored. Calculator output is not a valuation, not advice, and
                does not account for tax. The user is responsible for the
                assumptions entered.
              </p>
            </section>

            <section id="user-generated-content">
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                User-generated content
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink mb-4">
                The website accepts public comments on property listings.
                Comments are moderated before publication; nothing publishes
                automatically. Email addresses are never displayed. Comments
                are read-only once published — there are no replies,
                threading or likes.
              </p>
              <p className="text-[1rem] leading-[1.9] text-ink mb-4">
                {COMMENT_LEGAL}
              </p>
              <p className="text-[1rem] leading-[1.9] text-ink">
                By submitting a comment you warrant that you are its author,
                that it does not disclose confidential information relating to
                a third party, and that you have the right to publish its
                contents.
              </p>
            </section>

            <section id="engagements">
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Engagements and verification
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink">
                All engagements with Murivest Group Ltd are by mandate only,
                non-pooled, and subject to KYC/AML verification. Use of this
                website does not itself create an engagement or a
                client relationship.
              </p>
            </section>

            <section id="liability">
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Limitation of liability
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink">
                To the fullest extent permitted by law, Murivest Group Ltd
                accepts no liability for loss arising from reliance on
                information published on this website, including guide prices,
                yields, particulars and calculator output. Buyers must conduct
                their own due diligence and take professional advice before
                bidding or contracting.
              </p>
            </section>

            <section id="governing-law">
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Governing law and contact
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink">
                These terms are governed by the laws of the Republic of
                Kenya, without prejudice to any mandatory consumer protection
                in the user&rsquo;s jurisdiction. Questions about these terms
                may be directed to{" "}
                <a
                  href={`mailto:${SITE.officeEmail}`}
                  className="text-gold hover:text-green transition-colors"
                >
                  {SITE.officeEmail}
                </a>
                .
              </p>
            </section>
          </div>
        </Container>
      </section>
    </>
  );
}
