import { cn } from "@/lib/utils";
import type { PropertyStatus } from "@/lib/types";
import { statusLabel } from "@/lib/format";

/** Status badges — brand guide §5.7. Amber is reserved for the
    “New listing” badge only. */
const STATUS_STYLES: Record<PropertyStatus, string> = {
  "for-sale": "bg-green text-cream",
  "for-sale-by-auction": "bg-gold text-cream",
  "under-offer": "bg-charcoal text-cream",
  sold: "bg-sand text-green",
};

export function StatusBadge({
  status,
  className,
}: {
  status: PropertyStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block px-3 py-1.5 text-[0.6rem] tracking-[0.2em] uppercase font-body",
        STATUS_STYLES[status],
        className
      )}
    >
      {statusLabel(status)}
    </span>
  );
}

export function NewListingBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block px-3 py-1.5 text-[0.6rem] tracking-[0.2em] uppercase font-body bg-[#F59E0B] text-green",
        className
      )}
    >
      New listing
    </span>
  );
}
