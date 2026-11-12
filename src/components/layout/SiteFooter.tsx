import Link from "next/link";
import { AUCTION_DISCLOSURE } from "@/lib/legal";
import { SITE } from "@/lib/brand";
import { Container } from "@/components/ui/Container";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const COLUMNS: { title: string; links: FooterLink[] }[] = [
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
    title: "Buyer services",
    links: [
      { label: "Buyer representation & fees", href: "/buyer-fees" },
      { label: "Buyer registration & qualification", href: "/buyers" },
      { label: "Create your account", href: "/register" },
      { label: "Sign in", href: "/sign-in" },
      { label: "Tools & calculators", href: "/tools" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
  {
    title: "Research",
    links: [
      { label: "All research", href: "/intelligence" },
      { label: "Auction defence & borrowers", href: "/intelligence" },
      { label: "Trusts & asset structuring", href: "/intelligence" },
      { label: "Buying at auction", href: "/intelligence" },
      { label: "Guides & glossary", href: "/how-auctions-work" },
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
            <p className="font-display text-lg tracking-[0.3em] text-cream mb-4">
              MURIVEST
            </p>
            <p className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-[color:var(--mv-on-dark-faint)] mb-6">
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
                <p className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-[color:var(--mv-on-dark-faint)] mb-5">
                  {col.title}
                </p>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[0.85rem] text-[color:var(--mv-on-dark)] hover:text-gold transition-colors"
                        >
                          {link.label} ↗
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-[0.85rem] text-[color:var(--mv-on-dark)] hover:text-gold transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Auction alerts — account registration CTA (the account
            lives on this website) */}
        <div className="border border-[color:var(--mv-on-dark-faint)]/40 p-8 mb-16 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-[color:var(--mv-on-dark-faint)] mb-3">
              Auction alerts
            </p>
            <p className="text-[1.05rem] leading-[1.7] text-cream mb-2 font-serif font-light">
              Be notified of auction and off-market properties.
            </p>
            <p className="text-[0.85rem] leading-[1.7] text-[color:var(--mv-on-dark)] max-w-[38rem]">
              Account holders receive auction dates, new lots and off-market
              opportunities — and can save lots, submit bids and follow their
              verification status — all on this website.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-3 whitespace-nowrap px-8 py-4 text-[0.65rem] tracking-[0.25em] uppercase font-display border border-cream text-cream hover:bg-cream hover:text-green transition-colors"
          >
            Create your account
          </Link>
        </div>

        {/* Auction disclosure — locked copy, verbatim (§5.13) */}
        <div className="border border-hairline bg-cream p-6 text-[0.75rem] leading-[1.7] text-charcoal">
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
