import { cn } from "@/lib/utils";

/** The signature Murivest CTA — tracked label with the ↗ arrow
    inside a square box (brand guide §5.5). */
export function ArrowLink({
  children,
  href,
  className,
  external,
  arrow = "↗",
  ...rest
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
  external?: boolean;
  arrow?: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href">) {
  return (
    <a
      href={href}
      className={cn("link-rule group", className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
      <span className="arrow-box" aria-hidden="true">
        {arrow}
      </span>
    </a>
  );
}

/** Arrow link adapted for deep green backgrounds. */
export function ArrowLinkDark({
  children,
  href,
  className,
  ...rest
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href">) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center gap-3 font-display text-[0.65rem] tracking-[0.22em] uppercase text-cream/75 hover:text-gold transition-colors group",
        className
      )}
      {...rest}
    >
      {children}
      <span
        aria-hidden="true"
        className="w-7 h-7 border border-current flex items-center justify-center text-xs transition-colors group-hover:bg-gold group-hover:text-green"
      >
        ↗
      </span>
    </a>
  );
}
