import type { Property, VerificationState } from "@/lib/types";

function deriveVerification(p: Property): {
  titleCheck: VerificationState;
  occupancyCheck: VerificationState;
  reserveSanityCheck: VerificationState;
  legalPackReadiness: VerificationState;
} {
  const titleCheck: VerificationState =
    p.tenure === "Freehold" || p.tenure === "Leasehold"
      ? "verified"
      : "not-disclosed";

  const occupancyCheck: VerificationState =
    p.facts.occupancy != null && p.facts.tenancy != null
      ? "verified"
      : "not-disclosed";

  const reserveSanityCheck: VerificationState =
    p.reservePrice && p.reservePrice !== "Undisclosed" && p.guidePrice
      ? "verified"
      : "not-disclosed";

  const legalPackReadiness: VerificationState = p.legalPackAvailable
    ? "verified"
    : "not-disclosed";

  return {
    titleCheck,
    occupancyCheck,
    reserveSanityCheck,
    legalPackReadiness,
  };
}

const LABELS: Record<VerificationState, { text: string; className: string }> = {
  verified: { text: "Verified", className: "text-green" },
  "not-disclosed": { text: "Not disclosed", className: "text-charcoal" },
  failed: { text: "Not verified", className: "text-charcoal" },
};

/** Verification summary — what Murivest has verified and what it
    has not (features spec §3.7). */
export function VerificationBlock({ property }: { property: Property }) {
  const v = deriveVerification(property);
  const rows = [
    { label: "Title check", state: v.titleCheck },
    { label: "Occupancy and lease check", state: v.occupancyCheck },
    { label: "Reserve sanity check against guide", state: v.reserveSanityCheck },
    { label: "Legal pack readiness", state: v.legalPackReadiness },
  ];

  return (
    <section id="verification" className="scroll-mt-24">
      <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
        Verification
      </span>
      <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-6">
        Verification summary
      </h2>
      <p className="text-[0.9rem] leading-[1.8] text-ink mb-6 max-w-[42rem]">
        What Murivest has verified, and what it has not. Verification is a
        discipline of disclosure — it does not replace the buyer&rsquo;s own
        due diligence against the legal pack.
      </p>
      <dl className="max-w-[42rem] border-t border-hairline">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-4 py-4 border-b border-hairline"
          >
            <dt className="text-[0.95rem] text-ink font-body">{row.label}</dt>
            <dd
              className={`text-[0.6rem] tracking-[0.25em] uppercase font-body ${LABELS[row.state].className}`}
            >
              {LABELS[row.state].text}
            </dd>
          </div>
        ))}
      </dl>
      {property.viewingDetails ? (
        <p className="mt-6 text-[0.8rem] leading-[1.7] text-charcoal font-body max-w-[42rem]">
          {property.viewingDetails}
        </p>
      ) : null}
    </section>
  );
}
