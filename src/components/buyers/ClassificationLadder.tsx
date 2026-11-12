import {
  BUYER_CLASSIFICATIONS,
  classificationIndex,
} from "@/lib/buyer/qualification";

/* The 8-stage qualification ladder. Renders the buyer's current
   position and what is still ahead. Server component. */
export function ClassificationLadder({
  current,
}: {
  current?: string;
}) {
  const currentIdx =
    current != null ? classificationIndex(current) : Number.POSITIVE_INFINITY;
  return (
    <ol className="border border-hairline divide-y divide-hairline bg-white">
      {BUYER_CLASSIFICATIONS.map((c, i) => {
        const isCurrent = i === currentIdx;
        const isPast = current != null && i < currentIdx;
        return (
          <li
            key={c.value}
            aria-current={isCurrent ? "step" : undefined}
            className={`flex gap-5 p-5 ${isCurrent ? "bg-cream" : ""}`}
          >
            <span
              aria-hidden="true"
              className={`flex-shrink-0 w-8 h-8 border flex items-center justify-center font-display text-[0.65rem] ${
                isCurrent
                  ? "border-green bg-green text-cream"
                  : isPast
                    ? "border-green text-green"
                    : "border-hairline text-charcoal/50"
              }`}
            >
              {isPast ? "✓" : String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <p
                className={`font-display text-[0.65rem] tracking-[0.25em] uppercase ${
                  isCurrent ? "text-gold" : isPast ? "text-green" : "text-charcoal/70"
                }`}
              >
                {c.label}
              </p>
              <p className="text-[0.85rem] leading-[1.7] text-ink mt-2">
                {c.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
