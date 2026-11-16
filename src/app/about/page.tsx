import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SITE } from "@/lib/brand";

export const metadata = buildMetadata({
  title: "About Murivest Auctions Marketplace | Murivest Group Ltd",
  description:
    "Murivest Auctions is a curated commercial property auction marketplace for Kenya and the UK, operated by Murivest Group Ltd to connect qualified buyers, sellers, and appointed selling parties.",
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
            eyebrow="The marketplace"
            title="About Murivest Auctions."
          />
          <div className="max-w-[42rem] space-y-5">
            <p className="text-[1.1rem] leading-[1.9] text-ink">
              Murivest Auctions is a curated commercial property auction
              marketplace operated by Murivest Group Ltd across Kenya and the
              United Kingdom. The marketplace brings together reviewed auction
              opportunities, seller submissions, qualified buyer access, and
              practical guidance so participants can discover lots, prepare
              documentation, and engage through the appropriate authorised
              channels.
            </p>
            <p className="text-[1.05rem] leading-[1.9] text-ink">
              Murivest manages the marketplace experience and listing review
              process, but is not the auctioneer, does not receive bids, does
              not hold deposits, and is not a party to a sale contract unless
              expressly stated for a specific lot. Where live bidding,
              payments, or settlement are handled by an appointed auctioneer or
              selling party, those terms govern the transaction.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <blockquote className="font-serif text-2xl md:text-3xl italic font-light text-green border-l-2 border-gold pl-10 max-w-3xl">
            A better auction market starts with clearer listings, prepared
            participants, and disciplined process.
          </blockquote>
        </Container>
      </section>

      <section className="border-t border-hairline py-14 md:py-20">
        <Container>
          <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-10">
            What the marketplace provides
          </h2>
          <div className="grid gap-px bg-hairline border border-hairline md:grid-cols-3">
            {[
              {
                title: "Curated auction discovery",
                body: "Reviewed commercial lots and market-specific discovery across Kenya and the UK, with key dates, guide information, and document status where available.",
                href: "/auctions",
              },
              {
                title: "Buyer access & qualification",
                body: "Account registration, saved lots, submission workflows, and verification steps that help buyers prepare to participate through the authorised sale process.",
                href: "/buyers",
              },
              {
                title: "Seller listing review",
                body: "A managed intake path for owners, advisers, and selling parties to submit commercial property for marketplace review and potential auction listing.",
                href: "/selling",
              },
            ].map((service) => (
              <Link
                key={service.title}
                href={service.href}
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
              Murivest Group Ltd
            </ArrowLink>
            <ArrowLink href="/contact">Contact the marketplace team</ArrowLink>
          </div>
        </Container>
      </section>
    </>
  );
}
