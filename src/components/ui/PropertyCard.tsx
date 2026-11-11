import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { PropertyCardData } from "@/lib/types";
import { NewListingBadge, StatusBadge } from "./StatusBadge";
import { formatDateShort } from "@/lib/format";
import { SITE } from "@/lib/brand";

/** The four-state property card used across every grid
    (brand guide §5.6, features spec §4). */
export function PropertyCard({
  property,
  className,
}: {
  property: PropertyCardData;
  className?: string;
}) {
  const p = property;

  const cta =
    p.status === "under-offer"
      ? {
          label: "Request notification",
          href: `mailto:${SITE.officeEmail}?subject=${encodeURIComponent(
            `Notification request — ${p.referenceCode ?? p.title}`
          )}`,
        }
      : p.status === "sold"
        ? { label: "View similar lots", href: `/${p.market}` }
        : { label: "View lot", href: `/auctions/${p.slug}` };

  return (
    <article className={cn("flex flex-col bg-white", className)}>
      <div className="relative aspect-[16/10] overflow-hidden bg-sand">
        {p.mainImage ? (
          <Image
            src={p.mainImage.url}
            alt={p.mainImage.alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
          />
        ) : null}
        <div className="absolute top-4 left-4 flex gap-2">
          <StatusBadge status={p.status} />
          {p.isNewListing ? <NewListingBadge /> : null}
        </div>
      </div>

      <div className="p-6 md:p-8 flex flex-col flex-1">
        <span className="text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-2">
          {p.referenceCode ? `${p.referenceCode} · ` : ""}
          {p.assetType}
        </span>
        <h3 className="font-serif text-xl font-normal text-green mb-1">
          {p.title}
        </h3>
        <p className="text-[0.85rem] text-charcoal font-body mb-6">{p.location}</p>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 mb-6">
          <div>
            <dt className="text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-1">
              Guide
            </dt>
            <dd className="text-[0.9rem] text-green font-body">{p.guidePrice ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-1">
              {p.assetType === "Land" ? "Area" : "Size"}
            </dt>
            <dd className="text-[0.9rem] text-green font-body">{p.size ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-1">
              Yield
            </dt>
            <dd className="text-[0.9rem] text-green font-body">{p.yield ?? "—"}</dd>
          </div>
          {p.status === "for-sale-by-auction" && p.auctionDate ? (
            <div>
              <dt className="text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-1">
                Auction date
              </dt>
              <dd className="text-[0.9rem] text-green font-body">
                {formatDateShort(p.auctionDate)}
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-auto pt-6 border-t border-hairline">
          {cta.href.startsWith("mailto:") ? (
            <a
              href={cta.href}
              className="text-[0.6rem] tracking-[0.3em] uppercase text-gold hover:text-green transition-colors"
            >
              {cta.label} →
            </a>
          ) : (
            <Link
              href={cta.href}
              className="text-[0.6rem] tracking-[0.3em] uppercase text-gold hover:text-green transition-colors"
            >
              {cta.label} →
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
