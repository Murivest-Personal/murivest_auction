import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";

export const metadata = buildMetadata({
  title: "Auction Calculators — Return, Underwriting & Loan Repayment | Murivest Group Ltd",
  description:
    "Free institutional-grade calculators for commercial property auctions: total return and levered IRR, underwriting gates, and loan repayment schedules. From Murivest Group Ltd.",
  path: "/tools",
});

const TOOLS = [
  {
    title: "Return calculator",
    href: "/tools/return-calculator",
    description:
      "Total return on a property, with or without leverage — net yield, cash-on-cash, DSCR, equity multiple, levered IRR and payback.",
  },
  {
    title: "Underwriting calculator",
    href: "/tools/underwriting-calculator",
    description:
      "The institutional screen — net yield, DSCR, cap rate, payback and GRM gates, cleared or not cleared against your mandate thresholds.",
  },
  {
    title: "Loan repayment calculator",
    href: "/tools/loan-repayment-calculator",
    description:
      "The debt side — monthly payments, total interest, balances at year five and ten, and the full amortisation schedule.",
  },
];

export default function ToolsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Calculators", url: "/tools" },
        ])}
      />

      <section className="py-16 md:py-24 border-b border-hairline">
        <Container>
          <SectionHeader
            numeral="—"
            eyebrow="Buyer tools"
            title="Institutional-grade auction calculators."
          />
          <p className="max-w-[42rem] text-[1.05rem] leading-[1.9] text-ink">
            Three calculators, each available as a full page and as an
            embedded widget on every property listing. All calculations run in
            your browser — no data is stored, nothing is sent anywhere.
          </p>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <div className="grid gap-px bg-hairline border border-hairline md:grid-cols-3">
            {TOOLS.map((tool) => (
              <article key={tool.href} className="bg-cream p-8 flex flex-col">
                <h2 className="font-serif text-xl md:text-2xl font-light text-green mb-3">
                  {tool.title}
                </h2>
                <p className="text-[0.9rem] leading-[1.7] text-ink mb-6">
                  {tool.description}
                </p>
                <div className="mt-auto pt-4 border-t border-hairline">
                  <ArrowLink href={tool.href}>Open the calculator</ArrowLink>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
