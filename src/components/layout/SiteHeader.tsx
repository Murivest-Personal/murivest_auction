"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

const NAV: NavItem[] = [
  {
    label: "Auctions",
    href: "/auctions",
    children: [
      { label: "All lots", href: "/auctions" },
      { label: "Kenya auctions", href: "/kenya" },
      { label: "UK auctions", href: "/uk" },
      { label: "Auction calendar", href: "/calendar" },
      { label: "Nairobi submarkets", href: "/kenya" },
    ],
  },
  {
    label: "Research",
    href: "/intelligence",
    children: [
      { label: "All research", href: "/intelligence" },
      { label: "Auction defence & borrowers", href: "/intelligence" },
      { label: "Trusts & asset structuring", href: "/intelligence" },
      { label: "Buying at auction", href: "/intelligence" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
  {
    label: "How auctions work",
    href: "/how-auctions-work",
    children: [
      { label: "How auctions work — overview", href: "/how-auctions-work" },
      { label: "Buying at auction", href: "/how-auctions-work/buying" },
      { label: "Selling at auction", href: "/how-auctions-work/selling" },
      { label: "Legal pack and due diligence", href: "/how-auctions-work/legal-pack" },
      { label: "Auction glossary", href: "/how-auctions-work/glossary" },
    ],
  },
  {
    label: "Buyer services",
    href: "/buyer-fees",
    children: [
      { label: "Buyer representation & the 2% fee", href: "/buyer-fees" },
      { label: "Auction alerts — the portal", href: "https://portal.murivest.com" },
      { label: "Tools & calculators", href: "/tools" },
    ],
  },
  { label: "About", href: "/about" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  /* Which menu section is expanded as a dropdown (title click). */
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    setOpenSection(null);
  };

  return (
    <header className="sticky top-0 z-50 bg-cream border-b border-hairline">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="flex items-center justify-between h-20">
          <Link
            href="/"
            className="flex items-baseline gap-3"
            aria-label="Murivest Auctions — home"
          >
            <span className="font-display text-xl tracking-[0.28em] text-green">
              MURIVEST
            </span>
            <span
              className="hidden sm:block w-px h-5 bg-sand self-center"
              aria-hidden="true"
            />
            <span className="hidden sm:block font-display text-[0.55rem] tracking-[0.34em] uppercase text-gold">
              Auctions
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Primary" className="hidden 2xl:block">
            <ul className="flex items-center gap-6">
              {NAV.map((item) => (
                <li key={item.label} className="group relative">
                  <Link
                    href={item.href}
                    aria-current={
                      pathname === item.href.split("?")[0] ? "page" : undefined
                    }
                    className="flex items-center gap-1 py-7 font-display text-[0.62rem] tracking-[0.2em] uppercase text-green hover:text-gold transition-colors whitespace-nowrap"
                  >
                    {item.label}
                    {item.children ? (
                      <span aria-hidden="true" className="text-[0.5rem]">
                        ▾
                      </span>
                    ) : null}
                  </Link>
                  {item.children ? (
                    <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity duration-200 absolute left-0 top-full min-w-[260px] bg-cream border border-hairline border-t-0 p-6">
                      <ul className="space-y-1">
                        {item.children.map((child) => (
                          <li key={child.label}>
                            <Link
                              href={child.href}
                              className="block py-2 font-display text-[0.6rem] tracking-[0.2em] uppercase text-ink hover:text-gold transition-colors"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              ))}
              <li>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-2.5 text-[0.6rem] tracking-[0.22em] uppercase font-display text-green border border-green hover:bg-green hover:text-cream transition-colors whitespace-nowrap"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="2xl:hidden flex flex-col gap-1.5 p-2"
          >
            <span
              className={cn(
                "block w-6 h-px bg-green transition-transform",
                open && "translate-y-[3.5px] rotate-45"
              )}
            />
            <span
              className={cn(
                "block w-6 h-px bg-green transition-transform",
                open && "-translate-y-[3.5px] -rotate-45"
              )}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu — section titles act as dropdown toggles; the
          child links expand underneath on click */}
      {open ? (
        <nav
          aria-label="Primary mobile"
          className="2xl:hidden fixed inset-x-0 bottom-0 top-20 bg-cream border-t border-hairline overflow-y-auto"
        >
          <ul className="px-6 py-8 space-y-8">
            {NAV.map((item) => (
              <li key={item.label}>
                {item.children ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenSection(
                          openSection === item.label ? null : item.label
                        )
                      }
                      aria-expanded={openSection === item.label}
                      aria-controls={`mobile-nav-${item.label
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")}`}
                      className="flex w-full items-center justify-between gap-6 font-display text-[0.7rem] tracking-[0.25em] uppercase text-green"
                    >
                      {item.label}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex-shrink-0 w-7 h-7 border border-sand flex items-center justify-center text-xs text-green transition-colors",
                          openSection === item.label &&
                            "bg-green text-cream border-green"
                        )}
                      >
                        {openSection === item.label ? "−" : "+"}
                      </span>
                    </button>
                    {openSection === item.label ? (
                      <ul className="mt-3 space-y-2 pl-4 border-l border-hairline">
                        {item.children.map((child) => (
                          <li key={child.label}>
                            <Link
                              href={child.href}
                              onClick={closeMenu}
                              className="block py-1 font-body text-[0.85rem] text-ink"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    className="block font-display text-[0.7rem] tracking-[0.25em] uppercase text-green"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
            <li>
              <Link
                href="/contact"
                onClick={closeMenu}
                className="inline-flex items-center justify-center px-8 py-3 text-[0.65rem] tracking-[0.22em] uppercase font-display bg-green text-cream"
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
