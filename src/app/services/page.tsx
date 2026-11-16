import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";

export const metadata = buildMetadata({
  title: "Commercial Real Estate Services — Brokerage, Asset Management, Investment | Murivest",
  description:
    "Brokerage, property and asset management, and investment property services from Murivest Group Ltd. Mandate-only, non-pooled, KYC/AML-verified, fiduciary standards.",
  path: "/services",
});

const SERVICES = [
  {
    title: "Brokerage",
    intro:
      "Brokerage at Murivest is the disciplined execution of disposals and acquisitions under mandate. The firm acts for owners, investors and occupiers across office, industrial, retail, hospitality, mixed-use and land, in both markets the auction website covers.",
    points: [
      "Dispositions and acquisitions under exclusive mandate, with institutional reporting throughout.",
      "Auction intelligence and auction-route advisory — sourcing, screening and bid strategy for buyers, and reserve and pack preparation for sellers.",
      "Chargee and receiver engagement on statutory sales, connecting enforced inventory with qualified buyers.",
    ],
  },
  {
    title: "Property and asset management",
    intro:
      "Management at Murivest treats an income property as a governed asset: documented tenancies, controlled outgoings, and reporting an institutional owner can rely on.",
    points: [
      "Tenancy administration, rent collection and arrears management under Kenyan and UK practice.",
      "Asset plans that schedule maintenance, capex and re-letting against the income profile.",
      "Statutory compliance coordination — rates, licences and consents — so the asset is saleable when the owner chooses to exit.",
    ],
  },
  {
    title: "Investment property services",
    intro:
      "For investors, Murivest provides the full acquisition and holding discipline: sourcing, screening, transaction management and the analytical tooling this website publishes.",
    points: [
      "Sourcing and screening against mandate criteria, including the underwriting gates used on this website.",
      "Transaction management through legal pack review, funding coordination and completion.",
      "Portfolio reporting on yield, coverage and exit assumptions, on the same definitions this site publishes.",
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
            eyebrow="What the firm does"
            title="Commercial real estate services."
          />
          <p className="max-w-[42rem] text-[1.05rem] leading-[1.9] text-ink">
            Murivest Group Ltd provides commercial real estate services across
            East Africa, the United Kingdom and international markets. All
            engagements are by mandate only, non-pooled, and subject to
            KYC/AML verification, conducted to fiduciary standards.
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
              Owners and sponsors considering a disposal can present the
              property directly to Murivest's acquisitions team through the
              dedicated selling journey.
            </p>
            <ArrowLink href="/selling">Sell your commercial property</ArrowLink>
          </div>
        </Container>
      </section>

      <section className="border-t border-hairline py-14 md:py-20">
        <Container>
          <ArrowLink href="/contact">Discuss a mandate</ArrowLink>
        </Container>
      </section>
    </>
  );
}
