import { cn } from "@/lib/utils";

export function Eyebrow({
  children,
  className,
  tone = "cream",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "cream" | "dark";
}) {
  return (
    <span
      className={cn(
        "block font-display text-[0.6rem] tracking-[0.3em] uppercase mb-4",
        tone === "cream" ? "text-gold" : "text-[color:var(--mv-on-dark-faint)]",
        className
      )}
    >
      {children}
    </span>
  );
}
