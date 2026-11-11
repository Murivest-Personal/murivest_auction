/* ============================================================
   Derived investment metrics — addendum §1.2 (verbatim formulas)
   All pure functions. No rounding here — format at render time.
   ============================================================ */

export const netYield = (noi: number, price: number) => (noi / price) * 100;

export const paybackYears = (price: number, noi: number) => price / noi;

export const grm = (price: number, grossAnnualRent: number) =>
  price / grossAnnualRent;

export const roi = (annualCashFlow: number, totalCashInvested: number) =>
  (annualCashFlow / totalCashInvested) * 100;

export const capRate = (noi: number, value: number) => (noi / value) * 100;

export const pricePerSf = (price: number, sqft: number) => price / sqft;

export const dscr = (noi: number, annualDebtService: number) =>
  noi / annualDebtService;

export function monthlyPayment(
  principal: number,
  annualRatePct: number,
  years: number
) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

/* ---------- Calculator helpers (addendum §2) ---------- */

/** Outstanding balance of an amortising loan after `months` payments. */
export function loanBalance(
  principal: number,
  annualRatePct: number,
  years: number,
  monthsElapsed: number
) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  const p = Math.min(monthsElapsed, n);
  if (n <= 0) return 0;
  if (r === 0) return principal * (1 - p / n);
  return (
    (principal * (Math.pow(1 + r, n) - Math.pow(1 + r, p))) /
    (Math.pow(1 + r, n) - 1)
  );
}

/** Interest-only monthly payment. */
export function interestOnlyPayment(
  principal: number,
  annualRatePct: number
) {
  return (principal * (annualRatePct / 100)) / 12;
}

/**
 * Levered IRR via Newton-Raphson on the cash-flow series, with a
 * bisection fallback if Newton fails to converge.
 * series[0] is the outflow at t=0; series[i] is the flow at year i.
 */
export function irr(series: number[]): number | null {
  const n = series.length;
  if (n < 2) return null;

  const npv = (r: number) => {
    let v = 0;
    for (let t = 0; t < n; t++) v += series[t] / Math.pow(1 + r, t);
    return v;
  };
  const dNpv = (r: number) => {
    let v = 0;
    for (let t = 1; t < n; t++)
      v -= (t * series[t]) / Math.pow(1 + r, t + 1);
    return v;
  };

  // Newton-Raphson
  let r = 0.1;
  for (let i = 0; i < 60; i++) {
    const f = npv(r);
    if (!Number.isFinite(f)) break;
    if (Math.abs(f) < 1e-9) return r * 100;
    const d = dNpv(r);
    if (!Number.isFinite(d) || Math.abs(d) < 1e-12) break;
    const next = r - f / d;
    if (!Number.isFinite(next) || next <= -0.9999) break;
    if (Math.abs(next - r) < 1e-10) return next * 100;
    r = next;
  }

  // Bisection fallback over [-0.99, 10]
  let lo = -0.99;
  let hi = 10;
  let fLo = npv(lo);
  let fHi = npv(hi);
  if (!Number.isFinite(fLo) || !Number.isFinite(fHi) || fLo * fHi > 0)
    return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fMid = npv(mid);
    if (Math.abs(fMid) < 1e-9) return mid * 100;
    if (fLo * fMid < 0) {
      hi = mid;
      fHi = fMid;
    } else {
      lo = mid;
      fLo = fMid;
    }
  }
  const rOut = (lo + hi) / 2;
  return Number.isFinite(rOut) ? rOut * 100 : null;
}

/** Results of the return calculator (addendum §2.2 output table). */
export interface ReturnResults {
  netYieldUnlevered: number | null;
  cashOnCash: number | null;
  annualDebtService: number;
  dscr: number | null;
  totalProfit: number | null;
  equityMultiple: number | null;
  leveredIrr: number | null;
  payback: number | null;
  /* supporting values */
  equityInvested: number;
  totalCost: number;
  annualNetCashFlow: number;
  exitValue: number | null;
  balanceAtExit: number;
  equityAtExit: number | null;
}

export interface ReturnInputs {
  price: number;
  acquisitionCostsPct: number;
  noi: number;
  capexReserve: number;
  loanAmount: number;
  interestRatePct: number;
  termYears: number;
  holdYears: number;
  exitCapPct: number | null;
  exitPrice: number | null;
}

export function computeReturn(inputs: ReturnInputs): ReturnResults {
  const {
    price,
    acquisitionCostsPct,
    noi,
    capexReserve,
    loanAmount,
    interestRatePct,
    termYears,
    holdYears,
    exitCapPct,
    exitPrice,
  } = inputs;

  const acquisitionCosts = (price * acquisitionCostsPct) / 100;
  const totalCost = price + acquisitionCosts;
  const loan = Math.min(Math.max(loanAmount, 0), totalCost);
  const equityInvested = totalCost - loan;

  const monthly = loan > 0 ? monthlyPayment(loan, interestRatePct, termYears) : 0;
  const annualDebtService = monthly * 12;

  const annualNetCashFlow = noi - capexReserve - annualDebtService;

  const netYieldUnlevered = totalCost > 0 ? (noi / totalCost) * 100 : null;
  const cashOnCash =
    equityInvested > 0 ? ((noi - annualDebtService) / equityInvested) * 100 : null;
  const dscrValue =
    annualDebtService > 0 ? noi / annualDebtService : null;

  const exitValue =
    exitPrice != null && exitPrice > 0
      ? exitPrice
      : exitCapPct != null && exitCapPct > 0
        ? noi / (exitCapPct / 100)
        : null;

  const balanceAtExit =
    loan > 0
      ? loanBalance(loan, interestRatePct, termYears, holdYears * 12)
      : 0;

  const equityAtExit =
    exitValue != null ? exitValue - balanceAtExit : null;

  const cumulativeCashFlow = annualNetCashFlow * holdYears;
  const totalProfit =
    equityAtExit != null
      ? cumulativeCashFlow + equityAtExit - equityInvested
      : null;
  const equityMultiple =
    equityAtExit != null && equityInvested > 0
      ? (cumulativeCashFlow + equityAtExit) / equityInvested
      : null;

  const series: number[] = [];
  if (equityInvested > 0 || loan === 0) {
    series.push(-equityInvested);
    for (let t = 1; t <= holdYears; t++) {
      let flow = annualNetCashFlow;
      if (t === holdYears && equityAtExit != null) flow += equityAtExit;
      series.push(flow);
    }
  }
  const leveredIrr = series.length >= 2 ? irr(series) : null;

  const payback =
    annualNetCashFlow > 0 && equityInvested > 0
      ? equityInvested / annualNetCashFlow
      : null;

  return {
    netYieldUnlevered,
    cashOnCash,
    annualDebtService,
    dscr: dscrValue,
    totalProfit,
    equityMultiple,
    leveredIrr,
    payback,
    equityInvested,
    totalCost,
    annualNetCashFlow,
    exitValue,
    balanceAtExit,
    equityAtExit,
  };
}
