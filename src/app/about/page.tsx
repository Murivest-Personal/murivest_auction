import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SITE } from "@/lib/brand";

export const metadata = buildMetadata({
  title: "About Murivest Group Ltd — Commercial Real Estate Services | Murivest",
  description:
    "Murivest Group Ltd provides commercial real estate services — brokerage, property and asset management, and investment property services — across East Africa, the United Kingdom and international markets.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "About", url: "/about" },
        ])}
      />

      <section className="py-16 md:py-24 border-b border-hairline">
        <Container>
          <SectionHeader
            numeral="—"
            eyebrow="The firm"
            title="About Murivest Group Ltd."
          />
          <div className="max-w-[42rem] space-y-5">
            <p className="text-[1.1rem] leading-[1.9] text-ink">
              Murivest Group Ltd is a commercial real estate services firm
              operating across East Africa, the United Kingdom and
              international markets. The firm provides brokerage, property and
              asset management, and investment property services — including
              this auction intelligence portal, which aggregates verified
              commercial auction listings across Kenya and the UK and routes
              qualified buyers to the selling party.
            </p>
            <p className="text-[1.05rem] leading-[1.9] text-ink">
              Murivest serves owners, investors and occupiers under a single
              access model: mandate-only, non-pooled, with every engagement
              subject to KYC/AML verification and conducted to fiduciary
              standards. The firm is not an auctioneer, does not receive bids,
              does not hold deposits, and is never a party to a sale contract.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <blockquote className="font-serif text-2xl md:text-3xl italic font-light text-green border-l-2 border-gold pl-10 max-w-3xl">
            The gap between institutional standards and East African
            execution is not permanent. It is the opportunity.
          </blockquote>
        </Container>
      </section>

      <section className="border-t border-hairline py-14 md:py-20">
        <Container>
          <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-10">
            Services
          </h2>
          <div className="grid gap-px bg-hairline border border-hairline md:grid-cols-3">
            {[
              {
                title: "Brokerage",
                body: "Dispositions, acquisitions and auction intelligence across both markets, executed under mandate to fiduciary standards.",
              },
              {
                title: "Property and asset management",
                body: "Institutional reporting, tenancy administration and asset plans for income property owners.",
              },
              {
                title: "Investment property services",
                body: "Sourcing, screening and transaction management for investors in commercial property, including auction acquisitions.",
              },
            ].map((service) => (
              <Link
                key={service.title}
                href="/services"
                className="bg-cream p-8 hover:bg-white transition-colors"
              >
                <h3 className="font-serif text-xl font-light text-green mb-3">
                  {service.title}
                </h3>
                <p className="text-[0.9rem] leading-[1.7] text-ink">
                  {service.body}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-hairline py-14 md:py-20">
        <Container>
          <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-10">
            Offices
          </h2>
          <div className="grid gap-12 md:grid-cols-2 max-w-[42rem]">
            <div>
              <p className="font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-3">
                Nairobi
              </p>
              <p className="text-[0.95rem] leading-[1.8] text-ink">
                {SITE.nairobiOffice}
              </p>
            </div>
            <div>
              <p className="font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-3">
                London
              </p>
              <p className="text-[0.95rem] leading-[1.8] text-ink">
                {SITE.londonOffice}
              </p>
            </div>
          </div>
          <div className="mt-12 flex flex-col sm:flex-row gap-6">
            <ArrowLink href={SITE.mainSite} external>
              The firm — murivest.com
            </ArrowLink>
            <ArrowLink href="/contact">Contact the deal team</ArrowLink>
          </div>
        </Container>
      </section>
    </>
  );
}
