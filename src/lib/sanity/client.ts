import { createClient, type SanityClient } from "next-sanity";

export function sanityConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
}

let cached: SanityClient | null = null;

/** Lazily created Sanity client — only called when configured. */
export function getSanity(): SanityClient {
  if (cached) return cached;
  cached = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2025-01-01",
    useCdn: true,
    token: process.env.SANITY_API_READ_TOKEN,
  });
  return cached;
}
