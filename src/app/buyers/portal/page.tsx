import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getBuyerSessionId } from "@/lib/buyer/session";
import {
  classificationDef,
  canAccessVault,
} from "@/lib/buyer/qualification";
import {
  BUYER_TYPES,
  ID_TYPES,
  ACQUISITION_TIMELINES,
  FUNDING_PREFERENCES,
  POF_TYPES,
} from "@/lib/buyer/constants";
import { ClassificationLadder } from "@/components/buyers/ClassificationLadder";
import { SignOutButton } from "@/components/buyers/SignOutButton";
import { Container } from "@/components/ui/Container";
import { formatCurrency, formatDate } from "@/lib/format";
import { getPropertyBySlug } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buyer portal | Murivest Group Ltd",
  robots: { index: false, follow: false },
};

type OptionList = readonly { value: string; label: string }[];
function labelOf(list: OptionList, value: string | null) {
  if (!value) return "—";
  return list.find((i) => i.value === value)?.label ?? value;
}

export default async function BuyerPortalPage() {
  const buyerId = await getBuyerSessionId();
  if (!buyerId) redirect("/buyers/sign-in");

  const buyer = await db.buyerRegistration.findUnique({
    where: { id: buyerId },
  });
  if (!buyer) redirect("/buyers/sign-in");

  const [notifications, grants, ndas, requests] = await Promise.all([
    db.vaultNotification.findMany({
      where: { buyerId },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    db.vaultAccessGrant.findMany({
      where: { buyerId },
      orderBy: { grantedAt: "desc" },
    }),
    db.ndaAcceptance.findMany({ where: { buyerId } }),
    db.vaultAccessLog.findMany({
      where: { buyerId, action: "access_requested" },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const def = classificationDef(buyer.classification);
  const qualified = canAccessVault(buyer.classification);
  const unread = notifications.filter((n) => !n.readAt).length;

  /* Resolve property titles from Sanity where possible. */
  const grantSlugs = [...new Set(grants.map((g) => g.propertySlug))];
  const titles = new Map<string, string>();
  await Promise.all(
    grantSlugs.slice(0, 20).map(async (slug) => {
      try {
        const p = await getPropertyBySlug(slug);
        titles.set(slug, p?.title ?? slug);
      } catch {
        titles.set(slug, slug);
      }
    })
  );

  const activeGrants = grants.filter(
    (g) => g.revokedAt === null && (!g.expiresAt || g.expiresAt.getTime() > Date.now())
  );
  const ndaBySlug = new Map(ndas.map((n) => [n.propertySlug, n]));
  const requestSlugs = new Set(requests.map((r) => r.propertySlug));

  const owners: { name: string; share: number }[] = buyer.beneficialOwners
    ? (JSON.parse(buyer.beneficialOwners) as { name: string; share: number }[])
    : [];
  const assetClasses: string[] = buyer.assetClasses
    ? (JSON.parse(buyer.assetClasses) as string[])
    : [];

  return (
    <Container className="py-14 md:py-20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-6 mb-12">
          <div>
            <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-3">
              Buyer portal
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-light text-green leading-[1.15] mb-3">
              {buyer.fullName}
            </h1>
            <p className="text-[0.85rem] text-charcoal">
              {labelOf(BUYER_TYPES, buyer.buyerType)} ·{" "}
              {buyer.countryOfResidence} · Registered{" "}
              {formatDate(buyer.createdAt.toISOString())}
            </p>
          </div>
          <SignOutButton />
        </div>

        {/* Status banner */}
        <div className="border border-green bg-cream p-6 md:p-8 mb-14">
          <span className="block font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-3">
            Current status
          </span>
          <p className="font-serif text-2xl font-light text-green mb-3">
            {def.label}
          </p>
          <p className="text-[0.9rem] leading-[1.8] text-ink mb-2">
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
        </div>

        <div className="grid gap-14 lg:grid-cols-[1.15fr_1fr]">
          {/* Left: profile + data rooms */}
          <div className="space-y-14">
            {/* Data rooms */}
            <section aria-label="Data rooms">
              <h2 className="font-serif text-2xl font-light text-green mb-6">
                Confidential data rooms
              </h2>
              {activeGrants.length === 0 ? (
                <div className="border border-hairline bg-white p-6">
                  <p className="text-[0.9rem] leading-[1.8] text-ink mb-4">
                    {qualified
                      ? "You have no active property authorisations yet. Open a lot and request data room access — authorisation is granted per property."
                      : "Data room authorisation is available to Qualified buyers. Your qualification review is in progress."}
                  </p>
                  <Link
                    href="/auctions"
                    className="font-display text-[0.6rem] tracking-[0.22em] uppercase text-green underline underline-offset-4 hover:text-gold transition-colors"
                  >
                    Browse auction lots
                  </Link>
                </div>
              ) : (
                <ul className="border border-hairline divide-y divide-hairline bg-white">
                  {activeGrants.map((g) => {
                    const nda = ndaBySlug.get(g.propertySlug);
                    return (
                      <li key={g.id} className="p-5">
                        <p className="font-body text-[0.95rem] text-green mb-2">
                          {titles.get(g.propertySlug) ?? g.propertySlug}
                        </p>
                        <p className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-charcoal mb-4">
                          Authorised {formatDate(g.grantedAt.toISOString())} ·{" "}
                          {nda
                            ? `NDA accepted ${formatDate(nda.acceptedAt.toISOString())}`
                            : "NDA pending"}
                        </p>
                        <Link
                          href={`/buyers/data-room/${g.propertySlug}`}
                          className="font-display text-[0.6rem] tracking-[0.22em] uppercase text-green border border-green px-5 py-2.5 inline-flex hover:bg-green hover:text-cream transition-colors"
                        >
                          {nda ? "Open data room" : "Review NDA & open"}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
              {/* Pending requests + revoked grants */}
              {requestSlugs.size > 0 ? (
                <div className="mt-6 border border-hairline bg-white p-5">
                  <p className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-charcoal mb-2">
                    Access requests with the team
                  </p>
                  <p className="text-[0.85rem] text-ink">
                    {[...requestSlugs]
                      .filter(
                        (s) => !activeGrants.some((g) => g.propertySlug === s)
                      )
                      .map((s) => titles.get(s) ?? s)
                      .join(" · ") || "None pending"}
                  </p>
                </div>
              ) : null}
              {grants.some((g) => g.revokedAt !== null) ? (
                <div className="mt-6 border border-hairline bg-white p-5">
                  <p className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-charcoal mb-2">
                    Withdrawn authorisations
                  </p>
                  <p className="text-[0.85rem] text-ink">
                    {grants
                      .filter((g) => g.revokedAt !== null)
                      .map(
                        (g) =>
                          `${titles.get(g.propertySlug) ?? g.propertySlug}${
                            g.revokedReason ? ` — ${g.revokedReason}` : ""
                          }`
                      )
                      .join(" · ")}
                  </p>
                </div>
              ) : null}
            </section>

            {/* Registration file */}
            <section aria-label="Registration file">
              <h2 className="font-serif text-2xl font-light text-green mb-6">
                Your registration file
              </h2>
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
                      `${labelOf(ID_TYPES, buyer.idType)} · ${buyer.idNumber}`,
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
                        ? `${formatCurrency(buyer.budgetMin, buyer.budgetCurrency)} – ${formatCurrency(buyer.budgetMax, buyer.budgetCurrency)}`
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
                    [
                      "Funding",
                      labelOf(FUNDING_PREFERENCES, buyer.fundingPreference),
                    ],
                    [
                      "Funding evidence",
                      buyer.pofType
                        ? `${labelOf(POF_TYPES, buyer.pofType)}${buyer.lenderName ? ` · ${buyer.lenderName}` : ""}${
                            buyer.pofFileName ? " · file on record" : ""
                          }`
                        : "On request",
                    ],
                    [
                      "Timeline",
                      labelOf(ACQUISITION_TIMELINES, buyer.acquisitionTimeline),
                    ],
                  ] as [string, string][]
                ).map(([k, v]) => (
                  <div key={k} className="grid sm:grid-cols-[200px_1fr] gap-2 p-4">
                    <dt className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-gold pt-1">
                      {k}
                    </dt>
                    <dd className="font-body text-[0.9rem] text-green break-words">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="text-[0.75rem] leading-[1.7] text-charcoal mt-4">
                To update your file, contact{" "}
                <a
                  href="mailto:office@murivest.com"
                  className="text-green underline underline-offset-4"
                >
                  office@murivest.com
                </a>
                . Proof-of-funds files are stored in the private document store
                and are not displayed on the website.
              </p>
            </section>
          </div>

          {/* Right: ladder + notifications */}
          <div className="space-y-14">
            <section aria-label="Qualification ladder">
              <h2 className="font-serif text-2xl font-light text-green mb-6">
                Qualification ladder
              </h2>
              <ClassificationLadder current={buyer.classification} />
            </section>

            <section aria-label="Notifications">
              <h2 className="font-serif text-2xl font-light text-green mb-6">
                Notifications{" "}
                {unread > 0 ? (
                  <span className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-gold align-middle">
                    {unread} new
                  </span>
                ) : null}
              </h2>
              {notifications.length === 0 ? (
                <p className="border border-hairline bg-white p-6 text-[0.85rem] leading-[1.7] text-charcoal">
                  No notifications yet. Addenda and document updates for your
                  authorised data rooms will appear here the moment they are
                  published.
                </p>
              ) : (
                <ul className="border border-hairline divide-y divide-hairline bg-white">
                  {notifications.map((n) => (
                    <li key={n.id} className={`p-4 ${!n.readAt ? "bg-cream" : ""}`}>
                      <p className="text-[0.85rem] text-green mb-1">{n.title}</p>
                      <p className="text-[0.8rem] leading-[1.7] text-ink mb-2">
                        {n.message}
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-charcoal">
                          {formatDate(n.createdAt.toISOString())}
                        </span>
                        <Link
                          href={`/buyers/data-room/${n.propertySlug}`}
                          className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-green underline underline-offset-4 hover:text-gold transition-colors"
                        >
                          Open data room
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </Container>
  );
}
