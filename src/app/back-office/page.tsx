import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { isAdminAuthenticated, usingDefaultAdminPasscode } from "@/lib/buyer/session";
import {
  classificationLabel,
  canAccessVault,
} from "@/lib/buyer/qualification";
import { getDocumentsForProperty } from "@/lib/vault/service";
import { getProperties } from "@/lib/content";
import { AdminGate, AdminSignOutButton } from "@/components/admin/AdminGate";
import { BuyerClassificationControls } from "@/components/admin/BuyerClassificationControls";
import { DocumentManager } from "@/components/admin/DocumentManager";
import { GrantPanel } from "@/components/admin/GrantPanel";
import { NewDocumentForm } from "@/components/admin/NewDocumentForm";
import { Container } from "@/components/ui/Container";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Back office | Murivest Group Ltd",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Search = Promise<{ tab?: string; property?: string }>;

const TABS = [
  { key: "buyers", label: "Buyers & qualification" },
  { key: "data-rooms", label: "Data rooms" },
  { key: "logs", label: "Access logs" },
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

  const { tab = "buyers", property } = await searchParams;
  const activeTab = TABS.some((t) => t.key === tab) ? tab : "buyers";

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
        {activeTab === "data-rooms" ? (
          <DataRoomsTab buyers={buyers} selectedSlug={property ?? null} />
        ) : null}
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
  return (
    <section aria-label="Buyers and qualification">
      <p className="text-[0.85rem] leading-[1.8] text-charcoal mb-8">
        {buyers.length} registered buyer{buyers.length === 1 ? "" : "s"}.
        Classification changes are audit-logged. Proof-of-funds files open from
        the private store; every view is logged.
      </p>
      {buyers.length === 0 ? (
        <p className="border border-hairline bg-white p-6 text-[0.9rem] text-charcoal">
          No buyer registrations yet.
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
                    {canAccessVault(b.classification) ? (
                      <span className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-green border border-green px-2 py-0.5">
                        Vault eligible
                      </span>
                    ) : null}
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
                        {formatCurrency(b.budgetMin, b.budgetCurrency)} –{" "}
                        {formatCurrency(b.budgetMax, b.budgetCurrency)}
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

/* ================= Data rooms tab ================= */

async function DataRoomsTab({
  buyers,
  selectedSlug,
}: {
  buyers: BuyerRow[];
  selectedSlug: string | null;
}) {
  const [documents, grants, ndas, requests, lots] = await Promise.all([
    db.vaultDocument.findMany({ orderBy: { createdAt: "desc" } }),
    db.vaultAccessGrant.findMany({ orderBy: { grantedAt: "desc" } }),
    db.ndaAcceptance.findMany(),
    db.vaultAccessLog.findMany({
      where: { action: "access_requested" },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    getProperties({ market: "all" }).catch(() => []),
  ]);

  const buyerById = new Map(buyers.map((b) => [b.id, b]));
  const ndaKey = (buyerId: string, slug: string) => `${buyerId}:${slug}`;
  const ndaMap = new Map(ndas.map((n) => [ndaKey(n.buyerId, n.propertySlug), n]));

  const slugSet = new Set<string>(documents.map((d) => d.propertySlug));
  if (selectedSlug) slugSet.add(selectedSlug);
  const slugs = [...slugSet];

  /* Pending requests per slug (no active grant since the request). */
  const pendingBySlug = new Map<string, { buyer: string; classification: string; at: string }[]>();
  for (const r of requests) {
    const active = grants.find(
      (g) =>
        g.buyerId === r.buyerId &&
        g.propertySlug === r.propertySlug &&
        g.revokedAt === null &&
        g.grantedAt > r.createdAt
    );
    if (active) continue;
    const list = pendingBySlug.get(r.propertySlug) ?? [];
    const b = buyerById.get(r.buyerId);
    list.push({
      buyer: b ? `${b.fullName} (${b.email})` : r.buyerId,
      classification: b ? classificationLabel(b.classification) : "—",
      at: r.createdAt.toISOString(),
    });
    pendingBySlug.set(r.propertySlug, list);
  }

  const selected = selectedSlug && slugs.includes(selectedSlug) ? selectedSlug : null;
  const selectedDocuments = selected
    ? await getDocumentsForProperty(selected)
    : null;

  const grantRows = selected
    ? grants
        .filter((g) => g.propertySlug === selected)
        .map((g) => {
          const b = buyerById.get(g.buyerId);
          const nda = ndaMap.get(ndaKey(g.buyerId, selected));
          return {
            id: g.id,
            buyerId: g.buyerId,
            buyerName: b?.fullName ?? g.buyerId,
            buyerEmail: b?.email ?? "",
            classification: b?.classification ?? "",
            classificationLabel: b ? classificationLabel(b.classification) : "—",
            grantedAt: g.grantedAt.toISOString(),
            revokedAt: g.revokedAt ? g.revokedAt.toISOString() : null,
            revokedReason: g.revokedReason,
            ndaAcceptedAt: nda ? nda.acceptedAt.toISOString() : null,
          };
        })
    : [];

  return (
    <section aria-label="Data rooms">
      {/* Property list */}
      <div className="mb-10">
        <p className="text-[0.85rem] leading-[1.8] text-charcoal mb-4">
          Each lot has its own data room with separate permissions. Existing
          data rooms:{slugs.length > 0 ? "" : " none yet."}
        </p>
        {slugs.length > 0 ? (
          <ul className="flex flex-wrap gap-3 mb-6">
            {slugs.map((s) => (
              <li key={s}>
                <Link
                  href={`/back-office?tab=data-rooms&property=${s}`}
                  aria-current={selected === s ? "page" : undefined}
                  className={`inline-block font-display text-[0.6rem] tracking-[0.2em] uppercase px-4 py-2 border transition-colors ${
                    selected === s
                      ? "border-green bg-green text-cream"
                      : "border-hairline text-green hover:border-green"
                  }`}
                >
                  {s}
                  {pendingBySlug.get(s)?.length ? (
                    <span className="ml-2 text-gold">
                      {pendingBySlug.get(s)!.length} request
                      {pendingBySlug.get(s)!.length === 1 ? "" : "s"}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        {lots.length > 0 ? (
          <p className="text-[0.8rem] text-charcoal">
            Published Sanity lots:{" "}
            {lots
              .slice(0, 8)
              .map((l) => l.slug)
              .join(" · ")}
          </p>
        ) : (
          <p className="text-[0.8rem] text-charcoal">
            No Sanity lots are published (or Sanity is not configured). You can
            still create a data room by entering the lot slug directly — it
            will activate when the lot is published.
          </p>
        )}
      </div>

      <NewDocumentForm defaultSlug={selected ?? undefined} />

      {selected && selectedDocuments ? (
        <div className="mt-12 space-y-10">
          <div>
            <h2 className="font-serif text-2xl font-light text-green mb-2">
              {selected}
            </h2>
            <p className="text-[0.8rem] text-charcoal mb-6">
              {selectedDocuments.length} document
              {selectedDocuments.length === 1 ? "" : "s"} in this data room.
            </p>

            {/* Pending access requests */}
            {pendingBySlug.get(selected)?.length ? (
              <div className="border border-gold bg-cream p-5 mb-8">
                <p className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-3">
                  Access requests awaiting authorisation
                </p>
                <ul className="space-y-1.5 text-[0.85rem] text-ink">
                  {pendingBySlug.get(selected)!.map((r, i) => (
                    <li key={i}>
                      {r.buyer} — {r.classification} — requested{" "}
                      {formatDate(r.at)}
                    </li>
                  ))}
                </ul>
                <p className="text-[0.75rem] text-charcoal mt-3">
                  Grant access to these buyers in the authorisation panel below.
                </p>
              </div>
            ) : null}

            <DocumentManager
              propertySlug={selected}
              documents={selectedDocuments}
            />
          </div>

          <GrantPanel
            propertySlug={selected}
            buyers={buyers.map((b) => ({
              id: b.id,
              fullName: b.fullName,
              classification: b.classification,
              classificationLabel: classificationLabel(b.classification),
              qualified: canAccessVault(b.classification),
            }))}
            grants={grantRows}
          />
        </div>
      ) : (
        <p className="border border-hairline bg-white p-6 mt-10 text-[0.85rem] text-charcoal">
          Select a data room above (or create one) to manage documents,
          download permissions and per-property buyer authorisations.
        </p>
      )}
    </section>
  );
}

/* ================= Logs tab ================= */

const ACTION_LABELS: Record<string, string> = {
  nda_accepted: "NDA accepted",
  access_requested: "Access requested",
  view: "Document viewed",
  download: "Document downloaded",
  download_denied: "Download denied",
  view_denied: "View denied",
  grant: "Access granted",
  revoke: "Access revoked",
  version_published: "Version published",
  document_created: "Document setting changed",
  pof_viewed: "Proof of funds viewed",
  classification_changed: "Classification changed",
};

async function LogsTab() {
  const logs = await db.vaultAccessLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
  });
  const buyers = await db.buyerRegistration.findMany({
    select: { id: true, fullName: true, email: true },
  });
  const buyerById = new Map(buyers.map((b) => [b.id, b]));

  return (
    <section aria-label="Access logs">
      <p className="text-[0.85rem] leading-[1.8] text-charcoal mb-8">
        The last {logs.length} audit events: NDA acceptances, document views
        and downloads (including denials), grants, revocations, published
        versions, proof-of-funds views and classification changes.
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
