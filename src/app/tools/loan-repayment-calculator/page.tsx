import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { CalculatorShell } from "@/components/calculators/CalculatorShell";
import { LoanRepaymentCalculator } from "@/components/calculators/LoanRepaymentCalculator";
import { getPropertyBySlug, WORKED_EXAMPLE_SLUG } from "@/lib/content";
import { monthlyPayment } from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";

export const metadata = buildMetadata({
  title: "Commercial Property Loan Repayment Calculator | Murivest Group Ltd",
  description:
    "Calculate monthly payments, total interest and amortisation schedules for commercial property loans. Free institutional-grade calculator from Murivest Group Ltd.",
  path: "/tools/loan-repayment-calculator",
});

export default function LoanRepaymentCalculatorPage() {
  return (
    <CalculatorShell
      title="Commercial property loan repayment calculator"
      metaTitle="Commercial Property Loan Repayment Calculator"
      description="Calculate monthly payments, total interest and amortisation schedules for commercial property loans. Free institutional-grade calculator from Murivest Group Ltd."
      path="/tools/loan-repayment-calculator"
      whatItDoes="A commercial property loan repayment calculator converts a loan amount, an interest rate and a term into the numbers that govern a bidder's financing timetable — the monthly payment, the total interest, the total repaid, and the outstanding balance at year five, year ten and at term. For auction buyers, the balance at the expected exit date is the figure that feeds the return calculator."
      formulas={[
        {
          label: "Monthly payment (capital + interest)",
          formula:
            "The standard annuity formula: principal multiplied by the monthly rate, divided by one minus (1 plus the monthly rate) to the power of minus the number of months. Where the rate is zero, the payment is simply the principal divided by the number of months.",
        },
        {
          label: "Monthly payment (interest only)",
          formula:
            "Principal multiplied by the annual rate, divided by twelve. The balance does not reduce.",
        },
        {
          label: "Total repaid",
          formula: "The monthly payment multiplied by the term in months.",
        },
        {
          label: "Total interest",
          formula: "Total repaid minus the principal.",
        },
        {
          label: "Balance at a given year",
          formula:
            "The outstanding principal after that number of monthly payments on an amortising loan. For an interest-only loan the balance remains the principal throughout.",
        },
      ]}
      workedExample={<WorkedExample />}
      doesNot={[
        "It is not a loan offer. Actual terms come from a lender after underwriting.",
        "It does not account for arrangement fees, exit fees, interest rate changes, or hedging.",
        "It does not model drawdown stages for development facilities.",
        "It does not verify the particulars behind a lot. Verify everything against the legal pack.",
      ]}
      faqs={[
        {
          question: "How do lenders size a commercial auction loan?",
          answer:
            "Most lenders size against two constraints: a maximum loan-to-value — commonly 60 to 70 percent for stabilized commercial property — and a minimum debt service coverage ratio, commonly 1.25x. The smaller of the two loans that satisfy both tests is the loan you are likely to be offered.",
        },
        {
          question: "Should I use interest-only or capital-plus-interest?",
          answer:
            "Interest-only preserves cash flow during a hold but leaves the balance outstanding at exit, which increases refinancing and sale risk. Capital-plus-interest amortises the debt and builds equity, but consumes cash flow. Institutional buyers commonly model both.",
        },
        {
          question: "Why does the balance at exit matter at auction?",
          answer:
            "Because completion is not conditional on financing. The balance outstanding at your expected exit date, combined with the exit value, determines the equity you recover — and therefore the IRR and equity multiple in the return calculator.",
        },
        {
          question: "What happens if I cannot complete after the hammer falls?",
          answer:
            "In the UK a buyer who fails to complete forfeits the 10% deposit and may be liable for the seller's losses. In Kenya failure to pay the 75% balance within 90 days can result in forfeiture of the 25% deposit and resale of the property. Model the funding timetable before bidding, not after.",
        },
        {
          question: "Is my data stored when I use this calculator?",
          answer:
            "No. All calculations run client-side in your browser. Nothing is transmitted, stored or logged.",
        },
      ]}
    >
      <LoanRepaymentCalculator variant="page" />
    </CalculatorShell>
  );
}

async function WorkedExample() {
  const property = await getPropertyBySlug(WORKED_EXAMPLE_SLUG);
  if (!property?.facts.price) return null;
  const { price } = property.facts;
  const currency = property.facts.currency ?? "USD";
  const rate = property.market === "kenya" ? 13 : 6.5;
  const loan = Math.round(price * 0.65);
  const years = 10;
  const monthly = monthlyPayment(loan, rate, years);
  const totalRepaid = monthly * years * 12;
  const totalInterest = totalRepaid - loan;

  const rows = [
    { label: "Loan amount (65% of price)", value: formatCurrency(loan, currency) },
    { label: "Interest rate", value: `${rate.toFixed(2)}% p.a.` },
    { label: "Term", value: `${years} years` },
    { label: "Monthly payment", value: formatCurrency(monthly, currency) },
    { label: "Total repaid", value: formatCurrency(totalRepaid, currency) },
    { label: "Total interest", value: formatCurrency(totalInterest, currency) },
  ];

  return (
    <div>
      <p className="max-w-[42rem] text-[0.95rem] leading-[1.8] text-ink mb-6">
        The figures below model a {rate.toFixed(2)}% ten-year amortising loan
        at 65% loan-to-value against the guide price of{" "}
        <Link
          href={`/auctions/${property.slug}`}
          className="text-gold hover:text-green transition-colors"
        >
          {property.title}
        </Link>{" "}
        ({property.referenceCode}, {property.location}).
      </p>
      <dl className="max-w-[42rem] border border-hairline">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-baseline justify-between gap-4 p-4 ${
              i < rows.length - 1 ? "border-b border-hairline" : ""
            }`}
          >
            <dt className="text-[0.6rem] tracking-[0.25em] uppercase text-charcoal font-body">
              {row.label}
            </dt>
            <dd
              className={
                i === 3
                  ? "font-serif text-2xl text-green"
                  : "font-body text-[0.95rem] text-green"
              }
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 max-w-[42rem] text-[0.85rem] leading-[1.8] text-charcoal">
        The interest rate used here is illustrative for the lot&rsquo;s
        market. Actual terms come from a lender after underwriting.
      </p>
    </div>
  );
}
