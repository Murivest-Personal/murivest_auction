/* JSON-LD builders — features spec §7.2. */

import type { Article, Faq, Property, PropertyCardData } from "@/lib/types";
import { SITE } from "@/lib/brand";
import { statusLabel } from "@/lib/format";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    alternateName: SITE.siteName,
    url: SITE.url,
    logo: `${SITE.url}/icon.svg`,
    email: SITE.officeEmail,
    telephone: SITE.officePhone,
    description:
      "Murivest Group Ltd provides commercial real estate services and publishes auction intelligence across East Africa, the United Kingdom and international markets.",
    sameAs: [SITE.mainSite, SITE.linkedin],
    address: [
      {
        "@type": "PostalAddress",
        addressLocality: "Nairobi",
        addressCountry: "KE",
      },
      {
        "@type": "PostalAddress",
        addressLocality: "London",
        addressCountry: "GB",
      },
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.siteName,
    url: SITE.url,
    publisher: { "@type": "Organization", name: SITE.name },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url}/auctions?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE.url}${item.url}`,
    })),
  };
}

export function collectionPageJsonLd(name: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: `${SITE.url}${path}`,
    isPartOf: { "@type": "WebSite", name: SITE.siteName, url: SITE.url },
  };
}

export function realEstateListingJsonLd(p: Property) {
  const currency = p.facts.currency ?? (p.market === "kenya" ? "KES" : "GBP");
  const numericPrice = p.facts.price;
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.title,
    url: `${SITE.url}/auctions/${p.slug}`,
    description: p.description[0] ?? p.title,
    datePosted: p.publishedAt,
    image: p.mainImage ? `${SITE.url}${p.mainImage.url}` : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: p.location,
      addressRegion: p.region,
      addressCountry: p.market === "kenya" ? "KE" : "GB",
    },
    ...(p.coordinates
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: p.coordinates.lat,
            longitude: p.coordinates.lng,
          },
        }
      : {}),
    offers: numericPrice
      ? {
          "@type": "Offer",
          price: numericPrice,
          priceCurrency: currency,
          availability:
            p.status === "sold"
              ? "https://schema.org/SoldOut"
              : "https://schema.org/InStock",
        }
      : undefined,
    seller: { "@type": "Organization" as const, name: p.sellingParty },
  };
}

export function auctionEventJsonLd(lot: PropertyCardData) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `Auction of ${lot.title}`,
    startDate: lot.auctionDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: lot.location,
      address: {
        "@type": "PostalAddress",
        addressLocality: lot.location,
        addressCountry: lot.market === "kenya" ? "KE" : "GB",
      },
    },
    organizer: {
      "@type": "Organization",
      name: lot.auctionHouse ?? lot.sellingParty,
    },
    url: `${SITE.url}/auctions/${lot.slug}`,
  };
}

export function faqPageJsonLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function articleJsonLd(a: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt,
    datePublished: a.publishedAt,
    dateModified: a.publishedAt,
    author: {
      "@type": "Organization",
      name: a.author,
      url: SITE.url,
      sameAs: [SITE.linkedin, SITE.mainSite],
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: `${SITE.url}/icon.svg` },
    },
    mainEntityOfPage: `${SITE.url}/intelligence/${a.slug}`,
    isPartOf: { "@type": "WebSite", name: SITE.siteName, url: SITE.url },
  };
}

export function webApplicationJsonLd(name: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url: `${SITE.url}${path}`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    publisher: { "@type": "Organization", name: SITE.name },
  };
}
