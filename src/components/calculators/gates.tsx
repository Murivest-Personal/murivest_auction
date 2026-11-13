/* Underwriting gates — shared between the interactive client
   calculator and the read-only server-rendered gate summary on
   property pages (addendum §2.3). No client directive: pure
   logic plus a presentational component both sides can render. */

import { cn } from "@/lib/utils";
import { formatCurrency, formatMultiple, formatPercent, formatYears } from "@/lib/format";

export interface Gate {
  name: string;
  value: string;
  pass: boolean;
}

export function buildGates(opts: {
  totalCost: number;
  noi: number;
  price: number;
  grossRent: number | null;
  annualDebtService: number;
  targetYield: number;
  targetDscr: number;
  exitCap: number;
  holdYears: number;
  grmCeiling: number;
  currency: string;
}): Gate[] {
  const {
    totalCost,
    noi,
    price,
    grossRent,
    annualDebtService,
    targetYield,
    targetDscr,
    exitCap,
    holdYears,
    grmCeiling,
  } = opts;

  const netYield = totalCost > 0 ? (noi / totalCost) * 100 : 0;
  const capRate = price > 0 ? (noi / price) * 100 : 0;
  const payback = noi > 0 ? totalCost / noi : Infinity;
  const dscrValue = annualDebtService > 0 ? noi / annualDebtService : null;
  const grmValue = grossRent && grossRent > 0 ? price / grossRent : null;

  return [
    {
      name: `Net yield ≥ ${targetYield.toFixed(2)}%`,
      value: totalCost > 0 ? formatPercent(netYield) : "—",
      pass: netYield >= targetYield,
    },
    {
      name: `DSCR ≥ ${targetDscr.toFixed(2)}x`,
      value:
        dscrValue != null
          ? formatMultiple(dscrValue)
          : annualDebtService === 0
            ? "No debt assumed"
            : "—",
      pass: dscrValue != null ? dscrValue >= targetDscr : false,
    },
    {
      name: `Cap rate ≥ exit cap (${exitCap.toFixed(2)}%)`,
      value: price > 0 ? formatPercent(capRate) : "—",
      pass: capRate >= exitCap,
    },
    {
      name: `Payback ≤ hold period (${holdYears} yrs)`,
      value: Number.isFinite(payback) ? formatYears(payback) : "—",
      pass: payback <= holdYears,
    },
    {
      name: `GRM within market band (≤ ${grmCeiling.toFixed(1)}x)`,
      value:
        grmValue != null
          ? formatMultiple(grmValue)
          : "Not disclosed — gross rent not in particulars",
      pass: grmValue != null ? grmValue <= grmCeiling : false,
    },
  ];
}

export function GateRow({ gate }: { gate: Gate }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-hairline">
      <div>
        <p className="font-body text-[0.9rem] text-green">{gate.name}</p>
        <p className="font-body text-[0.8rem] text-charcoal mt-1">
          Computed: {gate.value}
        </p>
      </div>
      <span
        className={cn(
          "flex-shrink-0 inline-block px-3 py-1.5 text-[0.6rem] tracking-[0.2em] uppercase font-body",
          gate.pass ? "bg-gold text-cream" : "bg-charcoal text-cream"
        )}
      >
        {gate.pass ? "Cleared" : "Not cleared"}
      </span>
    </div>
  );
}

/** Unused currency import guard for future localisation of gate values. */
export const GATE_CURRENCY_HELPER = formatCurrency;
