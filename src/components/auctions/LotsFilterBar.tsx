import type { Market } from "@/lib/types";

/** Server-side filter bar — a plain GET form, so filtering works
    without client JavaScript (features spec §1, P0 filters). */

const ASSET_TYPES = [
  "Office",
  "Industrial",
  "Retail",
  "Hospitality",
  "Mixed-Use",
  "Land",
  "Alternative",
];

const STATUSES = [
  { value: "for-sale", label: "For Sale" },
  { value: "for-sale-by-auction", label: "For Sale by Auction" },
  { value: "under-offer", label: "Under Offer" },
  { value: "sold", label: "Sold" },
];

const KENYA_BANDS = [
  { value: "", label: "Any price" },
  { value: "0-50000000", label: "Under KES 50m" },
  { value: "50000000-150000000", label: "KES 50m – 150m" },
  { value: "150000000-0", label: "Over KES 150m" },
];

const UK_BANDS = [
  { value: "", label: "Any price" },
  { value: "0-1000000", label: "Under £1m" },
  { value: "1000000-2500000", label: "£1m – 2.5m" },
  { value: "2500000-0", label: "Over £2.5m" },
];

const ALL_BANDS = [
  { value: "", label: "Any price" },
  { value: "0-1000000", label: "Under 1m" },
  { value: "1000000-5000000", label: "1m – 5m" },
  { value: "5000000-0", label: "Over 5m" },
];

export function LotsFilterBar({
  market,
  regions,
  current,
  action,
  showSearch = true,
}: {
  market?: Market | "all";
  regions: string[];
  current: Record<string, string>;
  action: string;
  showSearch?: boolean;
}) {
  const bands =
    market === "kenya" ? KENYA_BANDS : market === "uk" ? UK_BANDS : ALL_BANDS;

  const selectClass =
    "w-full bg-transparent border-0 border-b border-sand focus:border-green outline-none py-3 font-body text-[0.85rem] text-green transition-colors appearance-none";
  const labelClass =
    "block text-[0.55rem] tracking-[0.28em] uppercase text-charcoal mb-2 font-body";

  return (
    <form
      method="get"
      action={action}
      className="sticky top-20 z-30 bg-cream border border-hairline p-6"
      aria-label="Filter lots"
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {showSearch ? (
          <div className="lg:col-span-1">
            <label htmlFor="filter-q" className={labelClass}>
              Search
            </label>
            <input
              id="filter-q"
              type="search"
              name="q"
              defaultValue={current.q ?? ""}
              placeholder="Lot, location, party"
              className={selectClass}
            />
          </div>
        ) : null}
        <div>
          <label htmlFor="filter-region" className={labelClass}>
            Region
          </label>
          <select
            id="filter-region"
            name="region"
            defaultValue={current.region ?? ""}
            className={selectClass}
          >
            <option value="">All regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-asset" className={labelClass}>
            Asset type
          </label>
          <select
            id="filter-asset"
            name="assetType"
            defaultValue={current.assetType ?? ""}
            className={selectClass}
          >
            <option value="">All asset types</option>
            {ASSET_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-status" className={labelClass}>
            Status
          </label>
          <select
            id="filter-status"
            name="status"
            defaultValue={current.status ?? ""}
            className={selectClass}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-price" className={labelClass}>
            Price
          </label>
          <select
            id="filter-price"
            name="price"
            defaultValue={current.price ?? ""}
            className={selectClass}
          >
            {bands.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-6">
        <button
          type="submit"
          className="inline-flex items-center justify-center px-8 py-3 text-[0.6rem] tracking-[0.22em] uppercase font-display bg-green text-cream hover:bg-gold transition-colors"
        >
          Apply filters
        </button>
        <a
          href={action}
          className="font-display text-[0.6rem] tracking-[0.22em] uppercase text-gold hover:text-green transition-colors"
        >
          Clear
        </a>
      </div>
    </form>
  );
}
