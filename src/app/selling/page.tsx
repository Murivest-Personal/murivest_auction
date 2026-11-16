import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SellingForm } from "@/components/selling/SellingForm";

export const metadata = buildMetadata({
  title: "Selling Commercial Property at Auction — Murivest",
  description:
    "Sell your commercial property with certainty through Murivest's auction platform. Disciplined underwriting, transparent competitive sale, and mandate-only execution across Kenya and the UK.",
  path: "/selling",
});

const ADVANTAGES = [
  {
    title: "Transparency",
    description:
      "Every bid is visible. The reserve is confidential but the process is open — sellers see genuine market demand in real time, not negotiated opacity.",
  },
  {
    title: "Certainty",
    description:
      "Exchange on the fall of the hammer. Completion is binding on the contractual date. No fall-throughs, no renegotiation, no conditional offers.",
  },
  {
    title: "Competition",
    description:
      "Multiple qualified buyers bid against each other. The auction format extracts the maximum the market will pay, not the minimum a single buyer will offer.",
  },
  {
    title: "Time",
    description:
      "A defined marketing period and a fixed auction date. From instruction to completion in weeks, not months. The deadline concentrates buyer decision-making.",
  },
];

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Is your property suitable for auction?",
    description:
      "We assess the asset against the Murivest selling test: commercial income, gross yield above 12%, payback in 6–7 years, flexible guide price and no commission payable to Murivest.",
  },
  {
    number: "02",
    title: "Decide on a reserve price",
    description:
      "Your Murivest contact presents a recommended guide range based on comparable evidence and income analysis. You set the confidential reserve; the guide is published.",
  },
  {
    number: "03",
    title: "Instruct a solicitor",
    description:
      "You appoint a solicitor to prepare the legal pack. Murivest coordinates the pack structure so it meets auction standards and buyer expectations in both jurisdictions.",
  },
  {
    number: "04",
    title: "Marketing the property",
    description:
      "A four-week targeted campaign: the auction catalogue, digital listings, direct outreach to qualified buyers and advisers, and scheduled viewings. All enquiries tracked and reported.",
  },
  {
    number: "05",
    title: "Auction day",
    description:
      "Live bidding with telephone and proxy options. The auctioneer manages the process; your Murivest contact is present throughout. Reserve met → exchange on the fall of the hammer.",
  },
  {
    number: "06",
    title: "Completion",
    description:
      "Completion on the contractual date (typically 20 business days). Deposit held by the auctioneer or solicitors. Murivest monitors through to key handover and funds release.",
  },
];

const CRITERIA = [
  {
    title: "Commercial property with income",
    description:
      "Office, industrial, retail, hospitality, mixed-use or alternative commercial asset; tenanted and producing income, not vacant land.",
  },
  {
    title: "Gross yield above 12%",
    description:
      "Gross annual rent divided by the guide price.",
  },
  {
    title: "Payback in 6–7 years",
    description:
      "Guide price divided by gross annual rent.",
  },
  {
    title: "Flexible guide price",
    description:
      "Seller accepts Murivest's recommended guide range.",
  },
  {
    title: "No commission payable to Murivest",
    description:
      "Seller confirms no commission is payable to Murivest.",
  },
];

const SELLING_FAQS = [
  {
    question: "What types of commercial property does Murivest accept?",
    answer:
      "Office, industrial, retail, hospitality, mixed-use and alternative commercial assets. The property must be tenanted and producing income. Vacant land and owner-occupied properties without income are not accepted.",
  },
  {
    question: "How is the guide price determined?",
    answer:
      "Murivest recommends a guide range based on comparable transaction evidence, income analysis and current market sentiment. The seller sets the confidential reserve price; the guide is published to buyers.",
  },
  {
    question: "What are the seller's costs?",
    answer:
      "The seller pays for their own legal fees, the legal pack preparation, and any marketing enhancements beyond the standard campaign. No commission is payable to Murivest.",
  },
  {
    question: "How long does the process take?",
    answer:
      "Typically 6–8 weeks from instruction to completion: 4 weeks of marketing, auction day, and 20 business days to completion.",
  },
  {
    question: "What if the property does not meet the selling test?",
    answer:
      "The form shows the failed criteria and their thresholds. Adjust the details (guide price, rent, declarations) and resubmit, or contact the team to discuss an exception or a private treaty route via Murivest's brokerage service.",
  },
];

export default function SellingPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Selling", url: "/selling" },
        ])}
      />
      <JsonLd data={faqPageJsonLd(SELLING_FAQS)} />

      {/* Hero */}
      <section className="py-16 md:py-24 border-b border-hairline">
        <Container>
          <SectionHeader
            numeral="—"
            eyebrow="Selling with Murivest"
            title="Sell your commercial property with certainty."
          />
          <p className="max-w-[42rem] text-[1.05rem] leading-[1.9] text-ink mt-6">
            Auction rewards income, title and a deadline. Murivest accepts commercial assets that meet a disciplined underwriting test, then runs a transparent competitive sale.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <ArrowLink href="#sell">Sell your property</ArrowLink>
            <ArrowLink href="#process" className="btn-secondary">
              See the process
            </ArrowLink>
          </div>
          <p className="mt-6 font-display text-[0.5rem] tracking-[0.22em] uppercase text-charcoal/70">
            By mandate only · Commercial property · Kenya & UK
          </p>
        </Container>
      </section>

      {/* Advantages */}
      <section id="advantages" className="border-t border-hairline py-14 md:py-20">
        <Container>
          <SectionHeader
            numeral="01"
            eyebrow="Why auction"
            title="Advantages of selling at auction."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {ADVANTAGES.map((adv, i) => (
              <article
                key={adv.title}
                className="border border-hairline p-6 hover:border-charcoal/40 transition-colors"
              >
                <span className="font-serif text-[3.5rem] font-light text-sand opacity-50 leading-none select-none block mb-3">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-serif text-xl font-light text-green mb-2">{adv.title}</h3>
                <p className="text-[0.95rem] leading-[1.8] text-ink">{adv.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Process */}
      <section id="process" className="border-t border-hairline py-14 md:py-20">
        <Container>
          <SectionHeader
            numeral="02"
            eyebrow="How it works"
            title="The selling process."
          />
          <div className="space-y-8">
            {PROCESS_STEPS.map((step) => (
              <article key={step.number} className="border-b border-hairline pb-8 last:border-0 last:pb-0">
                <div className="flex gap-6 md:gap-12">
                  <span className="font-serif text-[3.5rem] font-light text-sand opacity-50 leading-none flex-shrink-0 select-none pt-1">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="font-serif text-xl md:text-2xl font-light text-green mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[1rem] leading-[1.8] text-ink">{step.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Criteria */}
      <section id="criteria" className="border-t border-hairline py-14 md:py-20">
        <Container>
          <SectionHeader
            numeral="03"
            eyebrow="Selling test"
            title="The Murivest selling test."
          />
          <p className="max-w-[42rem] text-[1.05rem] leading-[1.9] text-ink mt-6">
            Every submission is checked against the same acquisition gates before a mandate conversation.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {CRITERIA.map((c, i) => (
              <article
                key={c.title}
                className="border border-hairline p-6 hover:border-charcoal/40 transition-colors"
              >
                <span className="font-serif text-[3.5rem] font-light text-sand opacity-50 leading-none select-none block mb-3">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-serif text-lg font-light text-green mb-2">{c.title}</h3>
                <p className="text-[0.95rem] leading-[1.8] text-ink">{c.description}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 grid md:grid-cols-2 gap-6 text-center">
            <div className="border border-hairline p-6">
              <p className="font-body text-[0.95rem] leading-relaxed text-ink">
                Gross yield = gross annual rent ÷ guide price × 100
              </p>
            </div>
            <div className="border border-hairline p-6">
              <p className="font-body text-[0.95rem] leading-relaxed text-ink">
                Payback = guide price ÷ gross annual rent
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Form */}
      <section id="sell" className="border-t border-hairline py-14 md:py-20">
        <Container>
          <SectionHeader
            numeral="04"
            eyebrow="Submission"
            title="Present the property."
          />
          <p className="max-w-[42rem] text-[1.05rem] leading-[1.9] text-ink mt-6">
            Complete every section. The form checks the commercial-income, yield, payback, guide-price and commission gates before submission.
          </p>
          <div className="mt-10">
            <SellingForm />
          </div>
        </Container>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-hairline py-14 md:py-20">
        <Container>
          <div className="max-w-[42rem]">
            <ArrowLink href="/contact" className="mb-4">
              Discuss a mandate
            </ArrowLink>
            <a
              href="mailto:office@murivest.com"
              className="block font-body text-[1rem] text-green hover:text-gold transition-colors"
            >
              office@murivest.com
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}