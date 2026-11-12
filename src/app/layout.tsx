import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { GrainOverlay } from "@/components/ui/GrainOverlay";
import { JsonLd } from "@/components/ui/JsonLd";
import { organizationJsonLd } from "@/lib/jsonld";
import { SITE } from "@/lib/brand";

/* Luxury gallery typographic trio:
   - Cinzel (Roman capitals) — wordmark, navigation, eyebrows,
     museum-label reference numbers, buttons.
   - Times New Roman — body text, the reading voice.
   - Cormorant Garamond — oversized editorial statements and
     display headlines. */
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cinzel",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default:
      "Property Auctions in Kenya & the UK — Buyer Representation | Murivest",
    template: "%s",
  },
  description:
    "Verified commercial and residential property auctions across Kenya and the UK, with discreet buyer representation from Murivest Group Ltd. Discover. Evaluate. Acquire.",
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
    <html
      lang="en-GB"
      className={`${cinzel.variable} ${cormorant.variable}`}
    >
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
