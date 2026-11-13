import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { isAdminAuthenticated, usingDefaultAdminPasscode } from "@/lib/buyer/session";
import { classificationLabel } from "@/lib/buyer/qualification";
import { AdminGate, AdminSignOutButton } from "@/components/admin/AdminGate";
import { BuyerClassificationControls } from "@/components/admin/BuyerClassificationControls";
import { BidStatusControls } from "@/components/admin/BidStatusControls";
import { Container } from "@/components/ui/Container";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Back office | Murivest Group Ltd",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Search = Promise<{ tab?: string }>;

const TABS = [
  { key: "buyers", label: "Buyers & qualification" },
  { key: "bids", label: "Account bids" },
  { key: "logs", label: "Audit log" },
];

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

  const { tab } = await searchParams;
  const activeTab = TABS.some((t) => t.key === tab) ? (tab as string) : "buyers";

  const buyers = await db.buyerRegistration.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <Container className="py-12 md:py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-6 mb-4">
          <div>
            <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-3">
              Internal
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-light text-green">
              Back office
            </h1>
          </div>
          <AdminSignOutButton />
        </div>
        {usingDefaultAdminPasscode() ? (
          <p className="border border-gold bg-cream p-4 text-[0.8rem] leading-[1.7] text-charcoal mb-8">
            The default admin passcode is in use. Set <code>ADMIN_PASSCODE</code>{" "}
            in the environment before production use.
          </p>
        ) : null}

        {/* Tabs */}
        <nav aria-label="Back office sections" className="border-b border-hairline mb-10">
          <ul className="flex flex-wrap gap-6">
            {TABS.map((t) => (
              <li key={t.key}>
                <Link
                  href={`/back-office?tab=${t.key}`}
                  aria-current={activeTab === t.key ? "page" : undefined}
                  className={`inline-block py-4 font-display text-[0.62rem] tracking-[0.22em] uppercase transition-colors ${
                    activeTab === t.key
                      ? "text-green border-b-2 border-green -mb-px"
                      : "text-charcoal hover:text-green"
                  }`}
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {activeTab === "buyers" ? <BuyersTab buyers={buyers} /> : null}
        {activeTab === "bids" ? <BidsTab buyers={buyers} /> : null}
        {activeTab === "logs" ? <LogsTab /> : null}
      </div>
    </Container>
  );
}

/* ================= Buyers tab ================= */

type BuyerRow = Awaited<
  ReturnType<typeof db.buyerRegistration.findMany>
>[number];

async function BuyersTab({ buyers }: { buyers: BuyerRow[] }) {
  /* Counts of bids + saved lots per buyer, for at-a-glance state. */
  const [bidCounts, savedCounts] = await Promise.all([
    db.buyerBid.groupBy({ by: ["buyerId"], _count: { id: true } }),
    db.savedLot.groupBy({ by: ["buyerId"], _count: { id: true } }),
  ]);
  const bidsBy = new Map(bidCounts.map((c) => [c.buyerId, c._count.id]));
  const savesBy = new Map(savedCounts.map((c) => [c.buyerId, c._count.id]));

  return (
    <section aria-label="Buyers and qualification">
      <p className="text-[0.85rem] leading-[1.8] text-charcoal mb-8">
        {buyers.length} registered account{buyers.length === 1 ? "" : "s"}.
        Classification changes are audit-logged. Proof-of-funds files open from
        the private store; every view is logged.
      </p>
      {buyers.length === 0 ? (
        <p className="border border-hairline bg-white p-6 text-[0.9rem] text-charcoal">
          No accounts registered yet.
        </p>
      ) : (
        <div className="space-y-4">
          {buyers.map((b) => (
            <article key={b.id} className="border border-hairline bg-white p-5">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-3">
                    <h2 className="font-serif text-xl text-green">{b.fullName}</h2>
                    <span className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-gold">
                      {classificationLabel(b.classification)}
                    </span>
                    <span className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal">
                      {bidsBy.get(b.id) ?? 0} bid
                      {(bidsBy.get(b.id) ?? 0) === 1 ? "" : "s"} ·{" "}
                      {savesBy.get(b.id) ?? 0} saved/liked
                    </span>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-[0.8rem]">
                    <div>
                      <dt className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal">
                        Contact
                      </dt>
                      <dd className="text-green break-words">
                        {b.email} · {b.phone}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal">
                        Residence / tax
                      </dt>
                      <dd className="text-green">
                        {b.countryOfResidence} · {b.taxJurisdiction}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal">
                        Budget
                      </dt>
                      <dd className="text-green">
                        {formatCurrency(b.budgetMin ?? 0, b.budgetCurrency)} –{" "}
                        {formatCurrency(b.budgetMax ?? 0, b.budgetCurrency)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal">
                        Timeline
                      </dt>
                      <dd className="text-green">
                        {b.acquisitionTimeline.replace(/-/g, " ")}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal">
                        Funding
                      </dt>
                      <dd className="text-green">
                        {b.fundingPreference}
                        {b.lenderName ? ` · ${b.lenderName}` : ""}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal">
                        Asset classes
                      </dt>
                      <dd className="text-green break-words">
                        {(JSON.parse(b.assetClasses) as string[]).join(", ")}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal">
                        Alerts
                      </dt>
                      <dd className="text-green">
                        {[
                          b.notifyNewLots ? "new lots" : null,
                          b.notifyOffMarket ? "off-market" : null,
                          b.notifyBidUpdates ? "bid updates" : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "none"}
                      </dd>
                    </div>
                    {b.purchasingEntityName ? (
                      <div>
                        <dt className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal">
                          Purchasing entity
                        </dt>
                        <dd className="text-green">
                          {b.purchasingEntityName}
                          {b.purchasingEntityJurisdiction
                            ? ` (${b.purchasingEntityJurisdiction})`
                            : ""}
                        </dd>
                      </div>
                    ) : null}
                    {b.beneficialOwners ? (
                      <div>
                        <dt className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal">
                          Beneficial owners
                        </dt>
                        <dd className="text-green">
                          {(
                            JSON.parse(b.beneficialOwners) as {
                              name: string;
                              share: number;
                            }[]
                          )
                            .map((o) => `${o.name} ${o.share}%`)
                            .join(" · ")}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                  <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal">
                      Proof of funds:{" "}
                      {b.pofStoredPath
                        ? b.pofFileName
                        : b.pofType
                          ? `${b.pofType} (no file)`
                          : "on request"}
                    </span>
                    {b.pofStoredPath ? (
                      <a
                        href={`/api/admin/buyers/${b.id}/pof`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-green underline underline-offset-4 hover:text-gold"
                      >
                        View (logged)
                      </a>
                    ) : null}
                    <span className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal">
                      Registered {formatDate(b.createdAt.toISOString())}
                    </span>
                  </p>
                </div>
                <div className="lg:border-l lg:border-hairline lg:pl-6">
                  <BuyerClassificationControls
                    buyerId={b.id}
                    current={b.classification}
                    note={b.classificationNote}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

/* ================= Bids tab ================= */

const BID_STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted",
  acknowledged: "Acknowledged",
  routed: "Routed to selling party",
  superseded: "Superseded",
  declined: "Declined",
  withdrawn: "Withdrawn",
};

async function BidsTab({ buyers }: { buyers: BuyerRow[] }) {
  const bids = await db.buyerBid.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const buyerById = new Map(buyers.map((b) => [b.id, b]));

  return (
    <section aria-label="Account bids">
      <p className="text-[0.85rem] leading-[1.8] text-charcoal mb-8">
        Bids submitted by registered accounts from property pages — most recent
        {bids.length === 100 ? " 100" : ` ${bids.length}`}. Status changes are
        audit-logged. Consents (terms + the 2% fee) were recorded with
        timestamps at submission.
      </p>
      {bids.length === 0 ? (
        <p className="border border-hairline bg-white p-6 text-[0.9rem] text-charcoal">
          No bids submitted yet. Bidding is exclusive to registered accounts on
          the website.
        </p>
      ) : (
        <div className="border border-hairline bg-white overflow-x-auto">
          <table className="w-full text-[0.8rem]">
            <thead>
              <tr className="border-b border-hairline text-left">
                {["When", "Buyer", "Lot", "Amount", "Status", "Manage"].map(
                  (h) => (
                    <th
                      key={h}
                      className="p-3 font-display text-[0.5rem] tracking-[0.2em] uppercase text-gold align-top"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {bids.map((bid) => {
                const b = buyerById.get(bid.buyerId);
                return (
                  <tr key={bid.id} className="border-b border-hairline align-top">
                    <td className="p-3 text-charcoal whitespace-nowrap">
                      {formatDate(bid.createdAt.toISOString())}
                      <span className="block font-display text-[0.5rem] tracking-[0.15em] uppercase text-gold mt-1">
                        {bid.reference}
                      </span>
                    </td>
                    <td className="p-3 text-green whitespace-nowrap">
                      {b ? b.fullName : "—"}
                      <span className="block text-charcoal text-[0.7rem]">
                        {b ? `${b.email} · ${classificationLabel(b.classification)}` : ""}
                      </span>
                    </td>
                    <td className="p-3 text-green">
                      <Link
                        href={`/auctions/${bid.propertySlug}`}
                        className="underline underline-offset-4 hover:text-gold transition-colors"
                      >
                        {bid.propertyTitle}
                      </Link>
                    </td>
                    <td className="p-3 text-green whitespace-nowrap">
                      {formatCurrency(bid.bidAmount, bid.bidCurrency)}
                    </td>
                    <td className="p-3 text-charcoal whitespace-nowrap">
                      {BID_STATUS_LABEL[bid.status] ?? bid.status}
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

const ACTION_LABELS: Record<string, string> = {
  bid_submitted: "Bid submitted",
  bid_status_changed: "Bid status changed",
  pof_viewed: "Proof of funds viewed",
  classification_changed: "Classification changed",
  account_setting_changed: "Account setting changed",
};

async function LogsTab() {
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
  });
  const buyers = await db.buyerRegistration.findMany({
    select: { id: true, fullName: true, email: true },
  });
  const buyerById = new Map(buyers.map((b) => [b.id, b]));

  return (
    <section aria-label="Audit log">
      <p className="text-[0.85rem] leading-[1.8] text-charcoal mb-8">
        The last {logs.length} audit events: bid submissions and status changes,
        proof-of-funds views, classification changes and account setting
        changes.
      </p>
      {logs.length === 0 ? (
        <p className="border border-hairline bg-white p-6 text-[0.9rem] text-charcoal">
          No audit events yet.
        </p>
      ) : (
        <div className="border border-hairline bg-white overflow-x-auto">
          <table className="w-full text-[0.8rem]">
            <thead>
              <tr className="border-b border-hairline text-left">
                <th className="p-3 font-display text-[0.5rem] tracking-[0.2em] uppercase text-gold">
                  When
                </th>
                <th className="p-3 font-display text-[0.5rem] tracking-[0.2em] uppercase text-gold">
                  Buyer
                </th>
                <th className="p-3 font-display text-[0.5rem] tracking-[0.2em] uppercase text-gold">
                  Action
                </th>
                <th className="p-3 font-display text-[0.5rem] tracking-[0.2em] uppercase text-gold">
                  Property
                </th>
                <th className="p-3 font-display text-[0.5rem] tracking-[0.2em] uppercase text-gold">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => {
                const b = l.buyerId ? buyerById.get(l.buyerId) : null;
                return (
                  <tr key={l.id} className="border-b border-hairline align-top">
                    <td className="p-3 text-charcoal whitespace-nowrap">
                      {l.createdAt.toLocaleString("en-GB")}
                    </td>
                    <td className="p-3 text-green whitespace-nowrap">
                      {b ? b.fullName : "—"}
                    </td>
                    <td className="p-3 text-green whitespace-nowrap">
                      {ACTION_LABELS[l.action] ?? l.action}
                    </td>
                    <td className="p-3 text-charcoal">{l.propertySlug ?? "—"}</td>
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
