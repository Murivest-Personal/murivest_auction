import Link from "next/link";
import type { Metadata } from "next";
import {
  countBidsByBuyer,
  countSavedLotsByBuyer,
  listBuyerAuditLogs,
  listBuyerBids,
  listBuyers,
  type Buyer,
} from "@/lib/supabase/records";
import {
  listSellingSubmissions,
  type SellingSubmissionBasic,
} from "@/lib/supabase/selling";
import {
  isAdminAuthenticated,
  usingDefaultAdminPasscode,
} from "@/lib/buyer/session";
import { classificationLabel } from "@/lib/buyer/qualification";
import { AdminGate, AdminSignOutButton } from "@/components/admin/AdminGate";
import { BuyerClassificationControls } from "@/components/admin/BuyerClassificationControls";
import { BidStatusControls } from "@/components/admin/BidStatusControls";
import { BuyerAccessCode } from "@/components/admin/BuyerAccessCode";
import { Container } from "@/components/ui/Container";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Back office | Murivest Group Ltd",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Search = Promise<{ tab?: string; status?: string; q?: string }>;

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "buyers", label: "Buyers" },
  { key: "selling", label: "Selling submissions" },
  { key: "bids", label: "Account bids" },
  { key: "logs", label: "Audit log" },
];

/* ---------------- Design tokens ---------------- */

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-1";

const BTN_BASE = `inline-flex items-center justify-center gap-2 px-5 py-2.5 font-display text-[0.58rem] tracking-[0.22em] uppercase transition-colors whitespace-nowrap ${FOCUS}`;
const BTN_PRIMARY = `${BTN_BASE} bg-green text-cream hover:bg-gold`;
const BTN_SECONDARY = `${BTN_BASE} border border-green/30 bg-white text-green hover:border-green hover:bg-cream/60`;
const BTN_ON_DARK = `${BTN_BASE} border border-cream/30 text-cream hover:bg-cream hover:text-green`;
const LINK_ACTION = `font-display text-[0.55rem] tracking-[0.2em] uppercase text-green underline underline-offset-4 decoration-gold/60 hover:text-gold transition-colors ${FOCUS}`;

const CARD = "border border-hairline bg-white";
const INPUT =
  "w-full border border-hairline bg-white px-4 py-2.5 text-[0.82rem] text-green placeholder:text-charcoal/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40";
const TH =
  "p-3 font-display text-[0.5rem] tracking-[0.2em] uppercase text-gold align-top bg-cream/50";

/* ---------------- Status / action maps ---------------- */

const BID_STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted",
  acknowledged: "Acknowledged",
  routed: "Routed to selling party",
  superseded: "Superseded",
  declined: "Declined",
  withdrawn: "Withdrawn",
};

const BID_STATUS_ORDER = [
  "submitted",
  "acknowledged",
  "routed",
  "declined",
  "withdrawn",
  "superseded",
];

const SELLING_STATUS_LABEL: Record<string, string> = {
  new: "New",
  review: "Under review",
  approved: "Approved for listing",
  listed: "Listed",
  sold: "Sold",
  withdrawn: "Withdrawn",
};

const QUALIFICATION_STATUS_LABEL: Record<string, string> = {
  eligible: "Eligible",
  ineligible: "Ineligible",
  pending: "Pending review",
};

const SELLING_STAGES = [
  "new",
  "review",
  "approved",
  "listed",
  "sold",
  "withdrawn",
] as const;

const SELLING_NEXT_STEP: Record<string, { short: string; detail: string }> = {
  new: {
    short: "Triage",
    detail: "Triage the submission — qualify the asset and route to review.",
  },
  review: {
    short: "Due diligence",
    detail: "Complete due diligence and approve or reject for listing.",
  },
  approved: {
    short: "Prepare listing",
    detail: "Prepare the listing — schedule auction date and legal pack.",
  },
  listed: {
    short: "Monitor bids",
    detail: "Monitor interest and bid activity on the listed lot.",
  },
  sold: {
    short: "Archive",
    detail: "Archive record. No further action required.",
  },
  withdrawn: {
    short: "Archive",
    detail: "Archive record. No further action required.",
  },
};

/** New or in-review submissions older than this are flagged as waiting. */
const STALE_AFTER_DAYS = 3;

const ACTION_LABELS: Record<string, string> = {
  bid_submitted: "Bid submitted",
  bid_status_changed: "Bid status changed",
  pof_viewed: "Proof of funds viewed",
  classification_changed: "Classification changed",
  account_setting_changed: "Account setting changed",
  access_code_viewed: "Access code viewed",
  access_code_issued: "Access code issued",
  access_code_resent: "Access code resent",
  access_code_email_sent: "Access code email sent",
  access_code_email_failed: "Access code email failed",
  selling_submitted: "Selling submission received",
  selling_file_viewed: "Selling file viewed",
};

const LOG_GROUPS: {
  key: string;
  label: string;
  match: (action: string) => boolean;
}[] = [
  { key: "bids", label: "Bids", match: (a) => a.startsWith("bid_") },
  { key: "pof", label: "Proof of funds", match: (a) => a === "pof_viewed" },
  {
    key: "classification",
    label: "Classification",
    match: (a) => a === "classification_changed",
  },
  {
    key: "access",
    label: "Access codes",
    match: (a) => a.startsWith("access_code_"),
  },
  { key: "selling", label: "Selling", match: (a) => a.startsWith("selling_") },
  {
    key: "account",
    label: "Account settings",
    match: (a) => a === "account_setting_changed",
  },
];

/* ---------------- Inferred row types ---------------- */

type BidRow = Awaited<ReturnType<typeof listBuyerBids>>[number];
type LogRow = Awaited<ReturnType<typeof listBuyerAuditLogs>>[number];

/* ---------------- Helpers ---------------- */

function tabHref(tab: string, status?: string, q?: string) {
  const p = new URLSearchParams({ tab });
  if (status && status !== "all") p.set("status", status);
  if (q) p.set("q", q);
  return `/back-office?${p.toString()}`;
}

function daysSince(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / 86_400_000);
}

function ageLabel(date: Date) {
  const days = daysSince(date);
  if (days <= 0) return "today";
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

function isStale(s: SellingSubmissionBasic) {
  return (
    (s.status === "new" || s.status === "review") &&
    daysSince(s.createdAt) >= STALE_AFTER_DAYS
  );
}

/* ---------------- Page ---------------- */

export default async function BackOfficePage({
  searchParams,
}: {
  searchParams: Search;
}) {
  if (!(await isAdminAuthenticated())) {
    return (
      <Container className="py-16 md:py-24">
        <div className="max-w-md mx-auto">
          <AdminGate />
        </div>
      </Container>
    );
  }

  const sp = await searchParams;
  const activeTab = TABS.some((t) => t.key === sp.tab)
    ? (sp.tab as string)
    : "overview";
  const statusFilter = typeof sp.status === "string" ? sp.status : "all";
  const query = typeof sp.q === "string" ? sp.q.slice(0, 100) : "";

  const [buyers, sellingSubmissions, bids, logs] = await Promise.all([
    listBuyers(),
    listSellingSubmissions(100),
    listBuyerBids(200),
    listBuyerAuditLogs(80),
  ]);

  const activeBids = bids.filter((b) =>
    ["submitted", "acknowledged", "routed"].includes(b.status)
  );
  const submittedBids = bids.filter((b) => b.status === "submitted");
  const newSelling = sellingSubmissions.filter((s) => s.status === "new");
  const reviewSelling = sellingSubmissions.filter(
    (s) => s.status === "review"
  );
  const waitingSelling = sellingSubmissions.filter(isStale);

  const updatedAt = new Date().toLocaleString("en-GB", {
    timeZone: "Africa/Nairobi",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const refreshHref = tabHref(activeTab, statusFilter, query);

  const attention = [
    {
      label: "new selling submissions",
      count: newSelling.length,
      href: tabHref("selling", "new"),
    },
    {
      label: "selling submissions under review",
      count: reviewSelling.length,
      href: tabHref("selling", "review"),
    },
    {
      label: "bids awaiting acknowledgement",
      count: submittedBids.length,
      href: tabHref("bids", "submitted"),
    },
    {
      label: `submissions waiting ${STALE_AFTER_DAYS}+ days`,
      count: waitingSelling.length,
      href: tabHref("selling"),
    },
  ].filter((i) => i.count > 0);

  const tabBadges: Record<string, { count: number; attention: boolean }> = {
    buyers: { count: buyers.length, attention: false },
    selling: {
      count: sellingSubmissions.length,
      attention: newSelling.length > 0,
    },
    bids: { count: bids.length, attention: submittedBids.length > 0 },
    logs: { count: logs.length, attention: false },
  };

  return (
    <Container className="py-10 md:py-14">
      <div className="max-w-7xl mx-auto">
        {/* Masthead */}
        <section className="mb-6 bg-green text-cream">
          <div className="h-0.5 bg-gold" aria-hidden="true" />
          <div className="p-6 md:p-8">
            <nav
              aria-label="Breadcrumb"
              className="mb-5 font-display text-[0.5rem] tracking-[0.3em] uppercase text-[color:var(--mv-on-dark-faint)]"
            >
              <Link href="/" className="hover:text-gold transition-colors">
                Murivest Group Ltd
              </Link>
              <span className="mx-2 opacity-50">/</span>
              <span className="text-gold">Back office</span>
            </nav>

            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-light leading-[1.15] mb-2">
                  Back office
                </h1>
                <p className="text-[0.85rem] leading-[1.7] text-[color:var(--mv-on-dark)]">
                  Buyers, selling submissions, account bids and the audit trail
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-[color:var(--mv-on-dark-faint)]">
                  Updated {updatedAt} EAT
                </span>
                <Link href={refreshHref} className={BTN_ON_DARK}>
                  Refresh
                </Link>
                <AdminSignOutButton />
              </div>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-px border-t border-cream/15 bg-cream/15 md:grid-cols-4">
            <MastHeadStat
              label="Buyers"
              value={String(buyers.length)}
              href={tabHref("buyers")}
            />
            <MastHeadStat
              label="Selling"
              value={String(sellingSubmissions.length)}
              hint={`${newSelling.length} new`}
              href={tabHref("selling")}
            />
            <MastHeadStat
              label="Bids"
              value={String(bids.length)}
              hint={`${activeBids.length} active`}
              href={tabHref("bids")}
            />
            <MastHeadStat
              label="Audit events"
              value={String(logs.length)}
              href={tabHref("logs")}
            />
          </ul>
        </section>

        {usingDefaultAdminPasscode() ? (
          <p
            role="alert"
            className="mb-6 border-l-4 border-gold bg-white p-4 text-[0.8rem] leading-[1.7] text-charcoal"
          >
            The default admin passcode is in use. Set{" "}
            <code className="bg-cream px-1">ADMIN_PASSCODE</code> in the
            environment before production use.
          </p>
        ) : null}

        {/* Needs attention — visible on every tab */}
        <AttentionBar items={attention} />

        {/* Tab navigation */}
        <nav
          aria-label="Back office sections"
          className="sticky top-16 lg:top-0 z-20 bg-cream/95 backdrop-blur border-b border-hairline mb-8"
        >
          <ul className="flex gap-1 overflow-x-auto">
            {TABS.map((t) => {
              const active = activeTab === t.key;
              const badge = tabBadges[t.key];
              return (
                <li key={t.key}>
                  <Link
                    href={tabHref(t.key)}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex items-center gap-2 px-4 py-4 border-b-2 font-display text-[0.6rem] tracking-[0.2em] uppercase transition-colors whitespace-nowrap ${FOCUS} ${
                      active
                        ? "text-green border-gold"
                        : "text-charcoal border-transparent hover:text-gold"
                    }`}
                  >
                    {t.label}
                    {badge ? (
                      <span
                        className={`inline-flex min-w-[1.4rem] justify-center rounded-full px-1.5 py-0.5 text-[0.5rem] tracking-normal ${
                          badge.attention
                            ? "bg-gold text-cream"
                            : "bg-hairline/70 text-charcoal"
                        }`}
                      >
                        {badge.count}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Tab content */}
        {activeTab === "overview" ? (
          <OverviewTab
            buyers={buyers}
            selling={sellingSubmissions}
            bids={bids}
            logs={logs}
            newSelling={newSelling.length}
            reviewSelling={reviewSelling.length}
            activeBids={activeBids.length}
          />
        ) : null}
        {activeTab === "buyers" ? (
          <BuyersTab
            buyers={buyers}
            statusFilter={statusFilter}
            query={query}
          />
        ) : null}
        {activeTab === "selling" ? (
          <SellingTab
            submissions={sellingSubmissions}
            statusFilter={statusFilter}
            query={query}
          />
        ) : null}
        {activeTab === "bids" ? (
          <BidsTab
            buyers={buyers}
            bids={bids}
            statusFilter={statusFilter}
            query={query}
          />
        ) : null}
        {activeTab === "logs" ? (
          <LogsTab
            logs={logs}
            buyers={buyers}
            statusFilter={statusFilter}
            query={query}
          />
        ) : null}
      </div>
    </Container>
  );
}

/* ================= Shared subcomponents ================= */

function MastHeadStat({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  href: string;
}) {
  return (
    <li className="bg-green">
      <Link
        href={href}
        className={`block px-6 py-5 transition-colors hover:bg-white/5 ${FOCUS}`}
      >
        <span className="block font-display text-[0.5rem] tracking-[0.22em] uppercase text-[color:var(--mv-on-dark-faint)] mb-2">
          {label}
        </span>
        <span className="block font-serif text-3xl font-light text-cream leading-none">
          {value}
        </span>
        <span className="block font-display text-[0.45rem] tracking-[0.18em] uppercase text-gold mt-2 min-h-[0.7rem]">
          {hint ?? ""}
        </span>
      </Link>
    </li>
  );
}

function AttentionBar({
  items,
}: {
  items: { label: string; count: number; href: string }[];
}) {
  if (items.length === 0) {
    return (
      <div
        role="status"
        className="mb-6 flex items-center gap-3 border border-hairline bg-white px-5 py-3.5"
      >
        <span
          aria-hidden="true"
          className="flex h-5 w-5 items-center justify-center rounded-full bg-green text-[0.6rem] text-cream"
        >
          ✓
        </span>
        <p className="text-[0.82rem] text-green">
          All caught up. Nothing is waiting for action.
        </p>
      </div>
    );
  }

  return (
    <section
      aria-label="Needs attention"
      className="mb-6 border border-gold/40 bg-white p-4 md:p-5"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <span className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-gold md:w-36 shrink-0">
          Needs attention
        </span>
        <ul className="flex flex-wrap gap-2">
          {items.map((i) => (
            <li key={i.label}>
              <Link
                href={i.href}
                className={`group inline-flex items-center gap-3 border border-hairline bg-cream/40 px-3.5 py-2 transition-colors hover:border-gold hover:bg-white ${FOCUS}`}
              >
                <span className="font-serif text-xl leading-none text-gold">
                  {i.count}
                </span>
                <span className="text-[0.78rem] text-green">{i.label}</span>
                <span
                  aria-hidden="true"
                  className="text-gold transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: React.ReactNode;
}) {
  return (
    <header className="mb-6">
      <h2 className="font-serif text-2xl font-light text-green">{title}</h2>
      <p className="text-[0.85rem] leading-[1.8] text-charcoal mt-1 max-w-3xl">
        {description}
      </p>
    </header>
  );
}

function KpiCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`group block ${CARD} p-5 transition-colors hover:border-gold ${FOCUS}`}
    >
      <span className="block font-display text-[0.5rem] tracking-[0.25em] uppercase text-gold mb-3">
        {label}
      </span>
      <span className="block font-serif text-3xl text-green leading-none">
        {value}
      </span>
      <span className="mt-2 flex items-center justify-between text-[0.72rem] text-charcoal">
        <span>{hint ?? "\u00A0"}</span>
        <span
          aria-hidden="true"
          className="text-gold opacity-0 transition-opacity group-hover:opacity-100"
        >
          →
        </span>
      </span>
    </Link>
  );
}

function StatusPill({
  tone = "muted",
  children,
}: {
  tone?: "gold" | "green" | "muted" | "alert";
  children: React.ReactNode;
}) {
  const styles = {
    green: { box: "border-green/30 text-green bg-green/5", dot: "bg-green" },
    gold: { box: "border-gold/40 text-gold bg-gold/5", dot: "bg-gold" },
    alert: {
      box: "border-red-300 text-red-700 bg-red-50",
      dot: "bg-red-600",
    },
    muted: {
      box: "border-hairline text-charcoal bg-cream/40",
      dot: "bg-charcoal/40",
    },
  }[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[0.5rem] font-display tracking-[0.2em] uppercase whitespace-nowrap ${styles.box}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
      />
      {children}
    </span>
  );
}

function Chips({
  options,
  current,
  hrefFor,
}: {
  options: { key: string; label: string; count?: number }[];
  current: string;
  hrefFor: (key: string) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter">
      {options.map((o) => {
        const active = current === o.key;
        return (
          <Link
            key={o.key}
            href={hrefFor(o.key)}
            aria-current={active ? "true" : undefined}
            className={`inline-flex items-center gap-2 border px-3 py-1.5 font-display text-[0.55rem] tracking-[0.2em] uppercase transition-colors whitespace-nowrap ${FOCUS} ${
              active
                ? "border-green bg-green text-cream"
                : "border-hairline bg-white text-charcoal hover:border-green/40 hover:text-green"
            }`}
          >
            {o.label}
            {o.count !== undefined ? (
              <span className={active ? "text-gold" : "text-charcoal/60"}>
                {o.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

function SearchForm({
  tab,
  status,
  query,
  placeholder,
  label,
}: {
  tab: string;
  status: string;
  query: string;
  placeholder: string;
  label: string;
}) {
  return (
    <form
      action="/back-office"
      method="get"
      role="search"
      className="flex flex-col sm:flex-row gap-3"
    >
      <input type="hidden" name="tab" value={tab} />
      <input type="hidden" name="status" value={status} />
      <label htmlFor={`${tab}-q`} className="sr-only">
        {label}
      </label>
      <input
        id={`${tab}-q`}
        name="q"
        defaultValue={query}
        placeholder={placeholder}
        className={`${INPUT} flex-1`}
      />
      <button type="submit" className={BTN_PRIMARY}>
        Search
      </button>
      {query ? (
        <Link href={tabHref(tab, status)} className={BTN_SECONDARY}>
          Clear
        </Link>
      ) : null}
    </form>
  );
}

function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="mb-6 space-y-4">{children}</div>;
}

function EmptyPanel({
  title,
  body,
  action,
}: {
  title?: string;
  body: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className={`${CARD} p-8 md:p-10 text-center`}>
      <span
        aria-hidden="true"
        className="mx-auto mb-4 block h-px w-10 bg-gold"
      />
      {title ? (
        <h3 className="font-serif text-xl font-light text-green mb-2">
          {title}
        </h3>
      ) : null}
      <p className="text-[0.9rem] leading-[1.8] text-charcoal max-w-md mx-auto">
        {body}
      </p>
      {action ? (
        <Link href={action.href} className={`${BTN_SECONDARY} mt-6`}>
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

function BreakdownPanel({
  title,
  items,
  linkLabel,
  linkHref,
}: {
  title: string;
  items: { label: string; count: number; href: string }[];
  linkLabel: string;
  linkHref: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
        <span className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-gold">
          {title}
        </span>
        <Link href={linkHref} className={LINK_ACTION}>
          {linkLabel} →
        </Link>
      </div>
      <ul className="divide-y divide-hairline">
        {items.map((i) => (
          <li key={i.label}>
            <Link
              href={i.href}
              className={`flex items-center gap-4 px-5 py-3 transition-colors hover:bg-cream/50 ${FOCUS}`}
            >
              <span className="w-40 shrink-0 text-[0.82rem] text-green">
                {i.label}
              </span>
              <span className="h-1 flex-1 bg-hairline/60" aria-hidden="true">
                <span
                  className="block h-full bg-gold"
                  style={{ width: `${(i.count / max) * 100}%` }}
                />
              </span>
              <span className="w-8 text-right font-serif text-[1rem] text-green">
                {i.count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({
  label,
  price,
  children,
}: {
  label: string;
  price?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal">
        {label}
      </dt>
      <dd className={`text-green ${price ? "price" : ""}`}>{children}</dd>
    </div>
  );
}

/* ================= Overview tab ================= */

function OverviewTab({
  buyers,
  selling,
  bids,
  logs,
  newSelling,
  reviewSelling,
  activeBids,
}: {
  buyers: Buyer[];
  selling: SellingSubmissionBasic[];
  bids: BidRow[];
  logs: LogRow[];
  newSelling: number;
  reviewSelling: number;
  activeBids: number;
}) {
  const classCounts = new Map<string, number>();
  for (const b of buyers) {
    const lbl = classificationLabel(b.classification);
    classCounts.set(lbl, (classCounts.get(lbl) ?? 0) + 1);
  }
  const classHint =
    classCounts.size > 0
      ? [...classCounts.entries()]
          .slice(0, 3)
          .map(([l, c]) => `${l}: ${c}`)
          .join(" · ")
      : undefined;

  const sellingCounts: Record<string, number> = {};
  for (const s of selling)
    sellingCounts[s.status] = (sellingCounts[s.status] ?? 0) + 1;
  const bidCounts: Record<string, number> = {};
  for (const b of bids) bidCounts[b.status] = (bidCounts[b.status] ?? 0) + 1;

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Registered buyers"
          value={String(buyers.length)}
          hint={classHint}
          href={tabHref("buyers")}
        />
        <KpiCard
          label="Selling submissions"
          value={String(selling.length)}
          hint={`${newSelling} new · ${reviewSelling} under review`}
          href={tabHref("selling")}
        />
        <KpiCard
          label="Account bids"
          value={String(bids.length)}
          hint={`${activeBids} active`}
          href={tabHref("bids")}
        />
        <KpiCard
          label="Audit events"
          value={String(logs.length)}
          hint="Latest 80 shown in Audit log"
          href={tabHref("logs")}
        />
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <BreakdownPanel
          title="Selling pipeline"
          linkLabel="Open"
          linkHref={tabHref("selling")}
          items={SELLING_STAGES.map((k) => ({
            label: SELLING_STATUS_LABEL[k] ?? k,
            count: sellingCounts[k] ?? 0,
            href: tabHref("selling", k),
          }))}
        />
        <BreakdownPanel
          title="Bid status"
          linkLabel="Open"
          linkHref={tabHref("bids")}
          items={BID_STATUS_ORDER.map((k) => ({
            label: BID_STATUS_LABEL[k] ?? k,
            count: bidCounts[k] ?? 0,
            href: tabHref("bids", k),
          }))}
        />
      </div>

      {/* Recent activity */}
      <div className={CARD}>
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <span className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-gold">
            Recent activity
          </span>
          <Link href={tabHref("logs")} className={LINK_ACTION}>
            View all →
          </Link>
        </div>
        {logs.length === 0 ? (
          <p className="px-5 py-6 text-[0.82rem] text-charcoal">
            No activity yet.
          </p>
        ) : (
          <ul className="divide-y divide-hairline">
            {logs.slice(0, 6).map((l) => (
              <li key={l.id} className="px-5 py-3 flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-1.5 block w-1.5 h-1.5 rounded-full bg-gold shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-body text-[0.82rem] text-green leading-snug">
                    {ACTION_LABELS[l.action] ?? l.action}
                  </p>
                  <p className="text-[0.7rem] text-charcoal mt-0.5">
                    {l.createdAt.toLocaleString("en-GB")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ================= Buyers tab ================= */

async function BuyersTab({
  buyers,
  statusFilter,
  query,
}: {
  buyers: Buyer[];
  statusFilter: string;
  query: string;
}) {
  const [bidsBy, savesBy] = await Promise.all([
    countBidsByBuyer(),
    countSavedLotsByBuyer(),
  ]);

  const q = query.trim().toLowerCase();
  const classKeys = Array.from(new Set(buyers.map((b) => String(b.classification))));
  const stage =
    statusFilter === "all" || classKeys.includes(statusFilter)
      ? statusFilter
      : "all";

  const classCounts: Record<string, number> = {};
  for (const b of buyers) {
    const k = String(b.classification);
    classCounts[k] = (classCounts[k] ?? 0) + 1;
  }

  const rows = buyers
    .filter((b) => stage === "all" || String(b.classification) === stage)
    .filter(
      (b) =>
        !q ||
        [b.fullName, b.email, b.phone].some((v) =>
          String(v ?? "").toLowerCase().includes(q)
        )
    );

  const filters = [
    { key: "all", label: "All", count: buyers.length },
    ...classKeys.map((k) => ({
      key: k,
      label: classificationLabel(
        buyers.find((b) => String(b.classification) === k)!.classification
      ),
      count: classCounts[k] ?? 0,
    })),
  ];

  return (
    <section aria-label="Buyers and qualification">
      <SectionHeader
        title="Registered buyers"
        description={
          <>
            {buyers.length} registered account{buyers.length === 1 ? "" : "s"}.
            Classification changes are audit-logged. Proof-of-funds files open
            from the private store — every view is logged.
          </>
        }
      />

      <Toolbar>
        <SearchForm
          tab="buyers"
          status={stage}
          query={query}
          placeholder="Search name, email or phone"
          label="Search buyers"
        />
        <Chips
          options={filters}
          current={stage}
          hrefFor={(k) => tabHref("buyers", k, q ? query.trim() : undefined)}
        />
      </Toolbar>

      {rows.length === 0 ? (
        <EmptyPanel
          title="No buyers found"
          body={
            q
              ? `No buyers match “${query.trim()}”.`
              : buyers.length === 0
              ? "No accounts registered yet."
              : "No buyers match this filter."
          }
          action={
            q || stage !== "all"
              ? { label: "Show all buyers", href: tabHref("buyers") }
              : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {rows.map((b) => (
            <details
              key={b.id}
              open={rows.length === 1}
              className={`group ${CARD} transition-colors open:border-green/30`}
            >
              <summary
                className={`flex cursor-pointer list-none items-center gap-4 px-5 py-4 transition-colors hover:bg-cream/40 [&::-webkit-details-marker]:hidden ${FOCUS}`}
              >
                <span
                  aria-hidden="true"
                  className="text-gold transition-transform group-open:rotate-90"
                >
                  ›
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-[1.05rem] text-green truncate">
                    {b.fullName}
                  </p>
                  <p className="text-[0.72rem] text-charcoal truncate">
                    {b.email}
                  </p>
                </div>
                <StatusPill tone="gold">
                  {classificationLabel(b.classification)}
                </StatusPill>
                <span className="hidden md:block font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal whitespace-nowrap">
                  {bidsBy.get(b.id) ?? 0} bid
                  {(bidsBy.get(b.id) ?? 0) === 1 ? "" : "s"} ·{" "}
                  {savesBy.get(b.id) ?? 0} saved
                </span>
                <span className="hidden lg:block font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal whitespace-nowrap">
                  Registered {formatDate(b.createdAt.toISOString())}
                </span>
              </summary>

              <div className="border-t border-hairline p-5 md:p-6">
                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                  <div>
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[0.8rem]">
                      <Field label="Contact">
                        <span className="break-words">
                          {b.email} · {b.phone}
                        </span>
                      </Field>
                      <Field label="Residence / tax">
                        {b.countryOfResidence} · {b.taxJurisdiction}
                      </Field>
                      <Field label="Budget" price>
                        {formatCurrency(b.budgetMin ?? 0, b.budgetCurrency)} –{" "}
                        {formatCurrency(b.budgetMax ?? 0, b.budgetCurrency)}
                      </Field>
                      <Field label="Timeline">
                        {b.acquisitionTimeline.replace(/-/g, " ")}
                      </Field>
                      <Field label="Funding">
                        {b.fundingPreference}
                        {b.lenderName ? ` · ${b.lenderName}` : ""}
                      </Field>
                      <Field label="Asset classes">
                        <span className="break-words">
                          {(b.assetClasses ?? []).join(", ") || "—"}
                        </span>
                      </Field>
                      <Field label="Alerts">
                        {[
                          b.notifyNewLots ? "new lots" : null,
                          b.notifyOffMarket ? "off-market" : null,
                          b.notifyBidUpdates ? "bid updates" : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "none"}
                      </Field>
                      {b.purchasingEntityName ? (
                        <Field label="Purchasing entity">
                          {b.purchasingEntityName}
                          {b.purchasingEntityJurisdiction
                            ? ` (${b.purchasingEntityJurisdiction})`
                            : ""}
                        </Field>
                      ) : null}
                      {b.beneficialOwners && b.beneficialOwners.length > 0 ? (
                        <Field label="Beneficial owners">
                          {(b.beneficialOwners ?? [])
                            .map((o) => `${o.name} ${o.share}%`)
                            .join(" · ")}
                        </Field>
                      ) : null}
                    </dl>

                    <div className="mt-4 pt-4 border-t border-hairline flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal">
                        Proof of funds:{" "}
                        <span className="text-green">
                          {b.pofStoredPath
                            ? b.pofFileName
                            : b.pofType
                            ? `${b.pofType} (no file)`
                            : "on request"}
                        </span>
                      </span>
                      {b.pofStoredPath ? (
                        <a
                          href={`/api/admin/buyers/${b.id}/pof`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={LINK_ACTION}
                        >
                          View (logged)
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <div className="lg:border-l lg:border-hairline lg:pl-6 space-y-4">
                    <BuyerClassificationControls
                      buyerId={b.id}
                      current={b.classification}
                      note={b.classificationNote}
                    />
                    <BuyerAccessCode
                      buyerId={b.id}
                      buyerEmail={b.email}
                      buyerName={b.fullName}
                      hasAccessCode={Boolean(b.accessCodeEncrypted)}
                    />
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}

/* ================= Selling tab ================= */

function stageRank(status: string) {
  const i = (SELLING_STAGES as readonly string[]).indexOf(status);
  return i === -1 ? 99 : i;
}

function statusTone(status: string): "gold" | "green" | "muted" {
  if (status === "new" || status === "review") return "gold";
  if (status === "approved" || status === "listed") return "green";
  return "muted";
}

function qualificationTone(status: string): "gold" | "green" | "muted" {
  if (status === "eligible") return "green";
  if (status === "pending") return "gold";
  return "muted";
}

function SellingTab({
  submissions,
  statusFilter,
  query,
}: {
  submissions: SellingSubmissionBasic[];
  statusFilter: string;
  query: string;
}) {
  const q = query.trim().toLowerCase();
  const stage =
    statusFilter === "all" ||
    (SELLING_STAGES as readonly string[]).includes(statusFilter)
      ? statusFilter
      : "all";

  const counts: Record<string, number> = {};
  const qualification: Record<string, number> = {};
  let waiting = 0;
  for (const s of submissions) {
    counts[s.status] = (counts[s.status] ?? 0) + 1;
    qualification[s.qualificationStatus] =
      (qualification[s.qualificationStatus] ?? 0) + 1;
    if (isStale(s)) waiting += 1;
  }

  const rows = submissions
    .filter((s) => stage === "all" || s.status === stage)
    .filter(
      (s) =>
        !q ||
        [s.reference, s.sellerName, s.sellerEmail].some((v) =>
          v?.toLowerCase().includes(q)
        )
    )
    .sort((a, b) => {
      if (stage === "all") {
        const byStage = stageRank(a.status) - stageRank(b.status);
        if (byStage !== 0) return byStage;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  const pipeline = [
    { key: "all", label: "All", count: submissions.length },
    ...SELLING_STAGES.map((k) => ({
      key: k as string,
      label: SELLING_STATUS_LABEL[k] ?? k,
      count: counts[k] ?? 0,
    })),
  ];

  return (
    <section aria-label="Selling submissions">
      <SectionHeader
        title="Selling submissions"
        description="Each submission is auto-qualified on entry. Review, classify, and progress the seller through the pipeline."
      />

      {/* Pipeline — doubles as the stage filter */}
      <nav
        aria-label="Pipeline stage"
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-px bg-hairline border border-hairline mb-6"
      >
        {pipeline.map((item) => {
          const active = stage === item.key;
          return (
            <Link
              key={item.key}
              href={tabHref("selling", item.key, q ? query.trim() : undefined)}
              aria-current={active ? "page" : undefined}
              className={`px-4 py-4 border-b-2 transition-colors ${FOCUS} ${
                active
                  ? "bg-cream/60 border-gold"
                  : "bg-white border-transparent hover:bg-cream/40"
              }`}
            >
              <span
                className={`block font-display text-[0.5rem] tracking-[0.22em] uppercase mb-1 ${
                  active ? "text-gold" : "text-charcoal"
                }`}
              >
                {item.label}
              </span>
              <span className="block font-serif text-2xl text-green leading-none">
                {item.count}
              </span>
            </Link>
          );
        })}
      </nav>

      <Toolbar>
        <SearchForm
          tab="selling"
          status={stage}
          query={query}
          placeholder="Search reference, seller or email"
          label="Search submissions"
        />
        <p className="font-display text-[0.55rem] tracking-[0.22em] uppercase text-charcoal">
          <span className="text-gold">{qualification.eligible ?? 0}</span>{" "}
          {QUALIFICATION_STATUS_LABEL.eligible}
          <span className="mx-3 opacity-40">·</span>
          <span className="text-gold">{qualification.pending ?? 0}</span>{" "}
          {QUALIFICATION_STATUS_LABEL.pending}
          <span className="mx-3 opacity-40">·</span>
          <span className="text-gold">{qualification.ineligible ?? 0}</span>{" "}
          {QUALIFICATION_STATUS_LABEL.ineligible}
          {waiting > 0 ? (
            <>
              <span className="mx-3 opacity-40">·</span>
              <span className="text-gold">{waiting}</span> waiting{" "}
              {STALE_AFTER_DAYS}+ days
            </>
          ) : null}
        </p>
      </Toolbar>

      {rows.length === 0 ? (
        <EmptyPanel
          title="No submissions found"
          body={
            q
              ? `No submissions match “${query.trim()}”.`
              : "No submissions match this filter."
          }
          action={
            q || stage !== "all"
              ? { label: "Show all submissions", href: tabHref("selling") }
              : undefined
          }
        />
      ) : (
        <div className={`${CARD} overflow-x-auto`}>
          <table className="w-full min-w-[860px] text-[0.8rem]">
            <thead>
              <tr className="border-b border-hairline text-left">
                {[
                  "Reference",
                  "Seller",
                  "Guide price",
                  "Status",
                  "Next step",
                  "",
                ].map((h, i) => (
                  <th key={i} className={TH}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const next =
                  SELLING_NEXT_STEP[s.status] ?? SELLING_NEXT_STEP.sold;
                return (
                  <tr
                    key={s.id}
                    className="border-b border-hairline align-top hover:bg-cream/30 transition-colors"
                  >
                    <td className="p-3 whitespace-nowrap">
                      <Link
                        href={`/back-office/selling/${s.id}`}
                        className="font-serif text-[0.95rem] text-green hover:text-gold transition-colors"
                      >
                        {s.reference}
                      </Link>
                      <span className="block text-[0.68rem] text-charcoal mt-0.5">
                        {formatDate(s.createdAt.toISOString())} ·{" "}
                        {ageLabel(s.createdAt)}
                      </span>
                      {isStale(s) ? (
                        <span className="inline-block mt-1.5">
                          <StatusPill tone="alert">Waiting</StatusPill>
                        </span>
                      ) : null}
                    </td>
                    <td className="p-3 text-green">
                      {s.sellerName}
                      <span className="block text-[0.68rem] text-charcoal mt-0.5 break-words">
                        {s.sellerEmail}
                      </span>
                    </td>
                    <td className="p-3 text-green whitespace-nowrap price font-serif">
                      {formatCurrency(s.guidePrice, s.currency)}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col items-start gap-1.5">
                        <StatusPill tone={statusTone(s.status)}>
                          {SELLING_STATUS_LABEL[s.status] ?? s.status}
                        </StatusPill>
                        <StatusPill
                          tone={qualificationTone(s.qualificationStatus)}
                        >
                          {QUALIFICATION_STATUS_LABEL[s.qualificationStatus] ??
                            s.qualificationStatus}
                        </StatusPill>
                      </div>
                    </td>
                    <td className="p-3 text-green" title={next.detail}>
                      {next.short}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <Link
                        href={`/back-office/selling/${s.id}`}
                        className={BTN_SECONDARY}
                      >
                        Open
                      </Link>
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
}

/* ================= Bids tab ================= */

function bidTone(status: string): "gold" | "green" | "muted" | "alert" {
  if (status === "routed") return "green";
  if (status === "acknowledged" || status === "submitted") return "gold";
  if (status === "declined") return "alert";
  return "muted";
}

function BidsTab({
  buyers,
  bids,
  statusFilter,
  query,
}: {
  buyers: Buyer[];
  bids: BidRow[];
  statusFilter: string;
  query: string;
}) {
  const buyerById = new Map(buyers.map((b) => [b.id, b]));
  const q = query.trim().toLowerCase();

  const counts: Record<string, number> = { all: bids.length };
  for (const b of bids) counts[b.status] = (counts[b.status] ?? 0) + 1;
  const activeCount =
    (counts.submitted ?? 0) + (counts.acknowledged ?? 0) + (counts.routed ?? 0);

  const validFilters = ["all", "active", ...BID_STATUS_ORDER];
  const stage = validFilters.includes(statusFilter) ? statusFilter : "all";

  const filtered = bids
    .filter((b) =>
      stage === "all"
        ? true
        : stage === "active"
        ? ["submitted", "acknowledged", "routed"].includes(b.status)
        : b.status === stage
    )
    .filter((bid) => {
      if (!q) return true;
      const b = buyerById.get(bid.buyerId);
      return [
        bid.reference,
        bid.propertyTitle,
        b?.fullName,
        b?.email,
      ].some((v) => String(v ?? "").toLowerCase().includes(q));
    });

  const filters = [
    { key: "all", label: "All", count: bids.length },
    { key: "active", label: "Active", count: activeCount },
    ...BID_STATUS_ORDER.map((k) => ({
      key: k,
      label: k.charAt(0).toUpperCase() + k.slice(1),
      count: counts[k] ?? 0,
    })),
  ];

  return (
    <section aria-label="Account bids">
      <SectionHeader
        title="Account bids"
        description={
          <>
            {bids.length} bid{bids.length === 1 ? "" : "s"} submitted by
            registered accounts — {counts.routed ?? 0} routed,{" "}
            {counts.submitted ?? 0} submitted, {counts.acknowledged ?? 0}{" "}
            acknowledged. Status changes are audit-logged; consents were
            recorded at submission.
          </>
        }
      />

      <Toolbar>
        <SearchForm
          tab="bids"
          status={stage}
          query={query}
          placeholder="Search reference, buyer or lot"
          label="Search bids"
        />
        <Chips
          options={filters}
          current={stage}
          hrefFor={(k) => tabHref("bids", k, q ? query.trim() : undefined)}
        />
      </Toolbar>

      {filtered.length === 0 ? (
        <EmptyPanel
          title="No bids found"
          body={
            q ? `No bids match “${query.trim()}”.` : "No bids match this filter."
          }
          action={
            q || stage !== "all"
              ? { label: "Show all bids", href: tabHref("bids") }
              : undefined
          }
        />
      ) : (
        <div className={`${CARD} overflow-x-auto`}>
          <table className="w-full min-w-[820px] text-[0.8rem]">
            <thead>
              <tr className="border-b border-hairline text-left">
                {["When", "Buyer", "Lot", "Amount", "Status", "Manage"].map(
                  (h) => (
                    <th key={h} className={TH}>
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((bid) => {
                const b = buyerById.get(bid.buyerId);
                return (
                  <tr
                    key={bid.id}
                    className="border-b border-hairline align-top hover:bg-cream/30 transition-colors"
                  >
                    <td className="p-3 text-charcoal whitespace-nowrap">
                      {formatDate(bid.createdAt.toISOString())}
                      <span className="block font-display text-[0.45rem] tracking-[0.2em] uppercase text-gold mt-1">
                        {bid.reference}
                      </span>
                    </td>
                    <td className="p-3 text-green whitespace-nowrap">
                      {b ? b.fullName : "—"}
                      <span className="block text-charcoal text-[0.68rem] mt-0.5">
                        {b
                          ? `${b.email} · ${classificationLabel(b.classification)}`
                          : ""}
                      </span>
                    </td>
                    <td className="p-3 text-green">
                      <Link
                        href={`/auctions/${bid.propertySlug}`}
                        className="underline underline-offset-4 decoration-gold/60 hover:text-gold transition-colors"
                      >
                        {bid.propertyTitle}
                      </Link>
                    </td>
                    <td className="p-3 text-green whitespace-nowrap price font-serif">
                      {formatCurrency(bid.bidAmount, bid.bidCurrency)}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <StatusPill tone={bidTone(bid.status)}>
                        {BID_STATUS_LABEL[bid.status] ?? bid.status}
                      </StatusPill>
                    </td>
                    <td className="p-3">
                      <BidStatusControls
                        bidId={bid.id}
                        current={bid.status}
                        note={bid.statusNote}
                      />
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
}

/* ================= Logs tab ================= */

function LogsTab({
  logs,
  buyers,
  statusFilter,
  query,
}: {
  logs: LogRow[];
  buyers: Buyer[];
  statusFilter: string;
  query: string;
}) {
  const buyerById = new Map(buyers.map((b) => [b.id, b]));
  const q = query.trim().toLowerCase();

  const group = LOG_GROUPS.find((g) => g.key === statusFilter);
  const stage = group ? group.key : "all";

  const filtered = logs
    .filter((l) => (group ? group.match(l.action) : true))
    .filter((l) => {
      if (!q) return true;
      const b = l.buyerId ? buyerById.get(l.buyerId) : null;
      return [
        ACTION_LABELS[l.action] ?? l.action,
        l.propertySlug,
        l.details,
        b?.fullName,
      ].some((v) => String(v ?? "").toLowerCase().includes(q));
    });

  const filters = [
    { key: "all", label: "All", count: logs.length },
    ...LOG_GROUPS.map((g) => ({
      key: g.key,
      label: g.label,
      count: logs.filter((l) => g.match(l.action)).length,
    })),
  ];

  return (
    <section aria-label="Audit log">
      <SectionHeader
        title="Audit log"
        description={`The most recent ${logs.length} events across bids, proof-of-funds views, classification changes, account settings and access codes.`}
      />

      <Toolbar>
        <SearchForm
          tab="logs"
          status={stage}
          query={query}
          placeholder="Search action, buyer, property or details"
          label="Search audit log"
        />
        <Chips
          options={filters}
          current={stage}
          hrefFor={(k) => tabHref("logs", k, q ? query.trim() : undefined)}
        />
      </Toolbar>

      {filtered.length === 0 ? (
        <EmptyPanel
          title="No events found"
          body={
            q
              ? `No events match “${query.trim()}”.`
              : "No audit events match this filter."
          }
          action={
            q || stage !== "all"
              ? { label: "Show all events", href: tabHref("logs") }
              : undefined
          }
        />
      ) : (
        <div className={`${CARD} overflow-x-auto`}>
          <table className="w-full min-w-[820px] text-[0.8rem]">
            <thead>
              <tr className="border-b border-hairline text-left">
                {["When", "Buyer", "Action", "Property", "Details"].map((h) => (
                  <th key={h} className={TH}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const b = l.buyerId ? buyerById.get(l.buyerId) : null;
                return (
                  <tr
                    key={l.id}
                    className="border-b border-hairline align-top hover:bg-cream/30 transition-colors"
                  >
                    <td className="p-3 text-charcoal whitespace-nowrap">
                      {l.createdAt.toLocaleString("en-GB")}
                    </td>
                    <td className="p-3 text-green whitespace-nowrap">
                      {b ? b.fullName : "—"}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <StatusPill
                        tone={
                          l.action === "access_code_email_failed"
                            ? "alert"
                            : "muted"
                        }
                      >
                        {ACTION_LABELS[l.action] ?? l.action}
                      </StatusPill>
                    </td>
                    <td className="p-3 text-charcoal">
                      {l.propertySlug ? (
                        <Link
                          href={`/auctions/${l.propertySlug}`}
                          className="underline underline-offset-4 decoration-gold/60 hover:text-gold transition-colors"
                        >
                          {l.propertySlug}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3 text-charcoal">{l.details ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}