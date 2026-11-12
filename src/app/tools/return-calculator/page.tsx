import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { CalculatorShell } from "@/components/calculators/CalculatorShell";
import { ReturnCalculator } from "@/components/calculators/ReturnCalculator";
import { getWorkedExampleProperty } from "@/lib/content";
import type { Property } from "@/lib/types";
import {
  capRate,
  grm,
  netYield,
  paybackYears,
  pricePerSf,
  roi,
} from "@/lib/calculations";
import { formatCurrency, formatPercent } from "@/lib/format";
import { METRIC_DEFINITIONS } from "@/lib/legal";

export const metadata = buildMetadata({
  title: "Commercial Property Return Calculator | Murivest Group Ltd",
  description:
    "Calculate net yield, cash-on-cash return, DSCR and levered IRR for commercial property. Free institutional-grade calculator from Murivest Group Ltd.",
  path: "/tools/return-calculator",
});

export default async function ReturnCalculatorPage() {
  const property = await getWorkedExampleProperty();
  return (
    <CalculatorShell
      title="Commercial property return calculator"
      metaTitle="Commercial Property Return Calculator"
      description="Calculate net yield, cash-on-cash return, DSCR and levered IRR for commercial property. Free institutional-grade calculator from Murivest Group Ltd."
      path="/tools/return-calculator"
      whatItDoes="A commercial property return calculator is a tool that converts a lot's price, income and debt assumptions into the metrics institutional buyers use to compare opportunities — net yield, cash-on-cash return, DSCR, equity multiple and levered IRR. Enter the particulars from a listing, add your own leverage and cost assumptions, and read the total return picture across a hold period."
      formulas={[
        {
          label: "Net yield (unlevered)",
          formula:
            "Net operating income divided by total acquisition cost — the purchase price plus acquisition fees. Expressed as a percentage.",
        },
        {
          label: "Cash-on-cash",
          formula:
            "Net operating income minus annual debt service, divided by the equity invested. The annual cash return on the cash actually put in.",
        },
        {
          label: "Annual debt service",
          formula:
            "The monthly capital-plus-interest payment on the loan, multiplied by twelve.",
        },
        {
          label: "DSCR",
          formula:
            "Net operating income divided by annual debt service. Lenders typically look for at least 1.25x.",
        },
        {
          label: "Total profit",
          formula:
            "Cumulative net cash flow over the hold period, plus equity at exit, minus the equity invested. Net annual cash flow is stated after the capex reserve and debt service.",
        },
        {
          label: "Equity multiple",
          formula:
            "Total distributions — cumulative cash flow plus exit equity — divided by equity invested.",
        },
        {
          label: "Levered IRR",
          formula:
            "The annualised discount rate at which the cash-flow series — equity out at purchase, net cash flow each year, equity at exit — has zero present value. Solved by Newton-Raphson iteration.",
        },
        {
          label: "Payback",
          formula:
            "Equity invested divided by net annual cash flow. The number of years of income needed to recover the cash invested.",
        },
        {
          label: "Definitions",
          formula: METRIC_DEFINITIONS,
        },
      ]}
      workedExample={<WorkedExample property={property} />}
      hasWorkedExample={Boolean(property?.facts.price && property.facts.noi)}
      doesNot={[
        "It is not a valuation. Guide prices and particulars come from the selling party.",
        "It is not investment advice. It is arithmetic applied to assumptions you supply.",
        "It does not account for tax, depreciation, currency movements or transaction taxes such as stamp duty or VAT.",
        "It does not model income growth, lease events, voids or rent review outcomes — the NOI you enter is the NOI it uses.",
        "It does not verify the particulars behind a lot. Verify everything against the legal pack.",
      ]}
      faqs={[
        {
          question: "What is a good net yield for commercial property?",
          answer:
            "It depends on the market and the asset. Auction lots in Nairobi commonly price at double-digit net yields, while UK commercial investment lots have historically priced in mid-to-high single digits. A net yield only becomes meaningful when compared against the risk of the income and the exit assumptions.",
        },
        {
          question: "How is levered IRR different from cash-on-cash return?",
          answer:
            "Cash-on-cash measures the annual cash income against cash invested. IRR measures the annualised return across the whole hold, including the return of capital at exit. A lot can show a modest cash-on-cash return and a strong IRR when the exit equity is large, and vice versa.",
        },
        {
          question: "Why does my ROI differ from the net yield?",
          answer:
            "ROI diverges from net yield once leverage, closing costs or capex are entered. Net yield looks at the property's income against its total cost; cash-on-cash and IRR look at your cash position after debt. Enter a loan, fees or a capex reserve in the calculator and the two will separate.",
        },
        {
          question: "What DSCR do lenders require?",
          answer:
            "Commercial lenders commonly look for a debt service coverage ratio of at least 1.25x — twenty-five percent more net operating income than annual debt service. The underwriting screen on this website uses the same 1.25x floor.",
        },
        {
          question: "Is my data stored when I use this calculator?",
          answer:
            "No. All calculations run client-side in your browser. Nothing is transmitted, stored or logged.",
        },
      ]}
    >
      <ReturnCalculator variant="page" />
    </CalculatorShell>
  );
}

function WorkedExample({ property }: { property: Property | null }) {
  if (!property?.facts.price || !property.facts.noi) return null;
  const { price, noi, pricePerSf: ppsfSupplied, grossAnnualRent, buildingSf } =
    property.facts;
  const currency = property.facts.currency ?? "USD";

  const rows = [
    {
      metric: "Net yield",
      formula: `${noi.toLocaleString("en-GB")} ÷ ${price.toLocaleString("en-GB")} × 100`,
      result: formatPercent(netYield(noi, price)),
    },
    {
      metric: "Payback",
      formula: `${price.toLocaleString("en-GB")} ÷ ${noi.toLocaleString("en-GB")}`,
      result: `${paybackYears(price, noi).toFixed(2)} years`,
    },
    {
      metric: "ROI (all-cash, pre-fee)",
      formula: `${noi.toLocaleString("en-GB")} ÷ ${price.toLocaleString("en-GB")} × 100`,
      result: formatPercent(roi(noi, price)),
    },
    {
      metric: "GRM",
      formula: `${price.toLocaleString("en-GB")} ÷ gross annual rent`,
      result: grossAnnualRent
        ? `${grm(price, grossAnnualRent).toFixed(2)}x`
        : "Not computable — gross rent not in the facts; the calculator prompts for it",
    },
    {
      metric: "Price / SF",
      formula: `${price.toLocaleString("en-GB")} ÷ building SF`,
      result: buildingSf
        ? `${formatCurrency(pricePerSf(price, buildingSf), currency)} as supplied (implies ≈ ${buildingSf.toLocaleString("en-GB")} SF; ${ppsfSupplied ? formatCurrency(ppsfSupplied, currency) : "—"} stated in the facts)`
        : "—",
    },
    {
      metric: "Cap rate",
      formula: `${noi.toLocaleString("en-GB")} ÷ ${price.toLocaleString("en-GB")} × 100`,
      result: formatPercent(capRate(noi, price)),
    },
  ];

  return (
    <div>
      <p className="max-w-[42rem] text-[0.95rem] leading-[1.8] text-ink mb-6">
        The figures below are computed from the selling party&rsquo;s
        particulars for{" "}
        <Link
          href={`/auctions/${property.slug}`}
          className="text-gold hover:text-green transition-colors"
        >
          {property.title}
        </Link>{" "}
        ({property.referenceCode}, {property.location}) — price{" "}
        {formatCurrency(price, currency)} and net operating income{" "}
        {formatCurrency(noi, currency)} per annum.
      </p>
      <div className="max-w-[42rem] border border-hairline overflow-x-auto">
        <table className="w-full border-collapse font-body text-[0.85rem] text-green">
          <thead>
            <tr className="text-left bg-cream">
              <th className="p-4 border-b border-hairline text-[0.6rem] tracking-[0.2em] uppercase text-charcoal font-normal">
                Metric
              </th>
              <th className="p-4 border-b border-hairline text-[0.6rem] tracking-[0.2em] uppercase text-charcoal font-normal">
                Formula
              </th>
              <th className="p-4 border-b border-hairline text-right text-[0.6rem] tracking-[0.2em] uppercase text-charcoal font-normal">
                Result
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.metric} className="even:bg-cream/60">
                <td className="p-4 border-b border-hairline">{row.metric}</td>
                <td className="p-4 border-b border-hairline text-charcoal">
                  {row.formula}
                </td>
                <td className="p-4 border-b border-hairline text-right font-semibold">
                  {row.result}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6 max-w-[42rem] text-[0.85rem] leading-[1.8] text-charcoal">
        ROI diverges from net yield once leverage, closing costs, or capex are
        entered — the return calculator handles this.
      </p>
    </div>
  );
}
