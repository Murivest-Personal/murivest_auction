import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { CalculatorShell } from "@/components/calculators/CalculatorShell";
import { UnderwritingCalculator } from "@/components/calculators/UnderwritingCalculator";
import { buildGates } from "@/components/calculators/gates";
import { monthlyPayment } from "@/lib/calculations";
import { getWorkedExampleProperty } from "@/lib/content";
import type { Property } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/format";

export const metadata = buildMetadata({
  title: "Commercial Property Underwriting Calculator | Murivest Group Ltd",
  description:
    "Screen commercial property lots against net yield, DSCR, cap rate, payback and GRM gates. Free institutional-grade underwriting calculator from Murivest Group Ltd.",
  path: "/tools/underwriting-calculator",
});

export default async function UnderwritingCalculatorPage() {
  const property = await getWorkedExampleProperty();
  return (
    <CalculatorShell
      title="Commercial property underwriting calculator"
      metaTitle="Commercial Property Underwriting Calculator"
      description="Screen commercial property lots against net yield, DSCR, cap rate, payback and GRM gates. Free institutional-grade underwriting calculator from Murivest Group Ltd."
      path="/tools/underwriting-calculator"
      whatItDoes="A commercial property underwriting calculator is the institutional screen: it tests a lot's particulars against a set of pass-or-fail gates — net yield against target, DSCR against a coverage floor, cap rate against the exit assumption, payback against the hold period, and the gross rent multiplier against a market band — so a buyer can decide quickly whether a lot is worth a legal pack review."
      formulas={[
        {
          label: "Net yield gate",
          formula:
            "Net operating income divided by total acquisition cost (price plus fees), tested against your target net yield.",
        },
        {
          label: "DSCR gate",
          formula:
            "Net operating income divided by annual debt service, derived from the loan-to-value, interest rate and amortisation term you enter. Tested against your target coverage ratio, typically 1.25x.",
        },
        {
          label: "Cap rate gate",
          formula:
            "Net operating income divided by value, tested against your exit cap rate. Where acquisition costs are zero, the cap rate and the net yield are equal.",
        },
        {
          label: "Payback gate",
          formula:
            "Total acquisition cost divided by net operating income — the number of years of income needed to recover the total cost — tested against your hold period.",
        },
        {
          label: "GRM gate",
          formula:
            "Purchase price divided by gross annual rent, tested against a market ceiling. Where gross rent is not disclosed by the selling party, GRM is shown as not disclosed and the gate is not cleared.",
        },
        {
          label: "Badges",
          formula:
            "Cleared gates are shown in gold. Gates that fail the screen are shown in charcoal. The calculator never uses red or green traffic lights.",
        },
      ]}
      workedExample={<WorkedExample property={property} />}
      hasWorkedExample={Boolean(property?.facts.price && property.facts.noi)}
      doesNot={[
        "It is not a valuation and not advice. It is a screen applied to particulars you supply.",
        "It does not verify the particulars behind a lot. Verify everything against the legal pack.",
        "It does not account for tax, transaction costs after acquisition, currency movements or lease events.",
        "It does not decide for you. A lot that clears every gate can still be the wrong purchase, and a lot that fails one gate can still be the right one at a different price.",
      ]}
      faqs={[
        {
          question: "What is underwriting in commercial property?",
          answer:
            "Underwriting is the discipline of testing an investment's stated income and price against a buyer's requirements before capital is committed. In its simplest form it is a set of gates: does the yield clear the target, does the income cover the debt, does the price imply a sensible exit.",
        },
        {
          question: "What DSCR should I screen at?",
          answer:
            "Commercial lenders commonly require at least 1.25x — twenty-five percent more net operating income than annual debt service. That is the default floor in this calculator and in the underwriting gate summary on every Murivest listing.",
        },
        {
          question: "Why is the GRM gate not cleared when gross rent is missing?",
          answer:
            "The gross rent multiplier uses gross annual rent, not net operating income. Where the selling party has not disclosed gross rent, GRM cannot be computed, so the gate reports not disclosed rather than guessing.",
        },
        {
          question: "How do I choose a market GRM ceiling?",
          answer:
            "The ceiling should reflect the gross multiples at which comparable assets trade in the same market and asset class. Conservative screens use a tighter ceiling; opportunistic screens tolerate a higher one. The default of 12.5x is a starting point, not a rule.",
        },
        {
          question: "Is my data stored when I use this calculator?",
          answer:
            "No. All calculations run client-side in your browser. Nothing is transmitted, stored or logged.",
        },
      ]}
    >
      <UnderwritingCalculator />
    </CalculatorShell>
  );
}

function WorkedExample({ property }: { property: Property | null }) {
  if (!property?.facts.price || !property.facts.noi) return null;
  const { price, noi, grossAnnualRent } = property.facts;
  const currency = property.facts.currency ?? "USD";
  const rate = property.market === "kenya" ? 9 : 6.5;
  const loan = price * 0.6;
  const annualDebtService = monthlyPayment(loan, rate, 10) * 12;

  const gates = buildGates({
    totalCost: price,
    noi,
    price,
    grossRent: grossAnnualRent ?? null,
    annualDebtService,
    targetYield: 8,
    targetDscr: 1.25,
    exitCap: 7,
    holdYears: 5,
    grmCeiling: 12.5,
    currency,
  });

  return (
    <div>
      <p className="max-w-[42rem] text-[0.95rem] leading-[1.8] text-ink mb-6">
        The screen below is applied to the selling party&rsquo;s particulars
        for{" "}
        <Link
          href={`/auctions/${property.slug}`}
          className="text-gold hover:text-green transition-colors"
        >
          {property.title}
        </Link>{" "}
        ({property.referenceCode}) — price {formatCurrency(price, currency)},
        net operating income {formatCurrency(noi, currency)} per annum, screened
        at an 8.00% target net yield, a 1.25x DSCR floor on 60% LTV at{" "}
        {rate.toFixed(2)}% over ten years, a 7.00% exit cap, a five-year hold
        and a 12.5x GRM ceiling.
      </p>
      <div className="max-w-[42rem] border-t border-hairline">
        {gates.map((gate) => (
          <div
            key={gate.name}
            className="flex items-center justify-between gap-4 py-4 border-b border-hairline"
          >
            <div>
              <p className="font-body text-[0.9rem] text-green">{gate.name}</p>
              <p className="font-body text-[0.8rem] text-charcoal mt-1">
                Computed: {gate.value}
              </p>
            </div>
            <span
              className={`flex-shrink-0 inline-block px-3 py-1.5 text-[0.6rem] tracking-[0.2em] uppercase font-body ${
                gate.pass ? "bg-gold text-cream" : "bg-charcoal text-cream"
              }`}
            >
              {gate.pass ? "Cleared" : "Not cleared"}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-6 max-w-[42rem] text-[0.85rem] leading-[1.8] text-charcoal">
        The lot&rsquo;s net yield of {formatPercent((noi / price) * 100)}{" "}
        clears the screen with substantial headroom; the GRM gate is not
        cleared because the selling party has not disclosed gross annual rent.
        Open the full calculator above and add your own assumptions.
      </p>
    </div>
  );
}
