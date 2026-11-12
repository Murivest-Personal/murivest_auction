"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/lib/brand";
import type { Property } from "@/lib/types";
import { formatDate } from "@/lib/format";

/** Sticky sidebar — status, auction date countdown, guide price,
    CTAs, share (features spec §3.8). */
export function AuctionSidebar({ property }: { property: Property }) {
  return (
    <aside className="space-y-8">
      <div className="border border-hairline bg-white p-8">
        <dl className="space-y-5">
          <div>
            <dt className="text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-1">
              Guide price
            </dt>
            <dd className="font-serif text-3xl font-light text-green">
              {property.guidePrice ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-1">
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
              <dt className="text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-1">
                Reserve price
              </dt>
              <dd className="font-body text-[0.95rem] text-green">
                {property.reservePrice}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-1">
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
              className="block text-center px-8 py-4 text-[0.65rem] tracking-[0.25em] uppercase font-display bg-green text-cream hover:bg-gold transition-colors"
            >
              View similar lots
            </a>
          ) : (
            <a
              href={property.status === "under-offer" ? "#selling-party" : "#register-your-bid"}
              className="block text-center px-8 py-4 text-[0.65rem] tracking-[0.25em] uppercase font-display bg-green text-cream hover:bg-gold transition-colors"
            >
              {property.status === "under-offer"
                ? "Request notification"
                : "Register your bid"}
            </a>
          )}
          <a
            href={`mailto:${SITE.officeEmail}?subject=${encodeURIComponent(
              `Legal pack — ${property.referenceCode ?? property.title}`
            )}`}
            className="block text-center px-8 py-4 text-[0.65rem] tracking-[0.25em] uppercase font-body text-green border border-green hover:bg-green hover:text-cream transition-colors"
          >
            Request legal pack
          </a>
        </div>

        <ShareButtons property={property} />
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

function ShareButtons({ property }: { property: Property }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/auctions/${property.slug}`;
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
    const target =
      url ?? `${window.location.origin}/auctions/${property.slug}`;
    try {
      await navigator.clipboard.writeText(target);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="mt-6 pt-6 border-t border-hairline flex items-center gap-6">
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
