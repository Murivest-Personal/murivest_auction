import { grm, netYield, paybackYears, roi } from "@/lib/calculations";
import { METRICS_FOOTNOTE, METRIC_DEFINITIONS } from "@/lib/legal";
import type { Property } from "@/lib/types";

/** The four-metric investment block — addendum §1.4. Rendered
    between the key facts table and the description. GRM shows
    “Not disclosed” when gross rent is absent. */
export function InvestmentMetrics({ property }: { property: Property }) {
  const { price, noi, grossAnnualRent } = property.facts;
  if (!price || !noi) return null;

  const metrics = [
    { label: "Net yield", value: `${netYield(noi, price).toFixed(2)}%` },
    { label: "Payback", value: `${paybackYears(price, noi).toFixed(2)} yrs` },
    { label: "ROI (all-cash)", value: `${roi(noi, price).toFixed(2)}%` },
    {
      label: "GRM",
      value: grossAnnualRent
        ? `${grm(price, grossAnnualRent).toFixed(2)}x`
        : "Not disclosed",
    },
  ];

  return (
    <section className="mt-10" aria-label="Investment metrics">
      <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
        Investment metrics
      </span>
      <dl className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#E8E3DA] border border-[#E8E3DA]">
        {metrics.map(({ label, value }) => (
          <div key={label} className="bg-white p-6">
            <dt className="text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-2 font-body">
              {label}
            </dt>
            <dd className="font-serif text-2xl text-green">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-[0.75rem] leading-[1.7] text-charcoal font-body">
        {METRICS_FOOTNOTE}
      </p>
      <p className="mt-2 text-[0.75rem] leading-[1.7] text-charcoal font-body max-w-[42rem]">
        {METRIC_DEFINITIONS}
      </p>
    </section>
  );
}
