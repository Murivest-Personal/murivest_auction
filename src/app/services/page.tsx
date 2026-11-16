import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";

export const metadata = buildMetadata({
  title: "Marketplace Services — Listing, Buyer Access & Auction Support | Murivest",
  description:
    "Services supporting the Murivest commercial property auction marketplace: curated listing review, buyer access and qualification support, and auction preparation across Kenya and the UK.",
  path: "/services",
});

const SERVICES = [
  {
    title: "Listing review & marketplace preparation",
    intro:
      "Murivest supports sellers, advisers, and appointed selling parties with a curated intake process for commercial property auction opportunities.",
    points: [
      "Property submission review for suitability, completeness, and marketplace fit.",
      "Coordination of key listing information, dates, guide details, and available documentation status.",
      "Publication of reviewed opportunities to qualified marketplace audiences in Kenya and the UK.",
    ],
  },
  {
    title: "Buyer access & participation support",
    intro:
      "The marketplace provides tools and workflows that help buyers discover lots, organise interest, and prepare for participation through the authorised process.",
    points: [
      "Account registration, saved lots, watchlists, and submission tracking.",
      "Qualification and verification steps where required by the lot or selling party.",
      "Guidance on auction steps, required documents, and participation routes.",
    ],
  },
  {
    title: "Auction coordination & market support",
    intro:
      "Murivest works alongside owners, advisers, auctioneers, and selling parties to keep marketplace activity clear, timely, and commercially focused.",
    points: [
      "Market-specific discovery across Kenya and the UK commercial auction landscape.",
      "Enquiry routing and communication support between interested parties where appropriate.",
      "Advisory support on auction readiness, process, and next steps, subject to the applicable mandate or engagement.",
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
        ])}
      />

      <section className="py-16 md:py-24 border-b border-hairline">
        <Container>
          <SectionHeader
            numeral="—"
            eyebrow="Marketplace support"
            title="Services for buyers and sellers."
          />
          <p className="max-w-[42rem] text-[1.05rem] leading-[1.9] text-ink">
            Murivest Auctions combines curated marketplace access with
            practical support for listing, discovery, and participation.
            Services are provided subject to the applicable engagement, and
            transaction-specific authority remains with the appointed
            auctioneer or selling party where relevant.
          </p>
        </Container>
      </section>

      {SERVICES.map((service, i) => (
        <section key={service.title} className="border-t border-hairline py-14 md:py-20">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
              <div>
                <span className="font-serif text-[3.5rem] font-light text-sand opacity-50 leading-none select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="font-serif text-2xl md:text-3xl font-light text-green mt-4">
                  {service.title}
                </h2>
              </div>
              <div>
                <p className="text-[1rem] leading-[1.9] text-ink mb-6 max-w-[42rem]">
                  {service.intro}
                </p>
                <ul className="space-y-3 max-w-[42rem]">
                  {service.points.map((point) => (
                    <li key={point} className="flex gap-4 text-[0.95rem] leading-[1.8] text-ink">
                      <span className="text-gold flex-shrink-0" aria-hidden="true">
                        —
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </section>
      ))}

      <section className="border-t border-hairline py-14 md:py-20">
        <Container>
          <div className="max-w-[42rem]">
            <p className="text-[1rem] leading-[1.9] text-ink mb-6">
              Preparing to bring a commercial property to auction? Submit the
              opportunity for marketplace review and our team will advise on
              next steps.
            </p>
            <ArrowLink href="/selling">Submit a property for review</ArrowLink>
          </div>
        </Container>
      </section>

      <section className="border-t border-hairline py-14 md:py-20">
        <Container>
          <ArrowLink href="/contact">Contact the marketplace team</ArrowLink>
        </Container>
      </section>
    </>
  );
}
