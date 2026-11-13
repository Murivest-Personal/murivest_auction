import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { faqPageJsonLd, webApplicationJsonLd } from "@/lib/jsonld";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SITE } from "@/lib/brand";
import type { Faq } from "@/lib/types";

/** Shared layout for the three calculator pages (addendum §2.5):
    definition-first opening, the widget, plain-language formulas,
    a worked example, what the calculator does not do, FAQ, CTA. */
export function CalculatorShell({
  title,
  metaTitle,
  description,
  path,
  whatItDoes,
  children,
  formulas,
  workedExample,
  hasWorkedExample = true,
  doesNot,
  faqs,
}: {
  title: string;
  metaTitle: string;
  description: string;
  path: string;
  whatItDoes: string;
  children: React.ReactNode;
  formulas: { label: string; formula: string }[];
  workedExample: React.ReactNode;
  /** Hide the whole worked-example section when no published lot
      is available from Sanity. */
  hasWorkedExample?: boolean;
  doesNot: string[];
  faqs: Faq[];
}) {
  return (
    <>
      <JsonLd
        data={[
          webApplicationJsonLd(metaTitle, description, path),
          faqPageJsonLd(faqs),
        ]}
      />

      <section className="py-16 md:py-24 border-b border-hairline">
        <Container>
          <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
            Free institutional-grade calculators
          </span>
          <h1 className="font-serif font-light text-green leading-[1.15] text-[clamp(2rem,3.5vw,3.2rem)] mb-6 max-w-[44rem]">
            {title}
          </h1>
          <p className="max-w-[42rem] text-[1.1rem] leading-[1.9] text-ink">
            {whatItDoes}
          </p>
          <p className="mt-6 text-[0.55rem] tracking-[0.25em] uppercase text-charcoal">
            All calculations run in your browser — no data is stored, nothing
            is sent anywhere
          </p>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>{children}</Container>
      </section>

      <section className="border-t border-hairline py-14 md:py-20">
        <Container>
          <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-8">
            How each metric is calculated
          </h2>
          <dl className="max-w-[42rem]">
            {formulas.map((f) => (
              <div key={f.label} className="py-4 border-b border-hairline">
                <dt className="text-[0.6rem] tracking-[0.25em] uppercase text-gold mb-2 font-body">
                  {f.label}
                </dt>
                <dd className="text-[0.95rem] leading-[1.8] text-ink">
                  {f.formula}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {hasWorkedExample ? (
        <section className="border-t border-hairline py-14 md:py-20 bg-white">
          <Container>
            <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-8">
              Worked example from a live lot
            </h2>
            {workedExample}
          </Container>
        </section>
      ) : null}

      <section className="border-t border-hairline py-14 md:py-20">
        <Container>
          <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-8">
            What this calculator does not do
          </h2>
          <ul className="max-w-[42rem] space-y-3">
            {doesNot.map((item) => (
              <li key={item} className="flex gap-4 text-[0.95rem] leading-[1.8] text-ink">
                <span className="text-gold flex-shrink-0" aria-hidden="true">
                  —
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-t border-hairline py-14 md:py-20">
        <Container>
          <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-8">
            Frequently asked questions
          </h2>
          <div className="max-w-[42rem]">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group border-t border-hairline py-5 [&:last-of-type]:border-b"
              >
                <summary className="flex items-center justify-between gap-6 cursor-pointer list-none">
                  <span className="font-serif text-lg font-light text-green">
                    {faq.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex-shrink-0 w-7 h-7 border border-sand flex items-center justify-center text-xs text-green group-open:bg-green group-open:text-cream transition-colors"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 text-[0.95rem] leading-[1.8] text-ink max-w-[40rem]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-6">
            <ArrowLink href="/auctions">Submit a bid</ArrowLink>
            <a
              href={`mailto:${SITE.officeEmail}?subject=${encodeURIComponent(
                "Legal pack request"
              )}`}
              className="link-rule"
            >
              Request a legal pack
              <span className="arrow-box" aria-hidden="true">
                ↗
              </span>
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
