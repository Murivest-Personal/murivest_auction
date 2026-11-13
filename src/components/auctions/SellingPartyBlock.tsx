import { SELLING_PARTY_STATEMENT } from "@/lib/legal";
import type { Property } from "@/lib/types";

/** Selling party and auction mechanism — mandatory block
    (features spec §3.6). */
export function SellingPartyBlock({ property }: { property: Property }) {
  return (
    <section id="selling-party" className="scroll-mt-24">
      <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
        Disclosure
      </span>
      <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-6">
        Selling party and auction mechanism
      </h2>
      <div className="border border-hairline bg-white p-6 md:p-8 max-w-[42rem]">
        <p className="text-[1rem] leading-[1.9] text-ink mb-4">
          This lot is offered by{" "}
          <strong className="font-normal text-green">{property.sellingParty}</strong>{" "}
          under a public auction conducted by an appointed, licensed
          auctioneer. The identity of the selling institution and the
          appointed auctioneer, together with the full conditions of sale, are
          disclosed in the formal auction notice issued to registered bidders.
          {SELLING_PARTY_STATEMENT} Murivest acts for buyers under separate
          engagement and is not a party to the sale contract. All bids,
          deposits, and completions proceed under the selling party&rsquo;s
          terms.
        </p>
        <p className="text-[0.75rem] leading-[1.7] text-charcoal">
          Bids submitted from registered accounts on this website are routed by
          Murivest, as buyer-side brokerage, to the authorised sale channel.
          This is not a binding bid.
        </p>
      </div>
    </section>
  );
}
