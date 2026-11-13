import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";
import { structure } from "./structure";

export default defineConfig({
  name: "murivest-auctions",
  title: "Murivest Auctions",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  // For local development the studio runs at http://localhost:3333.
  // When deploying the built studio to auctions.murivest.com/studio,
  // set basePath to "/studio" instead.
  basePath: "/",
  plugins: [deskTool({ structure }), visionTool()],
  schema: { types: schemaTypes },
});
