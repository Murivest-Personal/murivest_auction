import { createImageUrlBuilder } from "@sanity/image-url";
import type { PropertyImage } from "@/lib/types";

const builder = createImageUrlBuilder({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "unset",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
});

/** Normalise a Sanity image object (or plain url string) to { url, alt }. */
export function toPropertyImage(
  image: unknown,
  fallbackAlt = ""
): PropertyImage | null {
  if (!image || typeof image !== "object") return null;
  const obj = image as Record<string, unknown>;
  const alt =
    typeof obj.alt === "string" && obj.alt.length > 0 ? obj.alt : fallbackAlt;
  try {
    return { url: builder.image(image as never).url(), alt };
  } catch {
    return null;
  }
}
