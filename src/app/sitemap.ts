import type { MetadataRoute } from "next";
import { SITE } from "@/lib/brand";
import { getAllSlugs, getArticles } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, articles] = await Promise.all([getAllSlugs(), getArticles()]);
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/auctions`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/kenya`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/uk`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/calendar`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE.url}/how-auctions-work`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/how-auctions-work/buying`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/how-auctions-work/selling`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/how-auctions-work/legal-pack`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/how-auctions-work/glossary`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/intelligence`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${SITE.url}/buyer-fees`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/faqs`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/tools`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/tools/return-calculator`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/tools/underwriting-calculator`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/tools/loan-repayment-calculator`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/services`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/auction-disclaimers`, changeFrequency: "yearly", priority: 0.3 },
  ];

  return [
    ...staticRoutes.map((r) => ({ ...r, lastModified: now })),
    ...slugs.map((slug) => ({
      url: `${SITE.url}/auctions/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...articles.map((a) => ({
      url: `${SITE.url}/intelligence/${a.slug}`,
      lastModified: new Date(a.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
