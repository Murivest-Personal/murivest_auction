import { cn } from "@/lib/utils";
import { Eyebrow } from "./Eyebrow";

export function SectionHeader({
  numeral,
  eyebrow,
  title,
  className,
  tone = "cream",
  as: Tag = "h2",
}: {
  numeral: string;
  eyebrow: string;
  title: React.ReactNode;
  className?: string;
  tone?: "cream" | "dark";
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-start gap-6 md:gap-12 mb-12 md:mb-16",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="font-serif text-[3.5rem] md:text-[5rem] font-light text-sand opacity-50 leading-none flex-shrink-0 select-none"
      >
        {numeral}
      </span>
      <div>
        <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        <Tag
          className={cn(
            "font-serif text-3xl md:text-4xl font-light leading-tight",
            tone === "cream" ? "text-green" : "text-cream"
          )}
        >
          {title}
        </Tag>
      </div>
    </div>
  );
}
