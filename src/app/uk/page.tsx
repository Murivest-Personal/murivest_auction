import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { MarketHubPage } from "@/components/auctions/MarketHubPage";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "UK Commercial Property Auctions | Investment Lots | Murivest",
  description:
    "Commercial investment property auctions across the UK. London and regional lots, guide prices, auction dates and legal pack status. Verified listings from Murivest Group Ltd.",
  path: "/uk",
  ogImage: "/images/hero-uk.webp",
});

export default async function UKHubPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <MarketHubPage
      market="uk"
      searchParams={searchParams}
      heroImage="/images/hero-uk.webp"
      heroAlt="London skyline with the City of London office towers at dusk"
    />
  );
}
