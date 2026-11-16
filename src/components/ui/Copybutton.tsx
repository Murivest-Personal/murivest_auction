"use client";

import { useState } from "react";

/**
 * Copies a bid reference (or any short string) to the clipboard.
 * Used on the Bids table so clients can paste references into
 * emails to the deal team without retyping.
 */
export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
        } catch {
          /* clipboard unavailable — no-op */
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
      className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal/70 hover:text-gold transition-colors border-b border-hairline hover:border-gold pb-0.5"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}