"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PropertyImage, PropertyStatus } from "@/lib/types";
import { NewListingBadge, StatusBadge } from "@/components/ui/StatusBadge";
import { marketLabel } from "@/lib/format";
import { formatDateShort } from "@/lib/format";

export function GalleryHero({
  title,
  location,
  assetType,
  market,
  status,
  auctionDate,
  mainImage,
  gallery,
  isNewListing,
  subline,
}: {
  title: string;
  location: string;
  assetType: string;
  market: string;
  status: PropertyStatus;
  auctionDate?: string;
  mainImage: PropertyImage | null;
  gallery: PropertyImage[];
  isNewListing?: boolean;
  subline: string;
}) {
  const images = gallery.length > 0 ? gallery : mainImage ? [mainImage] : [];
  const [active, setActive] = useState(0);
  const current = images[Math.min(active, images.length - 1)];

  return (
    <section className="relative">
      <div className="relative h-[46vh] md:h-[60vh] bg-sand">
        {current ? (
          <Image
            key={current.url}
            src={current.url}
            alt={current.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-green/10 via-green/40 to-green/75" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 pb-8 md:pb-10">
            <div className="flex flex-wrap gap-2 mb-5">
              <StatusBadge status={status} />
              {isNewListing ? <NewListingBadge /> : null}
              <span className="inline-block px-3 py-1.5 text-[0.6rem] tracking-[0.2em] uppercase font-body bg-cream text-green">
                {marketLabel(market)}
              </span>
              {auctionDate ? (
                <span className="inline-block px-3 py-1.5 text-[0.6rem] tracking-[0.2em] uppercase font-body bg-green/90 text-cream">
                  Auction {formatDateShort(auctionDate)}
                </span>
              ) : null}
            </div>
            <h1 className="font-serif font-light text-cream leading-[1.2] text-[clamp(2rem,3.5vw,3.2rem)] max-w-[48rem]">
              {title}
            </h1>
            <p className="mt-3 font-body text-[0.9rem] text-[color:var(--mv-on-dark)]">
              {subline}
            </p>
          </div>
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 ? (
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
          <div
            className="flex gap-2 overflow-x-auto py-4"
            role="tablist"
            aria-label="Property gallery"
          >
            {images.map((img, i) => (
              <button
                key={img.url + i}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`View image ${i + 1} of ${images.length}`}
                onClick={() => setActive(i)}
                className={cn(
                  "relative flex-shrink-0 w-28 h-[4.2rem] overflow-hidden border transition-colors",
                  i === active ? "border-gold" : "border-hairline hover:border-sand"
                )}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
