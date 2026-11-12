"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  interestOnlyPayment,
  loanBalance,
  monthlyPayment,
} from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";
import { NumberField, OutputRow, SelectField, parseNumber } from "./fields";

type Variant = "page" | "widget";

interface Props {
  variant?: Variant;
  defaultPrincipal?: number;
  defaultRate?: number;
  defaultYears?: number;
  currency?: string;
}

interface YearRow {
  year: number;
  opening: number;
  interest: number;
  principal: number;
  closing: number;
}

export function LoanRepaymentCalculator({
  variant = "page",
  defaultPrincipal = 1_000_000,
  defaultRate = 8,
  defaultYears = 20,
  currency = "USD",
}: Props) {
  const [principal, setPrincipal] = useState(String(defaultPrincipal));
  const [rate, setRate] = useState(String(defaultRate));
  const [years, setYears] = useState(String(defaultYears));
  const [type, setType] = useState("repayment");
  const [showSchedule, setShowSchedule] = useState(false);

  const result = useMemo(() => {
    const p = parseNumber(principal);
    const r = parseNumber(rate);
    const y = Math.max(1, Math.round(parseNumber(years)));
    const months = y * 12;
    const interestOnly = type === "interest-only";

    const monthly = interestOnly
      ? interestOnlyPayment(p, r)
      : monthlyPayment(p, r, y);
    const totalRepaid = monthly * months;
    const totalInterest = totalRepaid - p;

    const rows: YearRow[] = [];
    let balance = p;
    for (let year = 1; year <= y; year++) {
      const opening = balance;
      let yearInterest = 0;
      let yearPrincipal = 0;
      for (let m = 0; m < 12; m++) {
        const interestPortion = interestOnly
          ? interestOnlyPayment(p, r)
          : (balance * r) / 100 / 12;
        const principalPortion = interestOnly ? 0 : monthly - interestPortion;
        yearInterest += interestPortion;
        yearPrincipal += principalPortion;
        balance = interestOnly ? balance : Math.max(0, balance - principalPortion);
      }
      rows.push({ year, opening, interest: yearInterest, principal: yearPrincipal, closing: balance });
    }

    const balanceAt = (year: number) =>
      year <= y ? loanBalance(p, r, y, year * 12) : null;

    return {
      monthly,
      totalRepaid,
      totalInterest,
      rows,
      balance5: interestOnly ? p : balanceAt(5),
      balance10: interestOnly ? p : balanceAt(10),
      balanceTerm: interestOnly ? p : 0,
      years: y,
      principal: p,
    };
  }, [principal, rate, years, type]);

  return (
    <div className={cn(variant === "widget" && "border border-hairline bg-cream p-6 md:p-8")}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <NumberField
          id="lrc-principal"
          label="Loan amount"
          value={principal}
          onChange={setPrincipal}
          min={0}
          step={1000}
        />
        <NumberField
          id="lrc-rate"
          label="Interest rate"
          value={rate}
          onChange={setRate}
          suffix="% p.a."
          min={0}
          step={0.1}
        />
        <NumberField
          id="lrc-years"
          label="Term"
          value={years}
          onChange={setYears}
          suffix="years"
          min={1}
          max={40}
          step={1}
        />
        <SelectField
          id="lrc-type"
          label="Repayment type"
          value={type}
          onChange={setType}
          options={[
            { value: "repayment", label: "Capital + interest" },
            { value: "interest-only", label: "Interest only" },
          ]}
        />
      </div>

      <dl className="mt-8">
        <OutputRow
          label="Monthly payment"
          value={formatCurrency(result.monthly, currency)}
          emphasis
        />
        <OutputRow
          label="Total repaid"
          value={formatCurrency(result.totalRepaid, currency)}
        />
        <OutputRow
          label="Total interest"
          value={formatCurrency(result.totalInterest, currency)}
        />
        <OutputRow
          label="Balance at year 5"
          value={
            result.balance5 != null ? formatCurrency(result.balance5, currency) : "—"
          }
        />
        <OutputRow
          label="Balance at year 10"
          value={
            result.balance10 != null ? formatCurrency(result.balance10, currency) : "—"
          }
        />
        <OutputRow
          label={`Balance at term (year ${result.years})`}
          value={formatCurrency(result.balanceTerm, currency)}
        />
      </dl>

      <button
        type="button"
        onClick={() => setShowSchedule(!showSchedule)}
        aria-expanded={showSchedule}
        className="mt-6 inline-flex items-center gap-3 font-display text-[0.65rem] tracking-[0.22em] uppercase text-green hover:text-gold transition-colors group"
      >
        {showSchedule ? "Hide amortisation schedule" : "Show amortisation schedule"}
        <span
          aria-hidden="true"
          className="w-7 h-7 border border-current flex items-center justify-center text-xs transition-colors group-hover:bg-green group-hover:text-cream"
        >
          {showSchedule ? "↑" : "↓"}
        </span>
      </button>

      {showSchedule ? (
        <div className="mt-6 max-h-96 overflow-y-auto border border-hairline">
          <table className="w-full border-collapse font-body text-[0.8rem] text-green">
            <thead className="sticky top-0 bg-cream">
              <tr className="text-left">
                <th className="p-3 border-b border-hairline text-[0.6rem] tracking-[0.2em] uppercase text-charcoal font-normal">
                  Year
                </th>
                <th className="p-3 border-b border-hairline text-right text-[0.6rem] tracking-[0.2em] uppercase text-charcoal font-normal">
                  Opening
                </th>
                <th className="p-3 border-b border-hairline text-right text-[0.6rem] tracking-[0.2em] uppercase text-charcoal font-normal">
                  Interest
                </th>
                <th className="p-3 border-b border-hairline text-right text-[0.6rem] tracking-[0.2em] uppercase text-charcoal font-normal">
                  Principal
                </th>
                <th className="p-3 border-b border-hairline text-right text-[0.6rem] tracking-[0.2em] uppercase text-charcoal font-normal">
                  Closing
                </th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row) => (
                <tr key={row.year} className="even:bg-cream/60">
                  <td className="p-3 border-b border-hairline">{row.year}</td>
                  <td className="p-3 border-b border-hairline text-right">
                    {formatCurrency(row.opening, currency)}
                  </td>
                  <td className="p-3 border-b border-hairline text-right">
                    {formatCurrency(row.interest, currency)}
                  </td>
                  <td className="p-3 border-b border-hairline text-right">
                    {formatCurrency(row.principal, currency)}
                  </td>
                  <td className="p-3 border-b border-hairline text-right">
                    {formatCurrency(row.closing, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
