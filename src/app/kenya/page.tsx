import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { MarketHubPage } from "@/components/auctions/MarketHubPage";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Kenya Commercial Property Auctions | Bank Sales & Receiver Sales | Murivest",
  description:
    "Verified commercial property auctions across Kenya — Nairobi, Mombasa, Kisumu, Nakuru. Bank sales, receiver sales and private treaty lots. Guide prices, auction dates and legal pack status.",
  path: "/kenya",
  ogImage: "/images/hero-kenya.webp",
});

export default async function KenyaHubPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <MarketHubPage
      market="kenya"
      searchParams={searchParams}
      heroImage="/images/hero-kenya.webp"
      heroAlt="Nairobi skyline with the Kenyatta International Convention Centre at dusk"
    />
  );
}
