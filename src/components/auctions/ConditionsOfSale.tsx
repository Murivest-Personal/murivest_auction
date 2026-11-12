import { CONDITIONS_DISCLAIMER } from "@/lib/legal";
import type { ConditionsOfSale as ConditionsType } from "@/lib/types";

/** Conditions of sale — numbered summary, PDF link, disclaimer
    (addendum §3.4). */
export function ConditionsOfSale({ conditions }: { conditions: ConditionsType }) {
  return (
    <section id="conditions-of-sale" className="scroll-mt-24">
      <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
        {conditions.jurisdiction === "Kenya"
          ? "Land Act 2012 · Auctioneers Act"
          : conditions.jurisdiction === "UK"
            ? "Common Auction Conditions · SCPC"
            : "Conditions of sale"}
      </span>
      <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-6">
        Conditions of sale — summary
      </h2>

      {conditions.depositPercent != null ||
      conditions.balanceDays != null ||
      conditions.depositPaymentMethod ||
      conditions.depositPayee ? (
        <div className="border border-hairline bg-cream p-5 mb-6 max-w-[42rem]">
          <p className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-3">
            Deposit — set by this lot&rsquo;s conditions of sale
          </p>
          <ul className="space-y-1.5 text-[0.85rem] leading-[1.7] text-ink">
            {conditions.depositPercent != null ? (
              <li>
                <span className="text-green">Amount:</span>{" "}
                {conditions.depositPercent}% of the purchase price
              </li>
            ) : null}
            {conditions.depositDue ? (
              <li>
                <span className="text-green">Deadline:</span>{" "}
                {conditions.depositDue}
              </li>
            ) : conditions.depositPercent != null ? (
              <li>
                <span className="text-green">Deadline:</span> on the fall of
                the hammer, unless the conditions state otherwise
              </li>
            ) : null}
            {conditions.depositPaymentMethod ? (
              <li>
                <span className="text-green">Payment method:</span>{" "}
                {conditions.depositPaymentMethod}
              </li>
            ) : null}
            {conditions.depositPayee ? (
              <li>
                <span className="text-green">Recipient:</span>{" "}
                {conditions.depositPayee}
              </li>
            ) : null}
            {conditions.balanceDays != null ? (
              <li>
                <span className="text-green">Balance:</span> within{" "}
                {conditions.balanceDays} days
                {conditions.buyersPremium ? ` · ${conditions.buyersPremium}` : ""}
              </li>
            ) : null}
          </ul>
          <p className="text-[0.7rem] leading-[1.6] text-charcoal mt-3">
            Deposit terms vary lot by lot. Murivest never sets deposit amounts,
            deadlines, methods or recipients — they are taken from the
            selling party&rsquo;s conditions of sale for this lot.
          </p>
        </div>
      ) : null}

      <ol className="max-w-[42rem] border-t border-hairline">
        {conditions.summaryPoints.map((point, i) => (
          <li
            key={i}
            className="py-4 border-b border-hairline flex gap-5 text-[0.95rem] leading-[1.8] text-ink"
          >
            <span className="font-serif text-lg text-gold flex-shrink-0 w-8">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{point}</span>
          </li>
        ))}
      </ol>

      {conditions.fullDocumentUrl ? (
        <a
          href={conditions.fullDocumentUrl}
          className="link-rule mt-8"
          target="_blank"
          rel="noopener noreferrer"
        >
          {conditions.documentLabel ?? "Full conditions of sale (PDF)"}
          <span className="arrow-box" aria-hidden="true">
            ↗
          </span>
        </a>
      ) : null}

      <div className="border border-hairline bg-cream p-6 mt-8 text-[0.75rem] leading-[1.7] text-charcoal font-body max-w-[42rem]">
        {CONDITIONS_DISCLAIMER}
      </div>
    </section>
  );
}
