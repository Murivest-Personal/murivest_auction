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
    title: "Marketplace",
    links: [
      { label: "Browse all lots", href: "/auctions" },
      { label: "Kenya market", href: "/kenya" },
      { label: "UK market", href: "/uk" },
      { label: "Auction calendar", href: "/calendar" },
      { label: "List a property", href: "/selling" },
    ],
  },
  {
    title: "Buyers",
    links: [
      { label: "How to participate", href: "/buyers" },
      { label: "Create account", href: "/register" },
      { label: "Sign in", href: "/sign-in" },
      { label: "My account", href: "/account" },
      { label: "Fees & terms", href: "/buyer-fees" },
      { label: "Tools & calculators", href: "/tools" },
    ],
  },
  {
    title: "Guides & insights",
    links: [
      { label: "How auctions work", href: "/how-auctions-work" },
      { label: "Research & insights", href: "/intelligence" },
      { label: "FAQs", href: "/faqs" },
      { label: "Glossary", href: "/how-auctions-work/glossary" },
    ],
  },
  {
    title: "Company & legal",
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
            <p className="font-brand text-lg tracking-[0.3em] text-cream mb-4">
              MURIVEST
            </p>
            <p className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-[color:var(--mv-on-dark-faint)] mb-6">
              Auction Marketplace · Kenya · United Kingdom
            </p>
            <p className="max-w-[26rem] text-[0.9rem] leading-[1.8] text-[color:var(--mv-on-dark)]">
              A curated commercial property auction marketplace operated by
              Murivest Group Ltd. Discover verified lots, submit properties for
              review, and participate through a qualified account with
              transparent terms.
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

        <div className="border border-[color:var(--mv-on-dark-faint)]/40 p-8 mb-16 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-[color:var(--mv-on-dark-faint)] mb-3">
              Marketplace access
            </p>
            <p className="text-[1.05rem] leading-[1.7] text-cream mb-2 font-serif font-light">
              Create an account to watch lots, register interest and track activity.
            </p>
            <p className="text-[0.85rem] leading-[1.7] text-[color:var(--mv-on-dark)] max-w-[38rem]">
              Buyers can save lots, submit bids or expressions of interest, and
              follow verification status. Sellers can submit properties for
              marketplace review. All participation is subject to applicable
              terms and verification.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-3 whitespace-nowrap px-8 py-4 text-[0.65rem] tracking-[0.25em] uppercase font-display border border-cream text-cream hover:bg-cream hover:text-green transition-colors"
            >
              Create account
            </Link>
            <Link
              href="/selling"
              className="inline-flex items-center justify-center gap-3 whitespace-nowrap px-8 py-4 text-[0.65rem] tracking-[0.25em] uppercase font-display bg-cream text-green hover:bg-gold hover:text-cream transition-colors"
            >
              List a property
            </Link>
          </div>
        </div>

        {/* Auction disclosure — locked copy, verbatim */}
        <div className="border border-hairline bg-cream p-6 text-[0.75rem] leading-[1.7] text-charcoal">
          {AUCTION_DISCLOSURE}
        </div>

        <div className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[color:var(--mv-on-dark-muted)]">
            © {new Date().getFullYear()} Murivest Group Ltd. All rights reserved.
          </p>
          <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[color:var(--mv-on-dark-muted)]">
            Curated marketplace · Kenya · United Kingdom · International
          </p>
        </div>
      </Container>
    </footer>
  );
}
