/* Typed export of brand tokens for inline styles where Tailwind
   can't reach (Mapbox markers, JSON-LD, SVG). Locked values. */

export const brand = {
  cream: "#F5F2ED",
  green: "#1C2B1E",
  gold: "#8B6C2A",
  sand: "#C4B49A",
  ink: "#3D3328",
  charcoal: "#5A5A5A",
  white: "#FFFFFF",
  hairline: "#E8E3DA",
  onDark: "rgba(245,242,237,0.75)",
  onDarkMuted: "rgba(245,242,237,0.60)",
  onDarkFaint: "rgba(196,180,154,0.70)",
} as const;

export const SITE = {
  name: "Murivest Group Ltd",
  shortName: "Murivest",
  siteName: "Murivest Auctions",
  url: "https://auctions.murivest.com",
  mainSite: "https://murivest.com",
  linkedin: "https://www.linkedin.com/company/murivest-group-ltd",
  officeEmail: "office@murivest.com",
  officePhone: "+254 115 277 610",
  nairobiOffice: "4th Avenue Parklands, Diamond Plaza",
  londonOffice: "12 Berkeley Square, Mayfair, London W1J",
} as const;
