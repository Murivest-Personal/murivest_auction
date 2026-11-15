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
