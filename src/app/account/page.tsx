import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
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
    label: "Routed to selling party",
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

export default async function AccountPage() {
  const buyerId = await getBuyerSessionId();
  if (!buyerId) redirect("/sign-in");

  const buyer = await db.buyerRegistration.findUnique({
    where: { id: buyerId },
  });
  if (!buyer) redirect("/sign-in");

  const [bids, savedLots] = await Promise.all([
    db.buyerBid.findMany({
      where: { buyerId },
      orderBy: { createdAt: "desc" },
    }),
    db.savedLot.findMany({
      where: { buyerId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const def = classificationDef(buyer.classification);

  /* Resolve saved / liked lots to titles and links. */
  const savedSlugs = [...new Set(savedLots.map((s) => s.propertySlug))];
  const lotsBySlug = new Map<string, { title: string; market: string } | null>();
  await Promise.all(
    savedSlugs.slice(0, 30).map(async (slug) => {
      try {
        const p = await getPropertyBySlug(slug);
        lotsBySlug.set(
          slug,
          p ? { title: p.title, market: p.market } : null
        );
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

  const savedList = savedLots.filter((s) => s.kind === "save");
  const likedList = savedLots.filter((s) => s.kind === "like");

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
              Your account
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

        {/* Verification status banner */}
        <div id="verification" className="border border-green bg-cream p-6 md:p-8 mb-14 scroll-mt-24">
          <span className="block font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-3">
            Verification status
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
          {/* Left: bids + saved lots + settings */}
          <div className="space-y-14">
            {/* Bids */}
            <section id="bids" aria-label="Your bids" className="scroll-mt-24">
              <h2 className="font-serif text-2xl font-light text-green mb-6">
                Your bids
              </h2>
              {bids.length === 0 ? (
                <div className="border border-hairline bg-white p-6">
                  <p className="text-[0.9rem] leading-[1.8] text-ink mb-4">
                    You have not submitted any bids yet. Open a lot and use
                    Submit a bid — bidding is exclusive to registered accounts,
                    and your details are taken from this profile.
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
                  {bids.map((b) => {
                    const s = BID_STATUS[b.status] ?? {
                      label: b.status,
                      note: "",
                    };
                    return (
                      <li key={b.id} className="p-5">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 mb-2">
                          <Link
                            href={`/auctions/${b.propertySlug}`}
                            className="font-body text-[0.95rem] text-green hover:text-gold transition-colors"
                          >
                            {b.propertyTitle}
                          </Link>
                          <span className="font-serif text-lg text-green">
                            {formatCurrency(b.bidAmount, b.bidCurrency)}
                          </span>
                        </div>
                        <p className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-gold mb-2">
                          {s.label} · {formatDate(b.createdAt.toISOString())} ·
                          ref {b.reference}
                        </p>
                        <p className="text-[0.8rem] leading-[1.7] text-charcoal">
                          {b.statusNote ?? s.note}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* Saved & liked lots */}
            <section aria-label="Saved and liked lots">
              <h2 className="font-serif text-2xl font-light text-green mb-6">
                Saved &amp; liked lots
              </h2>
              {savedList.length === 0 && likedList.length === 0 ? (
                <div className="border border-hairline bg-white p-6">
                  <p className="text-[0.9rem] leading-[1.8] text-ink mb-4">
                    Save or like lots from any property page — they are stored
                    here on your account.
                  </p>
                  <Link
                    href="/auctions"
                    className="font-display text-[0.6rem] tracking-[0.22em] uppercase text-green underline underline-offset-4 hover:text-gold transition-colors"
                  >
                    Browse auction lots
                  </Link>
                </div>
              ) : (
                <div className="space-y-8">
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

            {/* Settings */}
            <section id="settings" aria-label="Alert settings" className="scroll-mt-24">
              <h2 className="font-serif text-2xl font-light text-green mb-6">
                Settings
              </h2>
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
            </section>
          </div>

          {/* Right: ladder + registration file */}
          <div className="space-y-14">
            <section aria-label="Qualification ladder">
              <h2 className="font-serif text-2xl font-light text-green mb-6">
                Qualification ladder
              </h2>
              <ClassificationLadder current={buyer.classification} />
            </section>

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
        </div>
      </div>
    </Container>
  );
}
