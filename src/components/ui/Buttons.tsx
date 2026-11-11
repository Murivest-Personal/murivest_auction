import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost";

type CommonProps = {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
};

const base =
  "inline-flex items-center justify-center px-8 py-3 text-[0.65rem] tracking-[0.22em] uppercase font-body transition-colors";

const variants: Record<Variant, string> = {
  primary: "bg-green text-cream hover:bg-gold",
  ghost: "text-green border border-green hover:bg-green hover:text-cream",
};

export function PrimaryButton({
  children,
  className,
  ...rest
}: CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">) {
  return (
    <button
      type="button"
      className={cn(base, variants.primary, className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className,
  ...rest
}: CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">) {
  return (
    <button
      type="button"
      className={cn(base, variants.ghost, className)}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Anchor styled as a button (primary or ghost). */
export function ButtonLink({
  children,
  className,
  variant = "primary",
  href,
  external,
  ...rest
}: CommonProps & {
  href: string;
  external?: boolean;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href">) {
  return (
    <a
      href={href}
      className={cn(base, variants[variant], className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}
