/* Currency, percent and date helpers. */

export function formatCurrency(
  value: number | null | undefined,
  currency: "USD" | "GBP" | "KES" | "EUR" | string = "USD",
  opts: { compact?: boolean } = {}
): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const symbol =
    currency === "GBP"
      ? "£"
      : currency === "KES"
      ? "KES "
      : currency === "EUR"
      ? "€"
      : currency === "USD"
      ? "$"
      : "";
  if (opts.compact && Math.abs(value) >= 1_000_000) {
    return `${symbol}${trimZeros((value / 1_000_000).toFixed(2))}m`;
  }
  if (opts.compact && Math.abs(value) >= 10_000) {
    return `${symbol}${trimZeros((value / 1_000).toFixed(0))}k`;
  }
  return `${symbol}${new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 0,
  }).format(Math.round(value))}`;
}

function trimZeros(s: string) {
  return s.replace(/\.?0+$/, "");
}

export function formatPercent(value: number | null | undefined, dp = 2): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${value.toFixed(dp)}%`;
}

export function formatMultiple(value: number | null | undefined, dp = 2): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${value.toFixed(dp)}x`;
}

export function formatYears(value: number | null | undefined, dp = 2): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${value.toFixed(dp)} yrs`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(
    value
  );
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatMonthYear(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/** ISO date (YYYY-MM-DD) without timezone drift. */
export function isoDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function marketLabel(market: string): string {
  if (market === "kenya") return "Kenya";
  if (market === "uk") return "United Kingdom";
  return market;
}

export function statusLabel(status: string): string {
  switch (status) {
    case "for-sale":
      return "For Sale";
    case "for-sale-by-auction":
      return "For Sale by Auction";
    case "under-offer":
      return "Under Offer";
    case "sold":
      return "Sold";
    default:
      return status;
  }
}
