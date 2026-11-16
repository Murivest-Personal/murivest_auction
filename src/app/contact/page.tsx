import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SITE } from "@/lib/brand";
import { AUCTION_DISCLOSURE } from "@/lib/legal";

export const metadata = buildMetadata({
  title: "Contact Murivest Auctions | Buyers, Sellers & Enquiries",
  description:
    "Contact Murivest Auctions in Nairobi or London for buyer access, seller submissions, listing enquiries, and marketplace support across Kenya and the UK.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" },
        ])}
      />

      <section className="py-16 md:py-24 border-b border-hairline">
        <Container>
          <SectionHeader
            numeral="—"
            eyebrow="Nairobi · London"
            title="Contact the marketplace team."
          />
          <p className="max-w-[42rem] text-[1.05rem] leading-[1.9] text-ink">
            Use the marketplace team for buyer access, seller submissions,
            listing enquiries, document requests, and support. Where a lot is
            handled by an appointed auctioneer or selling party, the relevant
            authorised contact and conditions of sale will apply.
          </p>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <div className="grid gap-px bg-hairline border border-hairline md:grid-cols-3">
            <div className="bg-cream p-8">
              <p className="font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
                Email
              </p>
              <a
                href={`mailto:${SITE.officeEmail}`}
                className="font-serif text-xl font-light text-green hover:text-gold transition-colors break-all"
              >
                {SITE.officeEmail}
              </a>
              <p className="mt-4 text-[0.85rem] leading-[1.7] text-charcoal">
                Buyer access, seller submissions, listing enquiries and support.
              </p>
            </div>
            <div className="bg-cream p-8">
              <p className="font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
                Telephone
              </p>
              <p className="font-serif text-xl font-light text-green">
                {SITE.officePhone}
              </p>
              <p className="mt-4 text-[0.85rem] leading-[1.7] text-charcoal">
                Nairobi hours, Monday to Friday.
              </p>
            </div>
            <div className="bg-cream p-8">
              <p className="font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
                Offices
              </p>
              <p className="text-[0.9rem] leading-[1.8] text-green">
                {SITE.nairobiOffice}
              </p>
              <p className="mt-3 text-[0.9rem] leading-[1.8] text-green">
                {SITE.londonOffice}
              </p>
            </div>
          </div>

          <div className="mt-14 grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Buyer access
              </h2>
              <p className="text-[0.95rem] leading-[1.8] text-ink mb-4">
                Create an account to save lots, submit enquiries or bids where
                available, and complete verification steps required for
                participation. Access and eligibility depend on the lot and the
                selling party&apos;s process.
              </p>
              <ArrowLink href="/register">Create a buyer account</ArrowLink>
            </div>
            <div>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                List a property
              </h2>
              <p className="text-[0.95rem] leading-[1.8] text-ink mb-4">
                Submit commercial property details for marketplace review.
                Murivest can help prepare listing information and route
                suitable opportunities through the curated auction process.
              </p>
              <ArrowLink href="/selling">Submit a property</ArrowLink>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-hairline py-14">
        <Container>
          <div className="border border-hairline bg-cream p-6 text-[0.75rem] leading-[1.7] text-charcoal font-body">
            {AUCTION_DISCLOSURE}
          </div>
        </Container>
      </section>
    </>
  );
}
