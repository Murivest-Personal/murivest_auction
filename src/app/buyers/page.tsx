import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { ClassificationLadder } from "@/components/buyers/ClassificationLadder";

export const metadata = buildMetadata({
  title: "Buyer Access & Participation | Murivest Auction Marketplace",
  description:
    "Create a Murivest account to participate in the auction marketplace. Complete identity and funding verification, save lots, submit bids or expressions of interest, and track your status.",
  path: "/buyers",
});

export default function BuyersLandingPage() {
  return (
    <>
      <section className="border-b border-hairline bg-cream py-16 md:py-24">
        <Container>
          <div className="max-w-3xl">
            <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-6">
              Buyer access
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-light text-green leading-[1.15] mb-6">
              Participate in the marketplace with a verified account.
            </h1>
            <p className="text-[1.05rem] leading-[1.9] text-ink mb-10">
              Create a Murivest account to save lots, receive alerts, submit
              bids or expressions of interest on eligible opportunities, and
              track your verification and activity in one place. Qualification
              helps ensure participants are prepared and that sensitive lot
              information is shared appropriately.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-3.5 text-[0.65rem] tracking-[0.22em] uppercase font-display bg-green text-cream hover:bg-gold transition-colors"
              >
                Create account
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center px-8 py-3.5 text-[0.65rem] tracking-[0.22em] uppercase font-display text-green border border-green hover:bg-green hover:text-cream transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auctions"
                className="inline-flex items-center justify-center px-8 py-3.5 text-[0.65rem] tracking-[0.22em] uppercase font-display text-green hover:text-gold transition-colors"
              >
                Browse lots →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-16 md:py-24">
        <div className="grid gap-16 lg:grid-cols-2 max-w-[72rem] mx-auto">
          <div>
            <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
              What your account enables
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-8">
              One account for marketplace activity.
            </h2>
            <ul className="border-t border-hairline">
              {[
                "Save and watch lots across Kenya and UK markets",
                "Receive auction alerts and relevant updates",
                "Submit bids or expressions of interest on eligible lots",
                "Track bid status and account activity",
                "Follow identity and funding verification progress",
                "Access lot information released under applicable terms",
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
            </ul>
            <div className="border border-hairline bg-cream p-6 mt-8 text-[0.8rem] leading-[1.8] text-charcoal">
              Submissions through this website may be expressions of intent or
              bids depending on the lot and sale channel. Binding sale terms,
              deposits and completion obligations are governed by the applicable
              auction conditions and sale documentation.
            </div>
          </div>

          <div>
            <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
              Qualification
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-8">
              From registration to participation.
            </h2>
            <ClassificationLadder />
            <div className="border border-green bg-cream p-6 mt-8">
              <p className="text-[0.85rem] leading-[1.8] text-ink">
                <span className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold block mb-3">
                  Your dashboard
                </span>
                Manage watchlists, bids, profile details and notifications from
                your account dashboard. Supporting information is handled
                confidentially in line with platform terms and privacy policy.
              </p>
            </div>
          </div>
        </div>
      </Container>

      <section className="border-t border-hairline bg-white py-16 md:py-20">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-6">
              Ready to explore opportunities?
            </h2>
            <p className="text-[0.95rem] leading-[1.9] text-ink mb-8">
              Browse current lots across Kenya and the UK, then create an
              account to save opportunities and participate when you are ready.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/auctions"
                className="inline-flex items-center justify-center px-8 py-3.5 text-[0.65rem] tracking-[0.22em] uppercase font-display bg-green text-cream hover:bg-gold transition-colors"
              >
                Browse auctions
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-3.5 text-[0.65rem] tracking-[0.22em] uppercase font-display text-green border border-green hover:bg-green hover:text-cream transition-colors"
              >
                Create account
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
