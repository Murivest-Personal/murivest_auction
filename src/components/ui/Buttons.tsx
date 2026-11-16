import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "inverse" | "quiet";

type CommonProps = {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
  disabled?: boolean;
};

export function PrimaryButton({
  children,
  className,
  disabled,
  ...rest
}: CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn("btn btn-primary", className, disabled && "opacity-100")}
      {...rest}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className,
  disabled,
  ...rest
}: CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn("btn btn-secondary", className, disabled && "opacity-100")}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Anchor styled as a button (primary, secondary, inverse, or quiet). */
export function ButtonLink({
  children,
  className,
  variant = "primary",
  href,
  external,
  disabled,
  ...rest
}: CommonProps & {
  href: string;
  external?: boolean;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href">) {
  const variantMap: Record<Variant, string> = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    inverse: "btn-inverse",
    quiet: "btn-quiet",
  };
  return (
    <a
      href={disabled ? "#" : href}
      className={cn("btn", variantMap[variant], className, disabled && "opacity-100 pointer-events-none")}
      aria-disabled={disabled}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}