"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { computeReturn } from "@/lib/calculations";
import {
  formatCurrency,
  formatMultiple,
  formatPercent,
  formatYears,
} from "@/lib/format";
import { NumberField, OutputRow, SelectField, parseNumber } from "./fields";

type Variant = "page" | "widget" | "embedded";

interface Props {
  variant?: Variant;
  defaultPrice?: number;
  defaultNoi?: number;
  currency?: string;
}

export function ReturnCalculator({
  variant = "page",
  defaultPrice = 260_298,
  defaultNoi = 46_720,
  currency = "USD",
}: Props) {
  const [open, setOpen] = useState(variant === "page");
  const [price, setPrice] = useState(String(defaultPrice));
  const [acqPct, setAcqPct] = useState("0");
  const [noi, setNoi] = useState(String(defaultNoi));
  const [capex, setCapex] = useState("0");
  const [loanMode, setLoanMode] = useState("ltv");
  const [ltv, setLtv] = useState("60");
  const [loanAmount, setLoanAmount] = useState(
    String(Math.round(defaultPrice * 0.6))
  );
  const [rate, setRate] = useState("9");
  const [term, setTerm] = useState("10");
  const [hold, setHold] = useState("5");
  const [exitMode, setExitMode] = useState("cap");
  const [exitCap, setExitCap] = useState("7");
  const [exitPrice, setExitPrice] = useState(
    String(Math.round(defaultPrice * 1.1))
  );

  const r = useMemo(() => {
    const priceN = parseNumber(price);
    const acqN = parseNumber(acqPct);
    const noiN = parseNumber(noi);
    const capexN = parseNumber(capex);
    const loanN =
      loanMode === "ltv"
        ? (priceN * parseNumber(ltv)) / 100
        : parseNumber(loanAmount);
    return computeReturn({
      price: priceN,
      acquisitionCostsPct: acqN,
      noi: noiN,
      capexReserve: capexN,
      loanAmount: loanN,
      interestRatePct: parseNumber(rate),
      termYears: Math.max(1, parseNumber(term)),
      holdYears: Math.max(1, Math.round(parseNumber(hold))),
      exitCapPct: exitMode === "cap" ? parseNumber(exitCap) : null,
      exitPrice: exitMode === "price" ? parseNumber(exitPrice) : null,
    });
  }, [price, acqPct, noi, capex, loanMode, ltv, loanAmount, rate, term, hold, exitMode, exitCap, exitPrice]);

  const inputs = (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <NumberField id="rc-price" label="Purchase price" value={price} onChange={setPrice} min={0} step={1000} />
      <NumberField id="rc-acq" label="Acquisition costs" value={acqPct} onChange={setAcqPct} suffix="% of price" min={0} step={0.5} />
      <NumberField id="rc-noi" label="NOI (annual)" value={noi} onChange={setNoi} min={0} step={100} />
      <NumberField id="rc-capex" label="Capex reserve (annual)" value={capex} onChange={setCapex} min={0} step={100} />
      <SelectField
        id="rc-loanmode"
        label="Debt basis"
        value={loanMode}
        onChange={setLoanMode}
        options={[
          { value: "ltv", label: "Loan-to-value" },
          { value: "amount", label: "Loan amount" },
        ]}
      />
      {loanMode === "ltv" ? (
        <NumberField id="rc-ltv" label="Loan-to-value" value={ltv} onChange={setLtv} suffix="% LTV" min={0} max={100} step={5} />
      ) : (
        <NumberField id="rc-loanamt" label="Loan amount" value={loanAmount} onChange={setLoanAmount} min={0} step={1000} />
      )}
      <NumberField id="rc-rate" label="Interest rate" value={rate} onChange={setRate} suffix="% p.a." min={0} step={0.25} />
      <NumberField id="rc-term" label="Amortisation term" value={term} onChange={setTerm} suffix="years" min={1} max={40} step={1} />
      <NumberField id="rc-hold" label="Hold period" value={hold} onChange={setHold} suffix="years" min={1} max={40} step={1} />
      <SelectField
        id="rc-exitmode"
        label="Exit basis"
        value={exitMode}
        onChange={setExitMode}
        options={[
          { value: "cap", label: "Exit cap rate" },
          { value: "price", label: "Exit price" },
        ]}
      />
      {exitMode === "cap" ? (
        <NumberField id="rc-exitcap" label="Exit cap rate" value={exitCap} onChange={setExitCap} suffix="%" min={0.5} step={0.25} />
      ) : (
        <NumberField id="rc-exitprice" label="Exit price" value={exitPrice} onChange={setExitPrice} min={0} step={1000} />
      )}
    </div>
  );

  const outputs = (
    <dl className="mt-8">
      <OutputRow label="Net yield (unlevered)" value={formatPercent(r.netYieldUnlevered)} emphasis />
      <OutputRow label="Cash-on-cash" value={formatPercent(r.cashOnCash)} emphasis />
      <OutputRow label="Annual debt service" value={formatCurrency(r.annualDebtService, currency)} />
      <OutputRow label="DSCR" value={r.dscr != null ? formatMultiple(r.dscr) : "Not applicable (no debt)"} />
      <OutputRow label="Total profit over hold" value={r.totalProfit != null ? formatCurrency(r.totalProfit, currency) : "—"} />
      <OutputRow label="Equity multiple" value={formatMultiple(r.equityMultiple)} emphasis />
      <OutputRow
        label="Levered IRR"
        value={r.leveredIrr != null ? formatPercent(r.leveredIrr) : "Not computable"}
        emphasis
      />
      <OutputRow label="Payback" value={formatYears(r.payback)} />
    </dl>
  );

  const supporting = (
    <div className="mt-6 grid gap-px bg-hairline border border-hairline grid-cols-2 md:grid-cols-4">
      {[
        { label: "Equity invested", value: formatCurrency(r.equityInvested, currency) },
        { label: "Total cost incl. fees", value: formatCurrency(r.totalCost, currency) },
        {
          label: "Net annual cash flow",
          value: formatCurrency(r.annualNetCashFlow, currency),
        },
        {
          label: "Equity at exit",
          value: r.equityAtExit != null ? formatCurrency(r.equityAtExit, currency) : "—",
        },
      ].map(({ label, value }) => (
        <div key={label} className="bg-white p-4">
          <p className="text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-2">
            {label}
          </p>
          <p className="font-body text-[0.95rem] text-green">{value}</p>
        </div>
      ))}
    </div>
  );

  if (variant === "widget") {
    return (
      <div className="border border-hairline bg-white p-6">
        <p className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-4">
          Return calculator
        </p>
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full px-8 py-4 text-[0.65rem] tracking-[0.25em] uppercase font-display bg-green text-cream hover:bg-gold transition-colors"
          >
            Calculate return
          </button>
        ) : (
          <div>
            {inputs}
            {outputs}
            <p className="mt-4 text-[0.7rem] leading-[1.6] text-charcoal">
              All figures are computed in your browser only — nothing is
              stored. Add leverage, closing costs or capex to see how ROI
              diverges from net yield.
            </p>
            <Link
              href="/tools/return-calculator"
              className="mt-4 inline-block text-[0.6rem] tracking-[0.3em] uppercase text-gold hover:text-green transition-colors"
            >
              Open the full calculator →
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(variant === "page" && "border border-hairline bg-cream p-6 md:p-10")}>
      {inputs}
      {outputs}
      {supporting}
      <p className="mt-6 text-[0.75rem] leading-[1.7] text-charcoal">
        Net annual cash flow is stated after the capex reserve and debt
        service. Cash-on-cash follows the conventional formula — NOI less
        annual debt service, over equity invested. Where no acquisition costs
        are entered, net yield and cap rate are equal.
      </p>
    </div>
  );
}
