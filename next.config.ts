import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },

  /* Ship the Prisma query-engine binary + generated client into
     the standalone build. Without this, `next build` traces only
     the JS modules, the deploy ships without
     node_modules/.prisma/client/libquery_engine-*.node, and every
     DB call 500s at runtime with
     "Query engine library for current platform could not be found".
     Both patterns are listed so the engine is included whether the
     route is under /api/** or anywhere else. */
  outputFileTracingIncludes: {
    "/**/*": ["./node_modules/.prisma/client/**/*"],
    "/api/**/*": ["./node_modules/.prisma/client/**/*"],
  },

  /* Keep Prisma (and the pg driver Prisma uses) out of the Next
     bundler — they load native binaries at runtime and must be
     resolved from node_modules, not inlined. */
  serverExternalPackages: ["@prisma/client", ".prisma/client", "pg"],

  /* The account lives on this website — no separate portal. Old
     portal routes redirect to their account equivalents. */
  async redirects() {
    return [
      { source: "/buyers/sign-in", destination: "/sign-in", permanent: true },
      { source: "/buyers/register", destination: "/register", permanent: true },
      { source: "/buyers/portal", destination: "/account", permanent: true },
      {
        source: "/buyers/data-room/:slug*",
        destination: "/account",
        permanent: true,
      },
    ];
  },

  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;