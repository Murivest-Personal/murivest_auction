"use client";

import { useMemo, useState } from "react";
import { monthlyPayment } from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";
import { NumberField, OutputRow, parseNumber } from "./fields";
import { buildGates, GateRow } from "./gates";

interface Props {
  defaultPrice?: number;
  defaultNoi?: number;
  defaultGrossRent?: number;
  currency?: string;
}

export function UnderwritingCalculator({
  defaultPrice = 260_298,
  defaultNoi = 46_720,
  defaultGrossRent,
  currency = "USD",
}: Props) {
  const [price, setPrice] = useState(String(defaultPrice));
  const [acqPct, setAcqPct] = useState("0");
  const [noi, setNoi] = useState(String(defaultNoi));
  const [grossRent, setGrossRent] = useState(
    defaultGrossRent != null ? String(defaultGrossRent) : ""
  );
  const [targetYield, setTargetYield] = useState("8");
  const [targetDscr, setTargetDscr] = useState("1.25");
  const [hold, setHold] = useState("5");
  const [exitCap, setExitCap] = useState("7");
  const [grmCeiling, setGrmCeiling] = useState("12.5");
  const [ltv, setLtv] = useState("60");
  const [rate, setRate] = useState("9");
  const [term, setTerm] = useState("10");

  const { gates, loanMonthly, annualDebtService } = useMemo(() => {
    const priceN = parseNumber(price);
    const acqN = parseNumber(acqPct);
    const noiN = parseNumber(noi);
    const grossRentN = grossRent ? parseNumber(grossRent) : null;
    const totalCost = priceN + (priceN * acqN) / 100;
    const loan = (priceN * parseNumber(ltv)) / 100;
    const monthly =
      loan > 0
        ? monthlyPayment(loan, parseNumber(rate), Math.max(1, parseNumber(term)))
        : 0;
    const annual = monthly * 12;

    const built = buildGates({
      totalCost,
      noi: noiN,
      price: priceN,
      grossRent: grossRentN,
      annualDebtService: annual,
      targetYield: parseNumber(targetYield),
      targetDscr: parseNumber(targetDscr),
      exitCap: parseNumber(exitCap),
      holdYears: Math.max(1, Math.round(parseNumber(hold))),
      grmCeiling: parseNumber(grmCeiling),
      currency,
    });
    return { gates: built, loanMonthly: monthly, annualDebtService: annual };
  }, [
    price,
    acqPct,
    noi,
    grossRent,
    ltv,
    rate,
    term,
    targetYield,
    targetDscr,
    exitCap,
    hold,
    grmCeiling,
    currency,
  ]);

  return (
    <div className="border border-hairline bg-cream p-6 md:p-10">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <NumberField id="uw-price" label="Purchase price" value={price} onChange={setPrice} min={0} step={1000} />
        <NumberField id="uw-acq" label="Acquisition costs" value={acqPct} onChange={setAcqPct} suffix="% of price" min={0} step={0.5} />
        <NumberField id="uw-noi" label="NOI (annual)" value={noi} onChange={setNoi} min={0} step={100} />
        <NumberField id="uw-grossrent" label="Gross annual rent" value={grossRent} onChange={setGrossRent} placeholder="Not disclosed" min={0} step={100} />
        <NumberField id="uw-target" label="Target net yield" value={targetYield} onChange={setTargetYield} suffix="%" min={0} step={0.25} />
        <NumberField id="uw-dscr" label="Target DSCR" value={targetDscr} onChange={setTargetDscr} suffix="x" min={1} step={0.05} />
        <NumberField id="uw-hold" label="Hold period" value={hold} onChange={setHold} suffix="years" min={1} max={40} step={1} />
        <NumberField id="uw-exitcap" label="Exit cap rate" value={exitCap} onChange={setExitCap} suffix="%" min={0.5} step={0.25} />
        <NumberField id="uw-grm" label="Market GRM ceiling" value={grmCeiling} onChange={setGrmCeiling} suffix="x" min={0.5} step={0.5} />
      </div>

      {/* Debt assumptions — embedded loan repayment summary (addendum §2.4) */}
      <div className="mt-10">
        <p className="font-body text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
          Debt assumptions
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          <NumberField id="uw-ltv" label="Loan-to-value" value={ltv} onChange={setLtv} suffix="% LTV" min={0} max={100} step={5} />
          <NumberField id="uw-rate" label="Interest rate" value={rate} onChange={setRate} suffix="% p.a." min={0} step={0.25} />
          <NumberField id="uw-term" label="Amortisation term" value={term} onChange={setTerm} suffix="years" min={1} max={40} step={1} />
        </div>
        <dl className="mt-4">
          <OutputRow label="Monthly payment (debt)" value={formatCurrency(loanMonthly, currency)} />
          <OutputRow label="Annual debt service" value={formatCurrency(annualDebtService, currency)} />
        </dl>
      </div>

      <div className="mt-10">
        <p className="font-body text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-2">
          Underwriting gates
        </p>
        <div className="border-t border-hairline">
          {gates.map((gate) => (
            <GateRow key={gate.name} gate={gate} />
          ))}
        </div>
        <p className="mt-4 text-[0.75rem] leading-[1.7] text-charcoal">
          Cleared gates are shown in gold; gates that fail the screen are shown
          in charcoal. A screen is a discipline, not a recommendation — a lot
          that clears every gate can still be the wrong purchase.
        </p>
      </div>
    </div>
  );
}
