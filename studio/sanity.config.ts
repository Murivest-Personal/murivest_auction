import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";   // ← was deskTool
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "../src/sanity/schemaTypes";
import { structure } from "./structure";

// Vite only exposes env vars to the browser if they are prefixed with SANITY_STUDIO_.
const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";

// Fail loudly at startup instead of getting "Configuration must contain `projectId`" later.
if (!projectId) {
  throw new Error(
    "Missing SANITY_STUDIO_PROJECT_ID. Add it to studio/.env " +
    "(e.g. SANITY_STUDIO_PROJECT_ID=abc123) and restart `npm run dev`."
  );
}

export default defineConfig({
  name: "murivest-auctions",
  title: "Murivest Auctions",

  projectId,
  dataset,

  // Local dev: http://localhost:3333. When deploying to auctions.murivest.com/studio,
  // change to "/studio" (or drive it from an env var).
  basePath: "/",

  plugins: [structureTool({ structure }), visionTool()],

  schema: { types: schemaTypes },
});