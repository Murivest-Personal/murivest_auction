import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SellingForm } from "@/components/selling/SellingForm";
import { SITE } from "@/lib/brand";
import {
  CheckCircle2,
  Clock,
  Gavel,
  ShieldCheck,
  TrendingUp,
  Users,
  FileCheck,
  Hammer,
  KeyRound,
  Calculator,
  AlertCircle,
} from "lucide-react";

export const metadata = buildMetadata({
  title: "Sell a Property on the Auction Marketplace | Murivest",
  description:
    "Submit your commercial property for review on the Murivest auction marketplace. Reach qualified buyers across Kenya and the UK with a structured, transparent sale process.",
  path: "/selling",
});

const HERO_STATS = [
  { label: "Submission review", value: "1 business day" },
  { label: "Typical marketing", value: "4 weeks" },
  { label: "Markets", value: "Kenya & UK" },
  { label: "Buyer access", value: "Qualified accounts" },
];

const IN_PAGE_SECTIONS = [
  { id: "why-marketplace", label: "Why list" },
  { id: "comparison", label: "Auction vs private treaty" },
  { id: "process", label: "Process" },
  { id: "criteria", label: "Submission criteria" },
  { id: "faq", label: "FAQs" },
  { id: "submit", label: "Submit a property" },
];

const ADVANTAGES = [
  {
    icon: ShieldCheck,
    title: "Structured process",
    description:
      "Listings move through a defined review and preparation flow so buyers see clear terms, key facts and documentation status.",
  },
  {
    icon: CheckCircle2,
    title: "Defined timelines",
    description:
      "Auction-led sales operate to published timelines and conditions, giving sellers and buyers a clear path from marketing to outcome.",
  },
  {
    icon: Users,
    title: "Qualified demand",
    description:
      "Marketplace participation is account-based, helping connect opportunities with buyers who have completed relevant registration steps.",
  },
  {
    icon: Clock,
    title: "Focused exposure",
    description:
      "Present your property to an audience actively looking for auction opportunities across Kenya and the UK.",
  },
];

const COMPARISON: {
  dimension: string;
  auction: string;
  privateTreaty: string;
}[] = [
  {
    dimension: "Price discovery",
    auction: "Competitive bidding against published terms and guide information",
    privateTreaty: "Negotiation with individual buyers over time",
  },
  {
    dimension: "Timeline",
    auction: "Defined marketing and sale timetable where applicable",
    privateTreaty: "Can extend over months depending on demand and conditions",
  },
  {
    dimension: "Buyer readiness",
    auction: "Account-based participation and pre-sale preparation",
    privateTreaty: "Buyer readiness often confirmed later in the process",
  },
  {
    dimension: "Transparency",
    auction: "Lot information, conditions and process presented upfront",
    privateTreaty: "Terms may evolve through bilateral negotiation",
  },
  {
    dimension: "Outcome certainty",
    auction: "Governed by the applicable auction conditions and sale contract",
    privateTreaty: "Often subject to extended negotiation and contingencies",
  },
];

const PROCESS_STEPS = [
  {
    number: "01",
    icon: FileCheck,
    title: "Submit property details",
    description:
      "Provide asset information, commercial details, documents available and your preferred timeline using the submission form.",
  },
  {
    number: "02",
    icon: TrendingUp,
    title: "Review and suitability check",
    description:
      "The team reviews the submission against marketplace criteria, documentation readiness and sale suitability.",
  },
  {
    number: "03",
    icon: Gavel,
    title: "Agree sale approach",
    description:
      "If suitable, we discuss the route to market, guide/reserve considerations, required information and preparation steps.",
  },
  {
    number: "04",
    icon: Users,
    title: "Prepare and publish",
    description:
      "Approved lots are prepared with particulars, terms and disclosures appropriate to the chosen sale process before publication.",
  },
  {
    number: "05",
    icon: Hammer,
    title: "Market to buyers",
    description:
      "The lot is presented to marketplace users through catalog, market pages and relevant alerts, subject to verification and terms.",
  },
  {
    number: "06",
    icon: KeyRound,
    title: "Progress to outcome",
    description:
      "Buyer interest, bids or expressions of intent are handled according to the applicable lot terms and authorised sale channel.",
  },
];

const CRITERIA = [
  {
    title: "Commercial or investment asset",
    description:
      "Income-producing or clearly defined commercial property opportunities are best suited to the marketplace.",
    check: "Asset suitability",
  },
  {
    title: "Clear authority to sell",
    description:
      "The submitter must have authority, or be acting with authority, to present the property for review.",
    check: "Authority",
  },
  {
    title: "Accurate property information",
    description:
      "Key facts, tenure, income and known constraints should be disclosed as accurately as possible.",
    check: "Disclosure",
  },
  {
    title: "Documentation readiness",
    description:
      "Available title, lease, legal or supporting documents help accelerate review and buyer evaluation.",
    check: "Documents",
  },
  {
    title: "Realistic pricing expectations",
    description:
      "Guide and reserve expectations should reflect market conditions and the chosen sale route.",
    check: "Pricing",
  },
];

const SELLING_FAQS = [
  {
    question: "What types of property can be submitted?",
    answer:
      "The marketplace focuses on commercial and investment property opportunities across Kenya and the UK. Suitability depends on asset type, information provided, documentation readiness and the proposed sale route.",
  },
  {
    question: "Does submitting a property guarantee it will be listed?",
    answer:
      "No. Every submission is reviewed. Listing depends on suitability, completeness of information, authority to sell, and agreement on the appropriate marketplace or sale process.",
  },
  {
    question: "Who can submit a property?",
    answer:
      "Owners, authorised representatives, asset managers, receivers and professional advisers may submit properties, provided they have authority to do so and can supply accurate information.",
  },
  {
    question: "How quickly will I hear back?",
    answer:
      "Submissions are typically reviewed within one business day. Additional time may be required if documents or clarification are needed.",
  },
  {
    question: "Can I sell outside a live auction format?",
    answer:
      "Where appropriate, opportunities may be handled through different sale routes consistent with the lot terms and authorised channel. The team will discuss suitable options after review.",
  },
  {
    question: "What does it cost to submit?",
    answer:
      "Submitting a property for review does not by itself create a fee obligation. Any applicable fees, commissions or engagement terms are communicated clearly before publication or formal engagement.",
  },
];

export default function SellingPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Sell a property", url: "/selling" },
        ])}
      />
      <JsonLd data={faqPageJsonLd(SELLING_FAQS)} />

      <section className="border-b border-hairline bg-green text-cream">
        <div className="h-0.5 bg-gold" aria-hidden="true" />
        <Container className="py-16 md:py-24">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 font-display text-[0.5rem] tracking-[0.3em] uppercase text-[color:var(--mv-on-dark-faint)]"
          >
            <a href="/" className="hover:text-gold transition-colors">
              Murivest
            </a>
            <span className="mx-2 opacity-50">/</span>
            <span className="text-gold">Sell a property</span>
          </nav>

          <div className="max-w-[52rem]">
            <span className="block font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-4">
              Seller onboarding
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-light leading-[1.1] mb-6">
              List your property on the Murivest auction marketplace.
            </h1>
            <p className="text-[1.05rem] leading-[1.85] text-[color:var(--mv-on-dark)] max-w-[42rem] mb-8">
              Submit commercial property opportunities for review and reach
              qualified buyers across Kenya and the UK. Approved listings are
              prepared with clear particulars, timelines and terms appropriate
              to the sale process.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#submit"
                className="inline-flex items-center justify-center px-6 py-3 bg-cream text-green font-display text-[0.6rem] tracking-[0.22em] uppercase hover:bg-gold transition-colors"
              >
                Submit a property
              </a>
              <a
                href="#process"
                className="inline-flex items-center justify-center px-6 py-3 border border-cream/40 text-cream font-display text-[0.6rem] tracking-[0.22em] uppercase hover:bg-cream hover:text-green transition-colors"
              >
                See the process
              </a>
            </div>
            <p className="mt-6 font-display text-[0.5rem] tracking-[0.22em] uppercase text-[color:var(--mv-on-dark-faint)]">
              Curated marketplace · Commercial property · Kenya &amp; UK
            </p>
          </div>

          <ul className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-px bg-cream/15 border-t border-cream/15">
            {HERO_STATS.map((s) => (
              <li key={s.label} className="bg-green px-2 py-5 md:px-5">
                <span className="block font-display text-[0.45rem] tracking-[0.22em] uppercase text-[color:var(--mv-on-dark-faint)] mb-1.5">
                  {s.label}
                </span>
                <span className="block font-serif text-xl md:text-2xl font-light text-cream leading-tight">
                  {s.value}
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <nav
        aria-label="On this page"
        className="sticky top-16 lg:top-0 z-20 bg-cream/95 backdrop-blur border-b border-hairline"
      >
        <Container>
          <ul className="flex gap-0 overflow-x-auto font-display text-[0.55rem] tracking-[0.22em] uppercase">
            {IN_PAGE_SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="inline-block px-3 md:px-4 py-3.5 text-charcoal hover:text-gold border-b-2 border-transparent hover:border-gold transition-colors whitespace-nowrap"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </nav>

      <section id="why-marketplace" className="scroll-mt-32 border-t border-hairline py-14 md:py-20">
        <Container>
          <SectionHead
            eyebrow="Why list"
            title="A marketplace built for clear, qualified transactions."
            description="Present your property in a structured environment designed for serious buyers and transparent evaluation."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-hairline border border-hairline mt-10">
            {ADVANTAGES.map((adv, i) => {
              const Icon = adv.icon;
              return (
                <article key={adv.title} className="bg-white p-6 md:p-7">
                  <div className="flex items-start justify-between mb-5">
                    <span className="flex w-10 h-10 items-center justify-center border border-hairline text-green">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <span className="font-serif text-[2.5rem] font-light text-sand opacity-50 leading-none select-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-light text-green mb-2.5">
                    {adv.title}
                  </h3>
                  <p className="text-[0.9rem] leading-[1.8] text-ink">
                    {adv.description}
                  </p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section id="comparison" className="scroll-mt-32 border-t border-hairline py-14 md:py-20 bg-white">
        <Container>
          <SectionHead
            eyebrow="Comparison"
            title="Auction marketplace vs private treaty."
            description="The right route depends on the asset, timeline and objectives. These differences can help frame the discussion."
          />
          <div className="mt-10 border border-hairline overflow-x-auto">
            <table className="w-full min-w-[720px] text-[0.85rem]">
              <thead>
                <tr className="border-b border-hairline text-left">
                  <th className="p-4 font-display text-[0.5rem] tracking-[0.22em] uppercase text-charcoal bg-cream/40">Dimension</th>
                  <th className="p-4 font-display text-[0.5rem] tracking-[0.22em] uppercase text-gold bg-cream/40">Auction marketplace</th>
                  <th className="p-4 font-display text-[0.5rem] tracking-[0.22em] uppercase text-charcoal bg-cream/40">Private treaty</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.dimension} className="border-b border-hairline align-top last:border-0">
                    <td className="p-4 font-body text-[0.85rem] text-green font-medium">{row.dimension}</td>
                    <td className="p-4 text-ink">
                      <div className="flex gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-green flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{row.auction}</span>
                      </div>
                    </td>
                    <td className="p-4 text-charcoal">
                      <div className="flex gap-2.5">
                        <AlertCircle className="w-4 h-4 text-charcoal/40 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{row.privateTreaty}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      <section id="process" className="scroll-mt-32 border-t border-hairline py-14 md:py-20">
        <Container>
          <SectionHead
            eyebrow="How it works"
            title="From submission to marketplace outcome."
            description="A structured process designed to keep information clear for sellers, buyers and the operating team."
          />
          <ol className="mt-10 grid gap-px bg-hairline border border-hairline md:grid-cols-2">
            {PROCESS_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <li key={step.number} className="bg-white p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-green text-cream">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block font-display text-[0.5rem] tracking-[0.25em] uppercase text-gold mb-1">
                        Step {step.number}
                      </span>
                      <h3 className="font-serif text-lg md:text-xl font-light text-green leading-tight">
                        {step.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-[0.9rem] leading-[1.8] text-ink">
                    {step.description}
                  </p>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      <section id="criteria" className="scroll-mt-32 border-t border-hairline py-14 md:py-20 bg-white">
        <Container>
          <SectionHead
            eyebrow="Submission criteria"
            title="What we look for in a submission."
            description="Providing complete and accurate information helps the review team assess suitability quickly."
          />
          <ol className="mt-10 grid gap-px bg-hairline border border-hairline md:grid-cols-2 lg:grid-cols-3">
            {CRITERIA.map((c, i) => (
              <li key={c.title} className="bg-white p-6 md:p-7 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-green text-cream text-[0.7rem] font-display tracking-[0.1em]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 border border-green/30 text-green bg-green/5 text-[0.5rem] font-display tracking-[0.2em] uppercase whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                    {c.check}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-light text-green mb-2 leading-tight">{c.title}</h3>
                <p className="text-[0.88rem] leading-[1.75] text-ink flex-1">{c.description}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex items-start gap-3 border-l-2 border-gold bg-cream/40 p-4">
            <Calculator className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-[0.82rem] leading-[1.75] text-charcoal">
              Submission does not guarantee listing. The team may request
              additional information, suggest a different sale route, or decline
              opportunities that are not suitable for the marketplace at this time.
            </p>
          </div>
        </Container>
      </section>

      <section id="faq" className="scroll-mt-32 border-t border-hairline py-14 md:py-20">
        <Container>
          <SectionHead
            eyebrow="Frequently asked"
            title="Seller FAQs."
            description="Common questions before submitting a property for review."
          />
          <div className="mt-10 max-w-[52rem]">
            <dl className="border border-hairline bg-white divide-y divide-hairline">
              {SELLING_FAQS.map((f, i) => (
                <details key={f.question} className="group" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 hover:bg-cream/40 transition-colors [&::-webkit-details-marker]:hidden">
                    <dt className="font-serif text-[1.05rem] font-light text-green leading-snug">{f.question}</dt>
                    <span aria-hidden="true" className="shrink-0 mt-1 text-gold text-lg leading-none transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <dd className="px-5 pb-5 text-[0.9rem] leading-[1.8] text-ink">{f.answer}</dd>
                </details>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <section id="submit" className="scroll-mt-32 border-t border-hairline py-14 md:py-20 bg-white">
        <Container>
          <SectionHead
            eyebrow="Submission"
            title="Submit your property for review."
            description="Complete the form with as much detail as available. Accurate information helps the team assess suitability and next steps."
          />
          <div className="mt-10 grid lg:grid-cols-[1fr_280px] gap-8">
            <div><SellingForm /></div>
            <aside className="lg:sticky lg:top-28 self-start space-y-4">
              <div className="border border-hairline bg-cream/40 p-5">
                <span className="block font-display text-[0.5rem] tracking-[0.25em] uppercase text-gold mb-2">What happens next</span>
                <ol className="space-y-3 text-[0.82rem] leading-[1.7] text-ink">
                  <li className="flex gap-2.5"><span className="text-green font-serif text-[0.85rem] shrink-0">1.</span><span>Your submission is received and reviewed by the team.</span></li>
                  <li className="flex gap-2.5"><span className="text-green font-serif text-[0.85rem] shrink-0">2.</span><span>We may request clarification or supporting documents.</span></li>
                  <li className="flex gap-2.5"><span className="text-green font-serif text-[0.85rem] shrink-0">3.</span><span>If suitable, we discuss the appropriate sale route and listing preparation.</span></li>
                </ol>
              </div>
              <div className="border border-hairline bg-white p-5">
                <span className="block font-display text-[0.5rem] tracking-[0.25em] uppercase text-gold mb-2">Talk to the team</span>
                <p className="text-[0.82rem] leading-[1.7] text-ink mb-3">Prefer to discuss before submitting? Contact the team directly.</p>
                <a href="mailto:office@murivest.com?subject=Property%20submission%20enquiry" className="block font-body text-[0.88rem] text-green underline underline-offset-4 decoration-gold/60 hover:text-gold transition-colors break-words">office@murivest.com</a>
                <p className="mt-3 font-display text-[0.45rem] tracking-[0.22em] uppercase text-charcoal">Nairobi · London</p>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section className="border-t border-hairline py-14 md:py-20 bg-green text-cream">
        <Container>
          <div className="max-w-[52rem] mx-auto text-center">
            <span className="block font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-4">Questions?</span>
            <h2 className="font-serif text-3xl md:text-4xl font-light leading-[1.15] mb-4">Speak with the marketplace team.</h2>
            <p className="text-[0.95rem] leading-[1.8] text-[color:var(--mv-on-dark)] max-w-[42rem] mx-auto mb-8">
              Discuss suitability, documentation, timelines and the best route to present your property to qualified buyers.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a href="mailto:office@murivest.com?subject=Seller%20enquiry" className="inline-flex items-center justify-center px-6 py-3 bg-cream text-green font-display text-[0.6rem] tracking-[0.22em] uppercase hover:bg-gold transition-colors">Email the team</a>
              <a href="/contact" className="inline-flex items-center justify-center px-6 py-3 border border-cream/40 text-cream font-display text-[0.6rem] tracking-[0.22em] uppercase hover:bg-cream hover:text-green transition-colors">Contact page</a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function SectionHead({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="max-w-[52rem]">
      <span className="block font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-3">
        {eyebrow}
      </span>
      <h2 className="font-serif text-2xl md:text-3xl font-light text-green leading-tight mb-3">
        {title}
      </h2>
      {description ? (
        <p className="text-[0.95rem] leading-[1.8] text-ink">{description}</p>
      ) : null}
    </header>
  );
}
