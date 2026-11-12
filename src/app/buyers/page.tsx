import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { ClassificationLadder } from "@/components/buyers/ClassificationLadder";

export const metadata = buildMetadata({
  title: "Buyer registration & qualification | Murivest Group Ltd",
  description:
    "Register as a buyer with Murivest. Qualification covers identity and beneficial ownership (KYC), funding verification and per-property authorisation into confidential data rooms. Buyer-side representation for commercial property auctions in Kenya and the UK.",
  path: "/buyers",
});

/* Landing page for the buyer registration & qualification system.
   Explains the ladder, what is captured, and how confidential
   documentation is released (NDA + per-property authorisation). */
export default function BuyersLandingPage() {
  return (
    <>
      <section className="border-b border-hairline bg-cream py-16 md:py-24">
        <Container>
          <div className="max-w-3xl">
            <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-6">
              Buyer qualification system
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-light text-green leading-[1.15] mb-6">
              Qualified buyers enter the room prepared.
            </h1>
            <p className="text-[1.05rem] leading-[1.9] text-ink mb-10">
              Murivest qualifies buyers before introducing them to auction
              opportunities. Registration captures who is buying, where they
              are tax-resident, what they are buying, and whether the capital
              is real. Qualified buyers are then authorised — property by
              property — into confidential data rooms under a confidentiality
              agreement. This is how unqualified bidders are kept out of the
              process, and how serious buyers stop losing auctions they could
              not fund.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/buyers/register"
                className="inline-flex items-center justify-center px-8 py-3.5 text-[0.65rem] tracking-[0.22em] uppercase font-display bg-green text-cream hover:bg-gold transition-colors"
              >
                Register as a buyer
              </Link>
              <Link
                href="/buyers/sign-in"
                className="inline-flex items-center justify-center px-8 py-3.5 text-[0.65rem] tracking-[0.22em] uppercase font-display text-green border border-green hover:bg-green hover:text-cream transition-colors"
              >
                Sign in to the portal
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-16 md:py-24">
        <div className="grid gap-16 lg:grid-cols-2 max-w-[72rem] mx-auto">
          {/* What is captured */}
          <div>
            <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
              The registration file
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-8">
              Ten points, captured once.
            </h2>
            <ol className="border-t border-hairline">
              {[
                "Individual or corporate buyer",
                "Country of residence and tax jurisdiction",
                "Contact and identification information",
                "Purchasing entity and beneficial ownership",
                "Investment budget",
                "Preferred country and location",
                "Asset classes of interest",
                "Cash or financing preference",
                "Proof of funds or lender evidence",
                "Expected acquisition timeline",
              ].map((item, i) => (
                <li
                  key={i}
                  className="py-4 border-b border-hairline flex gap-5 text-[0.95rem] leading-[1.8] text-ink"
                >
                  <span className="font-serif text-lg text-gold flex-shrink-0 w-8">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
            <div className="border border-hairline bg-cream p-6 mt-8 text-[0.8rem] leading-[1.8] text-charcoal">
              Proof of funds and lender evidence are uploaded to Murivest&apos;s
              private, access-controlled document store. They are never
              displayed publicly, never stored in a public directory, and every
              internal view is logged.
            </div>
          </div>

          {/* The ladder */}
          <div>
            <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
              The qualification ladder
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-8">
              From registration to transaction.
            </h2>
            <ClassificationLadder />
            <div className="border border-green bg-cream p-6 mt-8">
              <p className="text-[0.85rem] leading-[1.8] text-ink">
                <span className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold block mb-3">
                  Confidential data rooms
                </span>
                From <strong>Qualified buyer</strong> upwards, you can be
                authorised into a property&apos;s data room: legal packs, title
                documents, tenancy schedules and addenda, each with version
                history, upload dates, expiry control and download permissions.
                Access is per property, under a timestamped confidentiality
                agreement, and can be revoked at any time.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Cross-border note */}
      <section className="border-t border-hairline bg-white py-16 md:py-20">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-6">
              Built for cross-border capital.
            </h2>
            <p className="text-[0.95rem] leading-[1.9] text-ink mb-8">
              A Kenyan investor assessing a UK auction lot — or a UK fund
              looking at Nairobi — faces different deposit rules, completion
              timetables, tax treatment and funding mechanics. Your
              registration records your jurisdiction and funding position so
              Murivest can underwrite the acquisition properly before you are
              in a competitive auction room.
            </p>
            <Link
              href="/buyers/register"
              className="inline-flex items-center justify-center px-8 py-3.5 text-[0.65rem] tracking-[0.22em] uppercase font-display bg-green text-cream hover:bg-gold transition-colors"
            >
              Start your registration
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
