import Link from "next/link";
import { AUCTION_DISCLOSURE } from "@/lib/legal";
import { SITE } from "@/lib/brand";
import { Container } from "@/components/ui/Container";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Auctions",
    links: [
      { label: "All lots", href: "/auctions" },
      { label: "Kenya auctions", href: "/kenya" },
      { label: "UK auctions", href: "/uk" },
      { label: "Auction calendar", href: "/calendar" },
    ],
  },
  {
    title: "Guides",
    links: [
      { label: "How auctions work", href: "/how-auctions-work" },
      { label: "Buying at auction", href: "/how-auctions-work/buying" },
      { label: "Selling at auction", href: "/how-auctions-work/selling" },
      { label: "Legal pack and due diligence", href: "/how-auctions-work/legal-pack" },
      { label: "Auction glossary", href: "/how-auctions-work/glossary" },
    ],
  },
  {
    title: "Intelligence",
    links: [
      { label: "Kenya auction market", href: "/kenya" },
      { label: "UK auction market", href: "/uk" },
      { label: "Articles", href: "/intelligence" },
      { label: "Calculators", href: "/tools" },
    ],
  },
  {
    title: "The firm",
    links: [
      { label: "About Murivest", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Contact", href: "/contact" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Auction disclaimers", href: "/auction-disclaimers" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-green text-cream mt-0">
      <Container className="py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr] mb-16">
          <div>
            <p className="font-serif text-2xl font-light tracking-[0.18em] text-cream mb-4">
              MURIVEST
            </p>
            <p className="font-body text-[0.55rem] tracking-[0.3em] uppercase text-[color:var(--mv-on-dark-faint)] mb-6">
              Auctions — Kenya · United Kingdom
            </p>
            <p className="max-w-[26rem] text-[0.9rem] leading-[1.8] text-[color:var(--mv-on-dark)]">
              Verified commercial property auction intelligence from Murivest
              Group Ltd — commercial real estate services across East Africa,
              the United Kingdom and international markets.
            </p>
            <div className="mt-8 space-y-1 text-[0.85rem] text-[color:var(--mv-on-dark)]">
              <p>
                <a
                  href={`mailto:${SITE.officeEmail}`}
                  className="hover:text-gold transition-colors"
                >
                  {SITE.officeEmail}
                </a>
              </p>
              <p>{SITE.officePhone}</p>
              <p className="text-[color:var(--mv-on-dark-muted)]">{SITE.nairobiOffice}</p>
              <p className="text-[color:var(--mv-on-dark-muted)]">{SITE.londonOffice}</p>
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="font-body text-[0.55rem] tracking-[0.3em] uppercase text-[color:var(--mv-on-dark-faint)] mb-5">
                  {col.title}
                </p>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[0.85rem] text-[color:var(--mv-on-dark)] hover:text-gold transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Auction disclosure — locked copy, verbatim (§5.13) */}
        <div className="border border-hairline bg-cream p-6 text-[0.75rem] leading-[1.7] text-charcoal font-body">
          {AUCTION_DISCLOSURE}
        </div>

        <div className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[color:var(--mv-on-dark-muted)]">
            © {new Date().getFullYear()} Murivest Group Ltd. All rights reserved.
          </p>
          <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[color:var(--mv-on-dark-muted)]">
            Engagements by mandate only · East Africa · United Kingdom ·
            International
          </p>
        </div>
      </Container>
    </footer>
  );
}
