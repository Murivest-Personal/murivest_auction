"use client";

import { useEffect, useRef } from "react";
import 'mapbox-gl/dist/mapbox-gl.css';
import { brand } from "@/lib/brand";
import type { Coordinates } from "@/lib/types";

/** Mapbox map with the Murivest gold marker, popup, and the two
    Google Maps link buttons (features spec §5). Sans-serif is
    permitted only in the native Mapbox UI. */
export function PropertyMap({
  coordinates,
  title,
  address,
}: {
  coordinates?: Coordinates;
  title: string;
  address: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!ref.current || !token || !coordinates) return;
    let map: { remove: () => void } | null = null;
    let cancelled = false;

    import("mapbox-gl").then((mapboxgl) => {
      if (cancelled || !ref.current) return;
      mapboxgl.default.accessToken = token;
      const mapInstance = new mapboxgl.default.Map({
        container: ref.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [coordinates.lng, coordinates.lat],
        zoom: coordinates.zoom ?? 14,
        attributionControl: false,
      });
      mapInstance.addControl(
        new mapboxgl.default.NavigationControl({ showCompass: false }),
        "top-right"
      );
      mapInstance.addControl(new mapboxgl.default.AttributionControl({ compact: true }));

      new mapboxgl.default.Marker({ color: brand.gold })
        .setLngLat([coordinates.lng, coordinates.lat])
        .setPopup(
          new mapboxgl.default.Popup({ offset: 24 }).setHTML(
            `<strong>${escapeHtml(title)}</strong><br/><span>${escapeHtml(address)}</span>`
          )
        )
        .addTo(mapInstance);

      map = mapInstance;
    });

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [token, coordinates, title, address]);

  if (!coordinates) {
    return (
      <section id="location" className="scroll-mt-24">
        <span className="block font-body text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
          Location
        </span>
        <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-6">
          Location
        </h2>
        <p className="text-[0.95rem] leading-[1.8] text-ink max-w-[42rem]">
          {address}. Map coordinates have not been disclosed for this lot;
          buyers should confirm the exact position against the title plan in
          the legal pack.
        </p>
      </section>
    );
  }

  const gmapsSearch = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
  const gmapsDirections = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;

  return (
    <section id="location" className="scroll-mt-24">
      <span className="block font-body text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
        Location
      </span>
      <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-6">
        Location
      </h2>
      <p className="text-[0.95rem] leading-[1.8] text-ink mb-6 max-w-[42rem]">
        {address}
      </p>
      <div
        ref={ref}
        className="h-[280px] md:h-[360px] w-full border border-hairline"
        aria-label={`Map of ${title}`}
      />
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={gmapsSearch}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-2.5 text-[0.6rem] tracking-[0.22em] uppercase font-body text-green border border-green hover:bg-green hover:text-cream transition-colors"
        >
          Open in Google Maps
        </a>
        <a
          href={gmapsDirections}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-2.5 text-[0.6rem] tracking-[0.22em] uppercase font-body text-green border border-green hover:bg-green hover:text-cream transition-colors"
        >
          Get directions
        </a>
      </div>
    </section>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    (
      {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      } as Record<string, string>
    )[c]!
  );
}
