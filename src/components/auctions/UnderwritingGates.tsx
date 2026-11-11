import { buildGates, GateRow } from "@/components/calculators/gates";
import { monthlyPayment } from "@/lib/calculations";
import type { Property } from "@/lib/types";

/** Read-only underwriting gate summary rendered on property detail
    pages, computed server-side from the facts object (addendum §2.3). */

const SCREEN = {
  targetYield: 8,
  targetDscr: 1.25,
  exitCap: 7,
  holdYears: 5,
  grmCeiling: 12.5,
  ltv: 60,
};

export function UnderwritingGates({ property }: { property: Property }) {
  const { price = 0, noi = 0, grossAnnualRent } = property.facts;
  if (!price || !noi) return null;

  const currency = property.facts.currency ?? "USD";
  const rate = property.market === "kenya" ? 9 : 6.5;
  const loan = (price * SCREEN.ltv) / 100;
  const annualDebtService = monthlyPayment(loan, rate, 10) * 12;

  const gates = buildGates({
    totalCost: price,
    noi,
    price,
    grossRent: grossAnnualRent ?? null,
    annualDebtService,
    targetYield: SCREEN.targetYield,
    targetDscr: SCREEN.targetDscr,
    exitCap: SCREEN.exitCap,
    holdYears: SCREEN.holdYears,
    grmCeiling: SCREEN.grmCeiling,
    currency,
  });

  return (
    <section className="border-t border-hairline pt-10 mt-16" id="underwriting-screen">
      <span className="block font-body text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
        Institutional screen
      </span>
      <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-4">
        Underwriting gate summary
      </h2>
      <p className="text-[0.9rem] leading-[1.8] text-ink mb-2 max-w-[42rem]">
        This lot screened against the default institutional parameters used by
        the full underwriting calculator. Cleared gates are shown in gold;
        gates that fail the screen are shown in charcoal.
      </p>
      <p className="text-[0.55rem] tracking-[0.2em] uppercase text-charcoal mb-6">
        Screen: {SCREEN.targetYield.toFixed(2)}% target net yield ·{" "}
        {SCREEN.targetDscr.toFixed(2)}x DSCR floor ({SCREEN.ltv}% LTV at{" "}
        {rate.toFixed(2)}% over 10 years) · {SCREEN.exitCap.toFixed(2)}% exit
        cap · {SCREEN.holdYears}-year hold · {SCREEN.grmCeiling.toFixed(1)}x
        GRM ceiling
      </p>
      <div className="border-t border-hairline max-w-[42rem]">
        {gates.map((gate) => (
          <GateRow key={gate.name} gate={gate} />
        ))}
      </div>
    </section>
  );
}
