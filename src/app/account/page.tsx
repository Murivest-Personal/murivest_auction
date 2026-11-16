import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getBuyerById, getBuyerBids, getSavedLots } from "@/lib/supabase/records";
import { getBuyerSessionId } from "@/lib/buyer/session";
import { classificationDef } from "@/lib/buyer/qualification";
import {
  BUYER_TYPES,
  ID_TYPES,
  ACQUISITION_TIMELINES,
  FUNDING_PREFERENCES,
  POF_TYPES,
} from "@/lib/buyer/constants";
import { ClassificationLadder } from "@/components/buyers/ClassificationLadder";
import { AccountSettings } from "@/components/buyers/AccountSettings";
import { SignOutButton } from "@/components/buyers/SignOutButton";
import { Container } from "@/components/ui/Container";
import { formatCurrency, formatDate, marketLabel } from "@/lib/format";
import { getPropertyBySlug } from "@/lib/content";
import { ButtonLink } from "@/components/ui/Buttons";

export const metadata: Metadata = {
  title: "Your account | Murivest Auctions",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type OptionList = readonly { value: string; label: string }[];
function labelOf(list: OptionList, value: string | null) {
  if (!value) return "—";
  return list.find((i) => i.value === value)?.label ?? value;
}

function maskId(v: string | null | undefined) {
  if (!v) return "—";
  const s = String(v);
  if (s.length <= 4) return s;
  return "•".repeat(s.length - 4) + s.slice(-4);
}

const BID_STATUS: Record<string, { label: string; note: string }> = {
  submitted: {
    label: "Submitted",
    note: "Received and queued for review by the Murivest deal team.",
  },
  acknowledged: {
    label: "Acknowledged",
    note: "Reviewed by the team. Your bid is with the deal handler.",
  },
  routed: {
    label: "Routed",
    note: "Your bid has been routed to the authorised sale channel.",
  },
  superseded: {
    label: "Superseded",
    note: "You have submitted a newer bid on this lot.",
  },
  declined: {
    label: "Declined",
    note: "The bid was not taken forward. See the team note for details.",
  },
  withdrawn: {
    label: "Withdrawn",
    note: "The bid was withdrawn at your request.",
  },
};

const ACTIVE_STATUSES = ["submitted", "acknowledged", "routed"];

const TABS: { key: string; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "bids", label: "Bids" },
  { key: "watchlist", label: "Watchlist" },
  { key: "documents", label: "Documents" },
  { key: "activity", label: "Activity" },
  { key: "settings", label: "Settings" },
  { key: "profile", label: "Profile" },
  { key: "support", label: "Support" },
];

const BID_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "submitted", label: "Submitted" },
  { key: "acknowledged", label: "Acknowledged" },
  { key: "routed", label: "Routed" },
  { key: "declined", label: "Declined" },
  { key: "withdrawn", label: "Withdrawn" },
  { key: "superseded", label: "Superseded" },
];

function statusBadgeClass(status: string) {
  switch (status) {
    case "routed":
      return "border-green/40 text-green bg-green/5";
    case "acknowledged":
      return "border-gold/50 text-gold bg-gold/5";
    case "submitted":
      return "border-hairline text-charcoal bg-cream/40";
    case "declined":
    case "withdrawn":
      return "border-hairline text-charcoal/70 bg-cream/30";
    case "superseded":
      return "border-hairline text-charcoal/60 bg-cream/20";
    default:
      return "border-hairline text-charcoal";
  }
}

function StatCard({
  label,
  value,
  hint,
  price,
}: {
  label: string;
  value: string;
  hint?: string;
  price?: boolean;
}) {
  return (
    <div className="border border-hairline bg-white p-5">
      <span className="block font-display text-[0.5rem] tracking-[0.25em] uppercase text-gold mb-2">
        {label}
      </span>
      <span className={`block font-serif text-2xl text-green leading-tight ${price ? "price" : ""}`}>
        {value}
      </span>
      {hint ? (
        <span className="block text-[0.75rem] text-charcoal mt-1">{hint}</span>
      ) : null}
    </div>
  );
}

function TabNav({ current }: { current: string }) {
  return (
    <nav
      aria-label="Account sections"
      className="sticky top-16 lg:top-0 z-20 bg-cream/95 backdrop-blur border-b border-hairline"
    >
      <ul
        className="flex gap-1 overflow-x-auto font-display text-[0.6rem] tracking-[0.2em] uppercase"
        role="tablist"
      >
        {TABS.map((t) => (
          <li key={t.key} role="presentation">
            <Link
              href={`/account?tab=${t.key}`}
              aria-current={current === t.key ? "page" : undefined}
              className={`inline-block px-4 py-4 border-b-2 transition-colors whitespace-nowrap ${
                current === t.key
                  ? "text-gold border-gold"
                  : "text-charcoal border-transparent hover:text-gold"
              }`}
            >
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function EmptyPanel({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="border border-hairline bg-white p-6 md:p-8">
      <p className="font-serif text-lg text-green mb-2">{title}</p>
      <p className="text-[0.85rem] leading-[1.8] text-ink mb-4">{body}</p>
      {cta ? (
        <ButtonLink href={cta.href} variant="secondary">
          {cta.label}
        </ButtonLink>
      ) : null}
    </div>
  );
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string | string[];
    status?: string | string[];
  }>;
}) {
  const buyerId = await getBuyerSessionId();
  if (!buyerId) redirect("/sign-in");

  const buyer = await getBuyerById(buyerId);
  if (!buyer) redirect("/sign-in");

  const [bids, savedLots] = await Promise.all([
    getBuyerBids(buyerId),
    getSavedLots(buyerId),
  ]);

  const sp = await searchParams;
  const tab = typeof sp.tab === "string" ? sp.tab : "overview";
  const statusFilter = typeof sp.status === "string" ? sp.status : "all";

  const def = classificationDef(buyer.classification);

  const owners: { name: string; share: number }[] = buyer.beneficialOwners ?? [];
  const assetClasses: string[] = buyer.assetClasses ?? [];

  const activeBids = bids.filter((b) => ACTIVE_STATUSES.includes(b.status));
  const routedBids = bids.filter((b) => b.status === "routed");

  const exposureByCurrency = new Map<string, number>();
  for (const b of activeBids) {
    exposureByCurrency.set(
      b.bidCurrency,
      (exposureByCurrency.get(b.bidCurrency) ?? 0) + b.bidAmount
    );
  }
  const exposureLabel =
    exposureByCurrency.size === 0
      ? "—"
      : [...exposureByCurrency.entries()]
          .map(([cur, amt]) => formatCurrency(amt, cur))
          .join(" · ");

  const savedList = savedLots.filter((s) => s.kind === "save");
  const likedList = savedLots.filter((s) => s.kind === "like");

  /* Resolve saved / liked lots to titles and links. */
  const savedSlugs = [...new Set(savedLots.map((s) => s.propertySlug))];
  const lotsBySlug = new Map<string, { title: string; market: string } | null>();
  await Promise.all(
    savedSlugs.slice(0, 30).map(async (slug) => {
      try {
        const p = await getPropertyBySlug(slug);
        lotsBySlug.set(slug, p ? { title: p.title, market: p.market } : null);
      } catch {
        lotsBySlug.set(slug, null);
      }
    })
  );

  const savedRow = (slug: string) => {
    const lot = lotsBySlug.get(slug);
    return (
      <Link
        key={slug}
        href={`/auctions/${slug}`}
        className="block p-4 hover:bg-cream transition-colors"
      >
        <span className="font-body text-[0.9rem] text-green">
          {lot ? lot.title : slug}
        </span>
        {lot ? (
          <span className="block font-display text-[0.55rem] tracking-[0.2em] uppercase text-charcoal mt-1">
            {marketLabel(lot.market)} market · View lot →
          </span>
        ) : (
          <span className="block font-display text-[0.55rem] tracking-[0.2em] uppercase text-charcoal mt-1">
            Lot no longer published
          </span>
        )}
      </Link>
    );
  };

  const filteredBids =
    statusFilter === "all"
      ? bids
      : statusFilter === "active"
      ? activeBids
      : bids.filter((b) => b.status === statusFilter);

  type ActivityEvent = { date: Date; title: string; detail: string };
  const activity: ActivityEvent[] = [
    {
      date: buyer.createdAt,
      title: "Account registered",
      detail: `Registered as ${labelOf(BUYER_TYPES, buyer.buyerType)} · ${buyer.countryOfResidence}`,
    },
    ...bids.map((b) => ({
      date: b.createdAt,
      title: `Bid ${BID_STATUS[b.status]?.label ?? b.status} — ${b.propertyTitle}`,
      detail: `${formatCurrency(b.bidAmount, b.bidCurrency)} · ref ${b.reference}`,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const documentsOnFile = [
    Boolean(buyer.idNumber),
    Boolean(buyer.pofType),
    Boolean(buyer.purchasingEntityName || true),
    owners.length > 0,
  ].filter(Boolean).length;

  /* ---------------- Tab content ---------------- */

  const overviewTab = (
    <div className="space-y-12">
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active bids"
          value={String(activeBids.length)}
          hint={`${bids.length} submitted in total`}
        />
        <StatCard
          label="Active bid value"
          value={exposureLabel}
          hint="Across open bids"
          price
        />
        <StatCard
          label="Watchlist"
          value={String(savedLots.length)}
          hint={`${savedList.length} saved · ${likedList.length} liked`}
        />
        <StatCard
          label="Documents on file"
          value={`${documentsOnFile} / 4`}
          hint="KYC, POF, entity, owners"
        />
      </section>

      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8">
        <section className="border border-hairline bg-white border-l-2 border-l-gold p-6 md:p-8">
          <span className="block font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-3">
            Verification status
          </span>
          <p className="font-serif text-2xl font-light text-green mb-3">
            {def.label}
          </p>
          <p className="text-[0.9rem] leading-[1.8] text-ink mb-3">
            {def.description}
          </p>
          <p className="text-[0.8rem] leading-[1.7] text-charcoal">
            <span className="font-display text-[0.55rem] tracking-[0.25em] uppercase">
              Murivest action ·{" "}
            </span>
            {def.action}
          </p>
          {buyer.classificationNote ? (
            <p className="text-[0.8rem] leading-[1.7] text-charcoal mt-3 border-t border-hairline pt-3">
              <span className="font-display text-[0.55rem] tracking-[0.25em] uppercase">
                Team note ·{" "}
              </span>
              {buyer.classificationNote}
            </p>
          ) : null}
          <div className="mt-5">
            <Link
              href="/account?tab=documents"
              className="font-display text-[0.6rem] tracking-[0.25em] uppercase text-green border-b border-green/40 hover:text-gold hover:border-gold transition-colors pb-1"
            >
              Review compliance file →
            </Link>
          </div>
        </section>

        <section className="border border-hairline bg-white p-6 md:p-8">
          <div className="flex items-baseline justify-between mb-4">
            <span className="block font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold">
              Recent activity
            </span>
            <Link
              href="/account?tab=activity"
              className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-charcoal hover:text-gold transition-colors"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-hairline">
            {activity.slice(0, 5).map((e, i) => (
              <li key={i} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <span className="mt-1.5 block w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-body text-[0.85rem] text-green leading-snug">
                    {e.title}
                  </p>
                  <p className="text-[0.72rem] text-charcoal mt-0.5 truncate">
                    {e.detail}
                  </p>
                </div>
                <span className="text-[0.7rem] text-charcoal whitespace-nowrap">
                  {formatDate(e.date.toISOString())}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="border border-hairline bg-white p-6 md:p-8">
          <div className="flex items-baseline justify-between mb-4">
            <span className="block font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold">
              Open bids
            </span>
            <Link
              href="/account?tab=bids&status=active"
              className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-charcoal hover:text-gold transition-colors"
            >
              View all
            </Link>
          </div>
          {activeBids.length === 0 ? (
            <p className="text-[0.85rem] leading-[1.8] text-charcoal">
              No open bids. Browse lots and submit a bid — bidding is
              exclusive to registered accounts.
            </p>
          ) : (
            <ul className="divide-y divide-hairline">
              {activeBids.slice(0, 4).map((b) => {
                const s = BID_STATUS[b.status] ?? { label: b.status, note: "" };
                return (
                  <li key={b.id} className="flex items-baseline justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <Link
                        href={`/auctions/${b.propertySlug}`}
                        className="font-body text-[0.9rem] text-green hover:text-gold transition-colors truncate block"
                      >
                        {b.propertyTitle}
                      </Link>
                      <span className="block text-[0.72rem] text-charcoal mt-0.5">
                        {s.label} · ref {b.reference}
                      </span>
                    </div>
                    <span className="font-serif text-[0.95rem] text-green whitespace-nowrap price">
                      {formatCurrency(b.bidAmount, b.bidCurrency)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="border border-hairline bg-white p-6 md:p-8">
          <div className="flex items-baseline justify-between mb-4">
            <span className="block font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold">
              Watchlist
            </span>
            <Link
              href="/account?tab=watchlist"
              className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-charcoal hover:text-gold transition-colors"
            >
              View all
            </Link>
          </div>
          {savedLots.length === 0 ? (
            <p className="text-[0.85rem] leading-[1.8] text-charcoal">
              Save or like lots from any property page — they will appear here
              on your account.
            </p>
          ) : (
            <ul className="divide-y divide-hairline">
              {savedLots.slice(0, 4).map((s) => (
                <li key={`${s.kind}-${s.propertySlug}`} className="py-3 first:pt-0 last:pb-0">
                  {savedRow(s.propertySlug)}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="border border-hairline bg-cream/40 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-2">
            Need to update your file?
          </p>
          <p className="text-[0.85rem] leading-[1.8] text-ink">
            Changes to KYC, proof of funds or purchasing entity are handled by
            the Murivest deal team. Reach them for statements, updates or
            escalation.
          </p>
        </div>
        <Link
          href="mailto:office@murivest.com?subject=Account%20update%20request"
          className="shrink-0 inline-flex items-center gap-2 font-display text-[0.6rem] tracking-[0.25em] uppercase text-green border-b border-green/40 hover:text-gold hover:border-gold transition-colors pb-1 self-start md:self-auto"
        >
          Contact deal team →
        </Link>
      </section>
    </div>
  );

  const bidsTab = (
    <section id="bids" className="scroll-mt-24">
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-2xl font-light text-green">Bids</h2>
          <p className="text-[0.85rem] text-charcoal mt-1">
            {bids.length} total · {activeBids.length} active ·{" "}
            {routedBids.length} routed
          </p>
        </div>
        <ButtonLink href="/auctions" variant="secondary">
          Browse auction lots
        </ButtonLink>
      </header>

      <div className="flex flex-wrap gap-2 mb-6">
        {BID_FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/account?tab=bids&status=${f.key}`}
            className={`px-3 py-1.5 border text-[0.55rem] font-display tracking-[0.2em] uppercase transition-colors ${
              statusFilter === f.key
                ? "border-gold text-gold bg-gold/5"
                : "border-hairline text-charcoal hover:text-green hover:border-green/40"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {filteredBids.length === 0 ? (
        <EmptyPanel
          title="No bids in this view"
          body="There are no bids matching the selected filter. Try a different view or submit a new bid from any live lot."
          cta={{ href: "/auctions", label: "Browse auction lots" }}
        />
      ) : (
        <div className="border border-hairline bg-white overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-hairline text-left">
                <th className="font-display text-[0.5rem] tracking-[0.25em] uppercase text-gold p-4">
                  Lot
                </th>
                <th className="font-display text-[0.5rem] tracking-[0.25em] uppercase text-gold p-4 text-right">
                  Amount
                </th>
                <th className="font-display text-[0.5rem] tracking-[0.25em] uppercase text-gold p-4">
                  Status
                </th>
                <th className="font-display text-[0.5rem] tracking-[0.25em] uppercase text-gold p-4 text-right">
                  Submitted
                </th>
                <th className="font-display text-[0.5rem] tracking-[0.25em] uppercase text-gold p-4">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredBids.map((b) => {
                const s = BID_STATUS[b.status] ?? { label: b.status, note: "" };
                return (
                  <tr key={b.id} className="hover:bg-cream/40 transition-colors">
                    <td className="p-4 align-top">
                      <Link
                        href={`/auctions/${b.propertySlug}`}
                        className="font-body text-[0.9rem] text-green hover:text-gold transition-colors"
                      >
                        {b.propertyTitle}
                      </Link>
                      <span className="block text-[0.72rem] leading-[1.5] text-charcoal mt-1 max-w-md">
                        {b.statusNote ?? s.note}
                      </span>
                    </td>
                    <td className="p-4 align-top text-right font-serif text-[0.95rem] text-green whitespace-nowrap price">
                      {formatCurrency(b.bidAmount, b.bidCurrency)}
                    </td>
                    <td className="p-4 align-top">
                      <span
                        className={`inline-block px-2 py-0.5 border text-[0.5rem] font-display tracking-[0.2em] uppercase ${statusBadgeClass(
                          b.status
                        )}`}
                      >
                        {s.label}
                      </span>
                    </td>
                    <td className="p-4 align-top text-right text-[0.75rem] text-charcoal whitespace-nowrap">
                      {formatDate(b.createdAt.toISOString())}
                    </td>
                    <td className="p-4 align-top text-[0.7rem] text-charcoal font-mono">
                      {b.reference}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  const watchlistTab = (
    <section id="watchlist" className="scroll-mt-24">
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-2xl font-light text-green">Watchlist</h2>
          <p className="text-[0.85rem] text-charcoal mt-1">
            {savedList.length} saved · {likedList.length} liked
          </p>
        </div>
        <ButtonLink href="/auctions" variant="secondary">
          Browse auction lots
        </ButtonLink>
      </header>

      {savedList.length === 0 && likedList.length === 0 ? (
        <EmptyPanel
          title="Your watchlist is empty"
          body="Save or like lots from any property page — they are stored here on your account for quick reference."
          cta={{ href: "/auctions", label: "Browse auction lots" }}
        />
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {savedList.length > 0 ? (
            <div>
              <p className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-charcoal mb-3">
                Saved ({savedList.length})
              </p>
              <ul className="border border-hairline divide-y divide-hairline bg-white">
                {savedList.map((s) => savedRow(s.propertySlug))}
              </ul>
            </div>
          ) : null}
          {likedList.length > 0 ? (
            <div>
              <p className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-charcoal mb-3">
                Liked ({likedList.length})
              </p>
              <ul className="border border-hairline divide-y divide-hairline bg-white">
                {likedList.map((s) => savedRow(s.propertySlug))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );

  const documentsTab = (
    <section id="documents" className="scroll-mt-24">
      <header className="mb-6">
        <h2 className="font-serif text-2xl font-light text-green">Documents &amp; compliance</h2>
        <p className="text-[0.85rem] text-charcoal mt-1">
          Files held in the private document store. Not all documents are
          displayed on the website — proof-of-funds files and identity
          documents are masked here for security.
        </p>
      </header>

      <div className="border border-hairline bg-white overflow-x-auto mb-8">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-hairline text-left">
              <th className="font-display text-[0.5rem] tracking-[0.25em] uppercase text-gold p-4">
                Document
              </th>
              <th className="font-display text-[0.5rem] tracking-[0.25em] uppercase text-gold p-4">
                Details on file
              </th>
              <th className="font-display text-[0.5rem] tracking-[0.25em] uppercase text-gold p-4 text-right">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            <tr className="hover:bg-cream/40 transition-colors">
              <td className="p-4 font-body text-[0.9rem] text-green align-top">
                Identity verification
              </td>
              <td className="p-4 text-[0.8rem] text-charcoal align-top">
                {labelOf(ID_TYPES, buyer.idType)} · {maskId(buyer.idNumber)}
              </td>
              <td className="p-4 text-right align-top">
                <span className="inline-block px-2 py-0.5 border border-green/40 text-green bg-green/5 text-[0.5rem] font-display tracking-[0.2em] uppercase">
                  On file
                </span>
              </td>
            </tr>
            <tr className="hover:bg-cream/40 transition-colors">
              <td className="p-4 font-body text-[0.9rem] text-green align-top">
                Proof of funds
              </td>
              <td className="p-4 text-[0.8rem] text-charcoal align-top">
                {buyer.pofType
                  ? `${labelOf(POF_TYPES, buyer.pofType)}${
                      buyer.lenderName ? ` · ${buyer.lenderName}` : ""
                    }${buyer.pofFileName ? " · file uploaded" : ""}`
                  : "To be provided on request"}
              </td>
              <td className="p-4 text-right align-top">
                <span
                  className={`inline-block px-2 py-0.5 border text-[0.5rem] font-display tracking-[0.2em] uppercase ${
                    buyer.pofType
                      ? "border-green/40 text-green bg-green/5"
                      : "border-gold/50 text-gold bg-gold/5"
                  }`}
                >
                  {buyer.pofType ? "On file" : "Pending"}
                </span>
              </td>
            </tr>
            <tr className="hover:bg-cream/40 transition-colors">
              <td className="p-4 font-body text-[0.9rem] text-green align-top">
                Purchasing entity
              </td>
              <td className="p-4 text-[0.8rem] text-charcoal align-top">
                {buyer.purchasingEntityName
                  ? `${buyer.purchasingEntityName}${
                      buyer.purchasingEntityJurisdiction
                        ? ` (${buyer.purchasingEntityJurisdiction})`
                        : ""
                    }`
                  : "Individual purchase"}
              </td>
              <td className="p-4 text-right align-top">
                <span className="inline-block px-2 py-0.5 border border-green/40 text-green bg-green/5 text-[0.5rem] font-display tracking-[0.2em] uppercase">
                  On file
                </span>
              </td>
            </tr>
            <tr className="hover:bg-cream/40 transition-colors">
              <td className="p-4 font-body text-[0.9rem] text-green align-top">
                Beneficial ownership
              </td>
              <td className="p-4 text-[0.8rem] text-charcoal align-top">
                {owners.length > 0
                  ? `${owners.length} declared owner${owners.length > 1 ? "s" : ""}`
                  : "No beneficial owners declared"}
              </td>
              <td className="p-4 text-right align-top">
                <span
                  className={`inline-block px-2 py-0.5 border text-[0.5rem] font-display tracking-[0.2em] uppercase ${
                    owners.length > 0
                      ? "border-green/40 text-green bg-green/5"
                      : "border-hairline text-charcoal bg-cream/30"
                  }`}
                >
                  {owners.length > 0 ? "On file" : "N/A"}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-hairline bg-white p-6">
          <p className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-3">
            Statements
          </p>
          <p className="text-[0.85rem] leading-[1.8] text-ink mb-4">
            Monthly account statements are issued on request and include bid
            history, watchlist movements, and any compliance notes for the
            period.
          </p>
          <a
            href="mailto:office@murivest.com?subject=Statement%20request"
            className="font-display text-[0.6rem] tracking-[0.25em] uppercase text-green border-b border-green/40 hover:text-gold hover:border-gold transition-colors pb-1"
          >
            Request statement →
          </a>
        </div>
        <div className="border border-hairline bg-white p-6">
          <p className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-3">
            Document updates
          </p>
          <p className="text-[0.85rem] leading-[1.8] text-ink mb-4">
            To add or replace KYC, proof-of-funds or entity documents, contact
            the deal team. Uploads are processed manually to maintain the
            integrity of the private document store.
          </p>
          <a
            href="mailto:office@murivest.com?subject=Document%20update"
            className="font-display text-[0.6rem] tracking-[0.25em] uppercase text-green border-b border-green/40 hover:text-gold hover:border-gold transition-colors pb-1"
          >
            Submit documents →
          </a>
        </div>
      </div>
    </section>
  );

  const activityTab = (
    <section id="activity" className="scroll-mt-24">
      <header className="mb-6">
        <h2 className="font-serif text-2xl font-light text-green">Activity</h2>
        <p className="text-[0.85rem] text-charcoal mt-1">
          Account events, registrations and bid submissions in reverse
          chronological order.
        </p>
      </header>
      <ul className="border border-hairline bg-white divide-y divide-hairline">
        {activity.map((e, i) => (
          <li key={i} className="flex gap-4 p-4">
            <div className="pt-1.5">
              <span className="block w-2 h-2 rounded-full bg-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body text-[0.9rem] text-green leading-snug">
                {e.title}
              </p>
              <p className="text-[0.75rem] text-charcoal mt-1">{e.detail}</p>
            </div>
            <div className="text-[0.7rem] text-charcoal whitespace-nowrap">
              {formatDate(e.date.toISOString())}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );

  const settingsTab = (
    <section id="settings" className="scroll-mt-24 space-y-10">
      <header>
        <h2 className="font-serif text-2xl font-light text-green">Settings</h2>
        <p className="text-[0.85rem] text-charcoal mt-1">
          Notification preferences and account security.
        </p>
      </header>

      <div>
        <p className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-3">
          Notifications
        </p>
        <p className="text-[0.85rem] leading-[1.8] text-charcoal mb-5">
          Choose what your account is notified about — new auction lots,
          off-market opportunities and updates on the bids you submit.
        </p>
        <AccountSettings
          initial={{
            notifyNewLots: buyer.notifyNewLots,
            notifyOffMarket: buyer.notifyOffMarket,
            notifyBidUpdates: buyer.notifyBidUpdates,
          }}
        />
      </div>

      <div className="border-t border-hairline pt-8">
        <p className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-3">
          Security
        </p>
        <ul className="border border-hairline bg-white divide-y divide-hairline">
          <li className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-body text-[0.9rem] text-green">Password</p>
              <p className="text-[0.75rem] text-charcoal mt-0.5">
                Rotated through a secure email link.
              </p>
            </div>
            <a
              href="mailto:office@murivest.com?subject=Password%20change%20request"
              className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-green border-b border-green/40 hover:text-gold hover:border-gold transition-colors pb-1"
            >
              Request change
            </a>
          </li>
          <li className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-body text-[0.9rem] text-green">
                Two-factor authentication
              </p>
              <p className="text-[0.75rem] text-charcoal mt-0.5">
                Adds an extra layer of protection to your account.
              </p>
            </div>
            <a
              href="mailto:office@murivest.com?subject=2FA%20setup"
              className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-green border-b border-green/40 hover:text-gold hover:border-gold transition-colors pb-1"
            >
              Enable
            </a>
          </li>
          <li className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-body text-[0.9rem] text-green">
                Session &amp; sign out
              </p>
              <p className="text-[0.75rem] text-charcoal mt-0.5">
                End this browser session.
              </p>
            </div>
            <SignOutButton tone="default" />
          </li>
        </ul>
      </div>
    </section>
  );

  const profileTab = (
    <section id="profile" className="scroll-mt-24 space-y-10">
      <header>
        <h2 className="font-serif text-2xl font-light text-green">
          Your registration file
        </h2>
        <p className="text-[0.85rem] text-charcoal mt-1">
          The information below was captured at registration. Contact the deal
          team to update any field.
        </p>
      </header>

      <dl className="border border-hairline divide-y divide-hairline bg-white">
        {(
          [
            ["Buyer type", labelOf(BUYER_TYPES, buyer.buyerType)],
            ["Contact", `${buyer.email} · ${buyer.phone}`],
            [
              "Residence / tax",
              `${buyer.countryOfResidence} · ${buyer.taxJurisdiction}`,
            ],
            [
              "Identification",
              `${labelOf(ID_TYPES, buyer.idType)} · ${maskId(buyer.idNumber)}`,
            ],
            [
              "Purchasing entity",
              buyer.purchasingEntityName
                ? `${buyer.purchasingEntityName}${
                    buyer.purchasingEntityJurisdiction
                      ? ` (${buyer.purchasingEntityJurisdiction})`
                      : ""
                  }`
                : "Individual purchase",
            ],
            [
              "Beneficial owners",
              owners.length > 0
                ? owners.map((o) => `${o.name} (${o.share}%)`).join(" · ")
                : "—",
            ],
            [
              "Budget",
              buyer.budgetMin != null && buyer.budgetMax != null
                ? `${formatCurrency(
                    buyer.budgetMin,
                    buyer.budgetCurrency
                  )} – ${formatCurrency(
                    buyer.budgetMax,
                    buyer.budgetCurrency
                  )}`
                : "—",
            ],
            [
              "Preferred market",
              buyer.preferredCountry === "both"
                ? "Kenya & UK"
                : buyer.preferredCountry === "kenya"
                ? "Kenya"
                : "United Kingdom",
            ],
            ["Preferred locations", buyer.preferredLocations ?? "—"],
            ["Asset classes", assetClasses.join(", ") || "—"],
            ["Funding", labelOf(FUNDING_PREFERENCES, buyer.fundingPreference)],
            [
              "Funding evidence",
              buyer.pofType
                ? `${labelOf(POF_TYPES, buyer.pofType)}${
                    buyer.lenderName ? ` · ${buyer.lenderName}` : ""
                  }${buyer.pofFileName ? " · file on record" : ""}`
                : "On request",
            ],
            [
              "Timeline",
              labelOf(ACQUISITION_TIMELINES, buyer.acquisitionTimeline),
            ],
          ] as [string, string][]
        ).map(([k, v], i) => (
          <div
            key={k}
            className={`grid sm:grid-cols-[220px_1fr] gap-2 p-4 ${
              i % 2 === 1 ? "bg-cream/30" : ""
            }`}
          >
            <dt className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-gold pt-1">
              {k}
            </dt>
            <dd className="font-body text-[0.9rem] text-green break-words">
              {v}
            </dd>
          </div>
        ))}
      </dl>

      <div>
        <p className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-3">
          Qualification ladder
        </p>
        <ClassificationLadder current={buyer.classification} />
      </div>

      <p className="text-[0.75rem] leading-[1.7] text-charcoal">
        To update your file, contact{" "}
        <a
          href="mailto:office@murivest.com"
          className="text-green underline underline-offset-4"
        >
          office@murivest.com
        </a>
        . Proof-of-funds files are stored in the private document store and are
        not displayed on the website.
      </p>
    </section>
  );

  const supportTab = (
    <section id="support" className="scroll-mt-24 space-y-8">
      <header>
        <h2 className="font-serif text-2xl font-light text-green">Support</h2>
        <p className="text-[0.85rem] text-charcoal mt-1">
          Direct lines to the Murivest deal team for account, compliance and
          bid-related matters.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-hairline bg-white p-6">
          <p className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-3">
            Deal team
          </p>
          <p className="font-serif text-lg text-green mb-2">
            office@murivest.com
          </p>
          <p className="text-[0.85rem] leading-[1.8] text-charcoal mb-4">
            Account updates, bid queries, statement requests and document
            submissions. Response within one business day.
          </p>
          <a
            href="mailto:office@murivest.com"
            className="font-display text-[0.6rem] tracking-[0.25em] uppercase text-green border-b border-green/40 hover:text-gold hover:border-gold transition-colors pb-1"
          >
            Write to the team →
          </a>
        </div>

        <div className="border border-hairline bg-white p-6">
          <p className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-3">
            Escalation
          </p>
          <p className="text-[0.85rem] leading-[1.8] text-charcoal mb-4">
            For urgent matters related to an active bid, routed offers or
            time-sensitive sales, mark your message as <em>Urgent</em> in the
            subject line and include the bid reference.
          </p>
          <a
            href="mailto:office@murivest.com?subject=Urgent%20—%20active%20bid"
            className="font-display text-[0.6rem] tracking-[0.25em] uppercase text-green border-b border-green/40 hover:text-gold hover:border-gold transition-colors pb-1"
          >
            Escalate a bid →
          </a>
        </div>
      </div>

      <div className="border border-hairline bg-cream/40 p-6 md:p-8">
        <p className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-2">
          Account summary
        </p>
        <p className="text-[0.85rem] leading-[1.8] text-ink">
          {buyer.fullName} · {labelOf(BUYER_TYPES, buyer.buyerType)} ·{" "}
          {buyer.countryOfResidence} · Verification: {def.label} · Registered{" "}
          {formatDate(buyer.createdAt.toISOString())}
        </p>
      </div>
    </section>
  );

  return (
    <div className="account-canvas min-h-screen">
      <Container className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto">
          {/* Masthead */}
          <section className="bg-green text-cream p-6 md:p-10 mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-3">
                  Private client account
                </span>
                <h1 className="font-serif text-3xl md:text-4xl font-light leading-[1.15] mb-3">
                  {buyer.fullName}
                </h1>
                <p className="text-[0.85rem] leading-[1.7] text-[color:var(--mv-on-dark)]">
                  {labelOf(BUYER_TYPES, buyer.buyerType)} ·{" "}
                  {buyer.countryOfResidence} · Registered{" "}
                  {formatDate(buyer.createdAt.toISOString())}
                </p>
                <p className="mt-3 inline-flex items-center gap-2 border border-cream/25 px-3 py-1.5">
                  <span className="block w-1.5 h-1.5 rounded-full bg-gold" />
                  <span className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-cream">
                    {def.label}
                  </span>
                </p>
              </div>
              <SignOutButton tone="inverse" />
            </div>

            {/* Summary strip */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-cream/15 pt-6">
              <div className="flex-1 min-w-[130px] border-r border-cream/15 last:border-0 pr-6">
                <span className="block font-display text-[0.5rem] tracking-[0.2em] uppercase text-[color:var(--mv-on-dark-faint)] mb-1">
                  Verification
                </span>
                <span className="font-body text-[0.9rem] text-cream">
                  {def.label}
                </span>
              </div>
              <div className="flex-1 min-w-[130px] border-r border-cream/15 last:border-0 pr-6">
                <span className="block font-display text-[0.5rem] tracking-[0.2em] uppercase text-[color:var(--mv-on-dark-faint)] mb-1">
                  Active bids
                </span>
                <span className="font-body text-[0.9rem] text-cream">
                  {activeBids.length}
                </span>
              </div>
              <div className="flex-1 min-w-[130px] border-r border-cream/15 last:border-0 pr-6">
                <span className="block font-display text-[0.5rem] tracking-[0.2em] uppercase text-[color:var(--mv-on-dark-faint)] mb-1">
                  Routed
                </span>
                <span className="font-body text-[0.9rem] text-cream">
                  {routedBids.length}
                </span>
              </div>
              <div className="flex-1 min-w-[130px] border-r border-cream/15 last:border-0 pr-6">
                <span className="block font-display text-[0.5rem] tracking-[0.2em] uppercase text-[color:var(--mv-on-dark-faint)] mb-1">
                  Watchlist
                </span>
                <span className="font-body text-[0.9rem] text-cream">
                  {savedLots.length}
                </span>
              </div>
              <div className="flex-1 min-w-[130px] pr-6">
                <span className="block font-display text-[0.5rem] tracking-[0.2em] uppercase text-[color:var(--mv-on-dark-faint)] mb-1">
                  Client since
                </span>
                <span className="font-body text-[0.9rem] text-cream">
                  {formatDate(buyer.createdAt.toISOString())}
                </span>
              </div>
            </div>
          </section>

          {/* Tab navigation */}
          <TabNav current={tab} />

          {/* Tab content */}
          <div className="mt-10">
            {tab === "overview" && overviewTab}
            {tab === "bids" && bidsTab}
            {tab === "watchlist" && watchlistTab}
            {tab === "documents" && documentsTab}
            {tab === "activity" && activityTab}
            {tab === "settings" && settingsTab}
            {tab === "profile" && profileTab}
            {tab === "support" && supportTab}
          </div>
        </div>
      </Container>
    </div>
  );
}