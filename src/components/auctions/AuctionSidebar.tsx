"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/brand";
import type { Property } from "@/lib/types";
import { formatDate } from "@/lib/format";

/** Sticky sidebar — status, auction date countdown, guide price,
    CTAs (Submit a bid near the property details), and the
    save / like / share actions stored on the signed-in account. */
export function AuctionSidebar({ property }: { property: Property }) {
  return (
    <aside className="space-y-8">
      <div className="border border-hairline bg-white p-8">
        <dl className="space-y-5">
          <div>
            <dt className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-1">
              Guide price
            </dt>
            <dd className="font-serif text-3xl font-light text-green price">
              {property.guidePrice ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-1">
              Auction date
            </dt>
            <dd className="font-body text-[0.95rem] text-green">
              {property.auctionDate ? (
                <>
                  {formatDate(property.auctionDate)}
                  <Countdown iso={property.auctionDate} />
                </>
              ) : (
                "Offered privately"
              )}
            </dd>
          </div>
          {property.reservePrice ? (
            <div>
              <dt className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-1">
                Reserve price
              </dt>
              <dd className="font-body text-[0.95rem] text-green price">
                {property.reservePrice}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-1">
              Selling party
            </dt>
            <dd className="font-body text-[0.95rem] text-green">
              {property.sellingParty}
            </dd>
          </div>
        </dl>

        <div className="mt-8 pt-8 border-t border-hairline space-y-4">
          {property.status === "sold" ? (
            <a
              href={`/${property.market}`}
              className="btn btn-primary block text-center"
            >
              View similar lots
            </a>
          ) : (
            <a
              href={property.status === "under-offer" ? "#selling-party" : "#submit-a-bid"}
              className="btn btn-primary block text-center"
            >
              {property.status === "under-offer"
                ? "Request notification"
                : "Submit a bid"}
            </a>
          )}
          <a
            href={`mailto:${SITE.officeEmail}?subject=${encodeURIComponent(
              `Legal pack — ${property.referenceCode ?? property.title}`
            )}`}
            className="btn btn-secondary block text-center"
          >
            Request legal pack
          </a>
        </div>

        <LotActions property={property} />
      </div>
    </aside>
  );
}

function Countdown({ iso }: { iso: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // First update is deferred so the server-rendered HTML and the
    // hydrated client agree until the countdown begins.
    const t0 = setTimeout(() => setNow(Date.now()), 0);
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      clearTimeout(t0);
      clearInterval(t);
    };
  }, []);

  if (now == null) return null;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target) || target <= now) return null;
  const days = Math.floor((target - now) / 86_400_000);
  const hours = Math.floor(((target - now) % 86_400_000) / 3_600_000);
  return (
    <span className="block mt-1 text-[0.6rem] tracking-[0.25em] uppercase text-charcoal">
      {days > 0 ? `${days} days ${hours} hours to auction` : `${hours} hours to auction`}
    </span>
  );
}

/** Save / like / share row. Save and like are stored on the
    signed-in account (toggled through /api/account/saved-lots);
    share and copy-link work for everyone. Signed-out visitors are
    taken to the sign-in page with a redirect back to this lot. */
function LotActions({ property }: { property: Property }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const lotUrl = () =>
    `${window.location.origin}/auctions/${property.slug}`;
  const signInHref = `/sign-in?next=${encodeURIComponent(
    `/auctions/${property.slug}`
  )}`;

  /* Fetch this account's state for the lot once on mount — the
     lot page itself stays ISR-cacheable. */
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/account/saved-lots?slug=${encodeURIComponent(property.slug)}`)
      .then((r) => r.json())
      .then((data: { saved?: boolean; liked?: boolean }) => {
        if (cancelled) return;
        setSaved(Boolean(data.saved));
        setLiked(Boolean(data.liked));
        setSignedIn(Boolean(data.saved || data.liked) || null);
        fetch("/api/account/session")
          .then((r) => r.json())
          .then((s: { signedIn: boolean }) => {
            if (!cancelled) setSignedIn(s.signedIn);
          })
          .catch(() => {
            if (!cancelled) setSignedIn(false);
          });
      })
      .catch(() => {
        if (!cancelled) setSignedIn(false);
      });
    return () => {
      cancelled = true;
    };
  }, [property.slug]);

  async function toggle(kind: "save" | "like") {
    if (signedIn === false) {
      window.location.href = signInHref;
      return;
    }
    if (busy) return;
    setBusy(true);
    /* Optimistic toggle; reverted on failure. */
    const prev = kind === "save" ? saved : liked;
    if (kind === "save") setSaved(!prev);
    else setLiked(!prev);
    try {
      const res = await fetch("/api/account/saved-lots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_slug: property.slug, kind }),
      });
      if (!res.ok) {
        if (kind === "save") setSaved(prev);
        else setLiked(prev);
        if (res.status === 401) window.location.href = signInHref;
      }
    } catch {
      if (kind === "save") setSaved(prev);
      else setLiked(prev);
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    const url = lotUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: property.title,
          url,
        });
      } catch {
        /* user dismissed */
      }
    } else {
      await copy(url);
    }
  }

  async function copy(url?: string) {
    const target = url ?? lotUrl();
    try {
      await navigator.clipboard.writeText(target);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="mt-6 pt-6 border-t border-hairline flex flex-wrap items-center gap-x-6 gap-y-3">
      <button
        type="button"
        onClick={() => toggle("save")}
        aria-pressed={signedIn ? saved : undefined}
        className={`font-display text-[0.6rem] tracking-[0.25em] uppercase transition-colors ${
          saved ? "text-green" : "text-gold hover:text-green"
        }`}
      >
        {saved ? "★ Saved" : "☆ Save"}
      </button>
      <button
        type="button"
        onClick={() => toggle("like")}
        aria-pressed={signedIn ? liked : undefined}
        className={`font-display text-[0.6rem] tracking-[0.25em] uppercase transition-colors ${
          liked ? "text-green" : "text-gold hover:text-green"
        }`}
      >
        {liked ? "♥ Liked" : "♡ Like"}
      </button>
      <button
        type="button"
        onClick={share}
        className="font-display text-[0.6rem] tracking-[0.25em] uppercase text-gold hover:text-green transition-colors"
      >
        Share
      </button>
      <button
        type="button"
        onClick={() => copy()}
        className="font-display text-[0.6rem] tracking-[0.25em] uppercase text-gold hover:text-green transition-colors"
      >
        {copied ? "Link copied" : "Copy link"}
      </button>
      <span className="sr-only" role="status">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </div>
  );
}
