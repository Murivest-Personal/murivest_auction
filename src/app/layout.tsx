import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { GrainOverlay } from "@/components/ui/GrainOverlay";
import { JsonLd } from "@/components/ui/JsonLd";
import { organizationJsonLd } from "@/lib/jsonld";
import { SITE } from "@/lib/brand";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-cormorant",
  display: "swap",
});

const libre = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Commercial Property Auctions — Kenya & UK | Murivest Group Ltd",
    template: "%s",
  },
  description:
    "Verified commercial property auction listings across Kenya and the UK. Bank sales, receiver sales and investment lots, presented by Murivest Group Ltd. Mandate-only access.",
  applicationName: SITE.siteName,
};

export const viewport: Viewport = {
  themeColor: "#F5F2ED",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={`${cormorant.variable} ${libre.variable}`}>
      <body className="bg-cream text-green font-body antialiased min-h-screen flex flex-col">
        <JsonLd data={organizationJsonLd()} />
        <SiteHeader />
        <main className="relative flex-1">{children}</main>
        <SiteFooter />
        <GrainOverlay />
      </body>
    </html>
  );
}
