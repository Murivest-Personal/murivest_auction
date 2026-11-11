import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SITE } from "@/lib/brand";
import { AUCTION_DISCLOSURE } from "@/lib/legal";

export const metadata = buildMetadata({
  title: "Contact the Murivest Deal Team | Murivest Group Ltd",
  description:
    "Contact Murivest Group Ltd in Nairobi or London. Buyer mandates, seller mandates, legal pack requests and auction enquiries. Engagements by mandate only, subject to KYC/AML verification.",
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
            title="Contact the deal team."
          />
          <p className="max-w-[42rem] text-[1.05rem] leading-[1.9] text-ink">
            Murivest engages with buyers and sellers by mandate only. Whether
            you are registering a buying mandate, listing a property for
            auction, or requesting a legal pack, the first step is a
            conversation with the team.
          </p>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <div className="grid gap-px bg-hairline border border-hairline md:grid-cols-3">
            <div className="bg-cream p-8">
              <p className="font-body text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
                Email
              </p>
              <a
                href={`mailto:${SITE.officeEmail}`}
                className="font-serif text-xl font-light text-green hover:text-gold transition-colors break-all"
              >
                {SITE.officeEmail}
              </a>
              <p className="mt-4 text-[0.85rem] leading-[1.7] text-charcoal">
                Buyer mandates, seller mandates, legal pack requests and press.
              </p>
            </div>
            <div className="bg-cream p-8">
              <p className="font-body text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
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
              <p className="font-body text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
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
                Buyer mandates
              </h2>
              <p className="text-[0.95rem] leading-[1.8] text-ink mb-4">
                Register a buying mandate to receive verified lots that match
                your criteria before they are published, with access to the
                deal team through diligence and bidding. Mandates are
                non-pooled and subject to KYC/AML verification.
              </p>
              <ArrowLink
                href={`mailto:${SITE.officeEmail}?subject=${encodeURIComponent(
                  "Buyer mandate enquiry"
                )}`}
              >
                Register a buyer mandate
              </ArrowLink>
            </div>
            <div>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Listing a property for auction
              </h2>
              <p className="text-[0.95rem] leading-[1.8] text-ink mb-4">
                Murivest lists properties for auction by mandate —
                verification, particulars, legal pack coordination and
                publication to qualified buyers across both markets.
              </p>
              <ArrowLink
                href={`mailto:${SITE.officeEmail}?subject=${encodeURIComponent(
                  "Seller mandate enquiry"
                )}`}
              >
                List a property for auction
              </ArrowLink>
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
