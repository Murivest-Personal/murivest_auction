"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Click-to-open dropdown section (features: calculators, comments).

    - Closed by default; the header row toggles open/closed onclick.
    - Children always stay in the DOM (the panel uses the `hidden`
      attribute rather than conditional rendering) so server-rendered
      content such as approved comments remains crawlable.
    - Auto-opens when the URL hash targets this section, so
      #public-comments style deep links still work while collapsed. */
export function Collapsible({
  id,
  eyebrow,
  title,
  meta,
  description,
  defaultOpen = false,
  children,
  className,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  meta?: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (window.location.hash === `#${id}`) {
      setOpen(true);
    }
  }, [id]);

  return (
    <div
      id={id}
      data-state={open ? "open" : "closed"}
      className={cn(
        "border border-hairline bg-white scroll-mt-24",
        className
      )}
    >
      <button
        type="button"
        id={`${id}-trigger`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        className="flex w-full items-center justify-between gap-6 px-6 py-5 md:px-8 md:py-6 text-left hover:bg-cream transition-colors"
      >
        <span className="min-w-0">
          {eyebrow ? (
            <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-2">
              {eyebrow}
            </span>
          ) : null}
          <span className="block font-serif text-xl md:text-2xl font-light text-green">
            {title}
          </span>
          {description && !open ? (
            <span className="block mt-2 font-body text-[0.8rem] leading-[1.6] text-charcoal">
              {description}
            </span>
          ) : null}
        </span>
        <span className="flex items-center gap-4 flex-shrink-0">
          {meta ? (
            <span className="hidden sm:block font-body text-[0.65rem] tracking-[0.2em] uppercase text-charcoal">
              {meta}
            </span>
          ) : null}
          <span
            aria-hidden="true"
            className={cn(
              "w-8 h-8 border border-sand flex items-center justify-center text-sm text-green transition-colors",
              open && "bg-green text-cream border-green"
            )}
          >
            {open ? "−" : "+"}
          </span>
        </span>
      </button>

      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        hidden={!open}
        className="border-t border-hairline px-6 py-6 md:px-8 md:py-8"
      >
        {children}
      </div>
    </div>
  );
}
