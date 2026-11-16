"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  UserRound,
  X,
  ChevronDown,
  Gavel,
  BarChart3,
  Compass,
  ShieldCheck,
  Building2,
  Mail,
  type LucideIcon,
} from "lucide-react";

/* ---------------- Navigation data ---------------- */

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: { label: string; href: string }[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Marketplace",
    items: [
      {
        label: "Auctions",
        href: "/auctions",
        icon: Gavel,
        children: [
          { label: "All lots", href: "/auctions" },
          { label: "Kenya auctions", href: "/kenya" },
          { label: "UK auctions", href: "/uk" },
          { label: "Auction calendar", href: "/calendar" },
          { label: "Nairobi submarkets", href: "/kenya" },
        ],
      },
    ],
  },
  {
    label: "Intelligence",
    items: [
      {
        label: "Research",
        href: "/intelligence",
        icon: BarChart3,
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
        icon: Compass,
        children: [
          { label: "Overview", href: "/how-auctions-work" },
          { label: "Buying at auction", href: "/how-auctions-work/buying" },
          { label: "Selling at auction", href: "/how-auctions-work/selling" },
          { label: "Legal pack & due diligence", href: "/how-auctions-work/legal-pack" },
          { label: "Auction glossary", href: "/how-auctions-work/glossary" },
        ],
      },
    ],
  },
  {
    label: "Services",
    items: [
      {
        label: "Buyer services",
        href: "/buyer-fees",
        icon: ShieldCheck,
        children: [
          { label: "Buyer representation & 2% fee", href: "/buyer-fees" },
          { label: "Registration & qualification", href: "/buyers" },
          { label: "Create your account", href: "/register" },
          { label: "Sign in", href: "/sign-in" },
          { label: "Tools & calculators", href: "/tools" },
        ],
      },
      {
        label: "Selling",
        href: "/selling",
        icon: Building2,
      },
    ],
  },
  {
    label: "Firm",
    items: [
      { label: "About", href: "/about", icon: Building2 },
      { label: "Contact", href: "/contact", icon: Mail },
    ],
  },
];

/* ---------------- Helpers ---------------- */

function initials(name?: string) {
  if (!name) return "·";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "·";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function useAccountSession() {
  const [state, setState] = useState<{ signedIn: boolean; name?: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/account/session")
      .then((r) => r.json())
      .then((data: { signedIn: boolean; name?: string }) => {
        if (!cancelled) setState(data);
      })
      .catch(() => {
        if (!cancelled) setState({ signedIn: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

/* ---------------- Wordmark ---------------- */

function Wordmark({ variant = "full" }: { variant?: "full" | "compact" }) {
  const isCompact = variant === "compact";
  return (
    <div className="flex flex-col min-w-0">
      <span className="flex items-baseline gap-1.5 whitespace-nowrap">
        <span
          className={cn(
            "font-brand text-green",
            isCompact
              ? "text-base tracking-[0.22em]"
              : "text-xl tracking-[0.24em]"
          )}
        >
          MURIVEST
        </span>
        <span
          className={cn(
            "font-display uppercase text-gold",
            isCompact
              ? "hidden sm:inline text-[0.4rem] tracking-[0.15em]"
              : "text-[0.5rem] tracking-[0.22em]"
          )}
          aria-hidden="true"
        >
          Auctions
        </span>
      </span>
      {!isCompact && (
        <span className="mt-1 font-display text-[0.45rem] tracking-[0.22em] uppercase text-charcoal/70">
          Private client marketplace
        </span>
      )}
    </div>
  );
}

/* ---------------- Account (sidebar card) ---------------- */

function AccountCard() {
  const state = useAccountSession();
  const isLoading = state === null;

  if (isLoading) {
    return (
      <div className="px-4 py-4 border-b border-hairline">
        <div className="border border-hairline p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-hairline/40 flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="h-2.5 bg-hairline/40 w-3/4" />
              <div className="h-1.5 bg-hairline/30 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!state.signedIn) {
    return (
      <div className="px-4 py-4 border-b border-hairline">
        <Link
          href="/sign-in"
          className="group flex items-center gap-3 border border-hairline p-3 hover:border-green/60 transition-colors"
        >
          <span className="flex-shrink-0 w-9 h-9 border border-hairline flex items-center justify-center text-green group-hover:border-green transition-colors">
            <UserRound className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-body text-[0.8rem] text-green leading-tight">
              Login
            </span>
            <span className="block font-display text-[0.45rem] tracking-[0.22em] uppercase text-charcoal mt-0.5">
              Account
            </span>
          </span>
          <span className="text-green group-hover:text-gold transition-colors text-[0.7rem]">
            →
          </span>
        </Link>
        <Link
          href="/register"
          className="mt-2 block text-center font-display text-[0.5rem] tracking-[0.22em] uppercase text-charcoal hover:text-gold transition-colors py-1"
        >
          Create account →
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 border-b border-hairline">
      <Link
        href="/account"
        className="group block border border-hairline hover:border-green/60 transition-colors p-3"
      >
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-9 h-9 bg-green text-cream flex items-center justify-center font-serif text-[0.85rem]">
            {initials(state.name)}
          </span>
          <div className="flex-1 min-w-0">
            <span className="block font-body text-[0.8rem] text-green leading-tight truncate">
              {state.name ?? "Account"}
            </span>
            <span className="block font-display text-[0.45rem] tracking-[0.22em] uppercase text-charcoal mt-0.5">
              Account
            </span>
          </div>
        </div>
        <div className="mt-2.5 pt-2.5 border-t border-hairline flex items-center justify-between">
          <span className="font-display text-[0.5rem] tracking-[0.22em] uppercase text-charcoal group-hover:text-green transition-colors">
            View account
          </span>
          <span className="text-green group-hover:text-gold transition-colors text-[0.7rem]">
            →
          </span>
        </div>
      </Link>
    </div>
  );
}

/* ---------------- Account (compact chip for mobile bar) ---------------- */

function CompactAccount() {
  const state = useAccountSession();
  const isLoading = state === null;

  const displayName = isLoading
    ? "Account"
    : state.signedIn
    ? state.name ?? "Account"
    : "Login";

  const href = isLoading || state.signedIn ? "/account" : "/sign-in";

  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-1.5 text-[0.55rem] tracking-[0.2em] uppercase font-display text-green border border-hairline hover:border-green transition-colors whitespace-nowrap max-w-[160px]"
      title={isLoading ? undefined : state?.signedIn ? state.name : undefined}
    >
      <UserRound className="flex-shrink-0 w-4 h-4" aria-hidden="true" />
      <span className="truncate">{displayName}</span>
    </Link>
  );
}

/* ---------------- Navigation accordion ---------------- */

function NavAccordion({
  pathname,
  onCloseMobile,
}: {
  pathname: string;
  onCloseMobile?: () => void;
}) {
  const cleanPath = pathname.split("?")[0];
  const isExactMatch = (href: string) => cleanPath === href.split("?")[0];
  const isChildOf = (parentHref: string) =>
    cleanPath.startsWith(parentHref.split("?")[0] + "/");

  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    const next = new Set<string>();
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        if (!item.children) continue;
        const active =
          isExactMatch(item.href) ||
          isChildOf(item.href) ||
          item.children.some((c) => isExactMatch(c.href));
        if (active) next.add(item.label);
      }
    }
    return next;
  });

  const toggleSection = (label: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <nav aria-label="Primary navigation" className="flex-1 overflow-y-auto py-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="mb-6 last:mb-0">
          <span className="block pl-3 mb-2 border-l-2 border-transparent font-display text-[0.5rem] tracking-[0.3em] uppercase text-charcoal/70">
            {group.label}
          </span>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const children = item.children ?? [];
              const hasChildren = children.length > 0;
              const isOpen = hasChildren && openSections.has(item.label);
              const isActiveParent =
                isExactMatch(item.href) ||
                isChildOf(item.href) ||
                children.some((c) => isExactMatch(c.href));

              return (
                <li key={item.label}>
                  {hasChildren ? (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleSection(item.label)}
                        aria-expanded={isOpen}
                        className={cn(
                          "flex w-full items-center gap-2.5 pl-3 pr-3 py-2.5 border-l-2 text-left font-display text-[0.6rem] tracking-[0.2em] uppercase transition-colors",
                          isActiveParent
                            ? "text-gold border-gold"
                            : "text-green border-transparent hover:text-gold"
                        )}
                      >
                        <Icon
                          className="w-3.5 h-3.5 flex-shrink-0"
                          aria-hidden="true"
                        />
                        <span className="flex-1">{item.label}</span>
                        <ChevronDown
                          className={cn(
                            "w-3.5 h-3.5 flex-shrink-0 transition-transform",
                            isOpen && "rotate-180"
                          )}
                          aria-hidden="true"
                        />
                      </button>
                      {isOpen && (
                        <ul className="ml-4 mt-1 mb-1 border-l border-hairline space-y-0.5">
                          {children.map((child) => {
                            const active = isExactMatch(child.href);
                            return (
                              <li key={child.label}>
                                <Link
                                  href={child.href}
                                  onClick={onCloseMobile}
                                  className={cn(
                                    "relative block pl-4 pr-3 py-2 font-display text-[0.58rem] tracking-[0.18em] uppercase transition-colors",
                                    active
                                      ? "text-gold"
                                      : "text-charcoal hover:text-gold"
                                  )}
                                  aria-current={
                                    active ? "page" : undefined
                                  }
                                >
                                  {active && (
                                    <span
                                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gold"
                                      aria-hidden="true"
                                    />
                                  )}
                                  {child.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "flex items-center gap-2.5 pl-3 pr-3 py-2.5 border-l-2 font-display text-[0.6rem] tracking-[0.2em] uppercase transition-colors",
                        isExactMatch(item.href)
                          ? "text-gold border-gold"
                          : "text-green border-transparent hover:text-gold"
                      )}
                      aria-current={
                        isExactMatch(item.href) ? "page" : undefined
                      }
                    >
                      <Icon
                        className="w-3.5 h-3.5 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/* ---------------- Sidebar content ---------------- */

function SidebarContent({
  pathname,
  onCloseMobile,
  showWordmark = true,
}: {
  pathname: string;
  onCloseMobile?: () => void;
  showWordmark?: boolean;
}) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {showWordmark && (
        <Link
          href="/"
          className="flex flex-col px-4 py-6 border-b border-hairline flex-shrink-0"
          aria-label="Murivest Auctions — home"
        >
          <Wordmark variant="full" />
        </Link>
      )}

      <div className="flex-shrink-0">
        <AccountCard />
      </div>

      <NavAccordion pathname={pathname} onCloseMobile={onCloseMobile} />

      <div className="border-t border-hairline px-4 py-4 flex-shrink-0">
        <a
          href="mailto:office@murivest.com"
          className="block font-body text-[0.78rem] text-green hover:text-gold transition-colors truncate"
        >
          office@murivest.com
        </a>
        <span className="block mt-1 font-display text-[0.45rem] tracking-[0.22em] uppercase text-charcoal/70">
          Kenya · United Kingdom
        </span>
      </div>
    </div>
  );
}

/* ---------------- Site header ---------------- */

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") closeMobile();
  };

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  /* Close mobile drawer on route change */
  useEffect(() => {
    const t = setTimeout(() => setMobileOpen(false), 0);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        aria-label="Main navigation"
        className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-[248px] flex-col border-r border-hairline bg-cream"
      >
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 h-16 bg-cream border-b border-hairline">
        <div className="flex items-center justify-between h-full px-4 gap-3">
          <Link
            href="/"
            aria-label="Murivest Auctions — home"
            className="min-w-0"
          >
            <Wordmark variant="compact" />
          </Link>
          <div className="flex items-center gap-3 flex-shrink-0">
            <CompactAccount />
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-controls="sidebar-menu"
              aria-label="Open menu"
              className="flex flex-col gap-1.5 p-2"
            >
              <span className="block w-6 h-px bg-green" />
              <span className="block w-6 h-px bg-green" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-green/35"
            onClick={closeMobile}
            aria-hidden="true"
          />
          <aside
            id="sidebar-menu"
            aria-label="Main navigation"
            className="lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] bg-cream border-r border-hairline flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between p-4 border-b border-hairline flex-shrink-0 gap-3">
              <Link
                href="/"
                aria-label="Murivest Auctions — home"
                className="min-w-0"
              >
                <Wordmark variant="full" />
              </Link>
              <button
                type="button"
                onClick={closeMobile}
                aria-label="Close menu"
                className="p-1 text-green hover:text-gold transition-colors flex-shrink-0"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>
            <SidebarContent
              pathname={pathname}
              onCloseMobile={closeMobile}
              showWordmark={false}
            />
          </aside>
        </>
      ) : null}
    </>
  );
}