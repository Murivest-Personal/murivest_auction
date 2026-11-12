import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FEE_SUMMARY } from "@/lib/legal";
import { SITE } from "@/lib/brand";

export const metadata = buildMetadata({
  title: "Buyer Fees — Transparent 2% Brokerage Terms | Murivest",
  description:
    "Murivest charges the successful buyer a brokerage fee of 2% of the final purchase price, payable after the 10% deposit. Worked examples, what the fee covers, and how it differs from auction deposits.",
  path: "/buyer-fees",
});

const EXAMPLES = [
  { price: "KES 10,000,000", fee: "KES 200,000" },
  { price: "KES 50,000,000", fee: "KES 1,000,000" },
  { price: "KES 100,000,000", fee: "KES 2,000,000" },
];

const FAQS = [
  {
    question: "Who pays the Murivest brokerage fee?",
    answer:
      "The successful buyer pays it. Murivest charges a buyer-side brokerage fee of 2% of the final purchase price under a separately accepted buyer engagement. The selling bank or institution does not pay Murivest, which keeps the firm's incentives aligned with the purchaser.",
  },
  {
    question: "When does the 2% fee become payable?",
    answer:
      "The fee becomes payable after the buyer has paid the 10% deposit of the purchase price required under the auction conditions. At the point of registering a bid through this website, the buyer accepts these fee terms explicitly, and the acceptance is recorded.",
  },
  {
    question: "Is the brokerage fee part of the 10% deposit?",
    answer:
      "No. The deposit is paid to the selling party under the auction conditions of sale. The brokerage fee is a separate obligation to Murivest, payable after the deposit. The auctioneer's charges, where the conditions allocate them to the purchaser, are separate again.",
  },
  {
    question: "Is the fee payable if I register interest but do not buy?",
    answer:
      "No. Registering interest, requesting a property brief, or submitting a bid registration does not by itself trigger the fee. The fee attaches to a successful acquisition under an accepted buyer engagement.",
  },
  {
    question: "Does Murivest receive the deposit or the balance of the purchase price?",
    answer:
      "No. Deposits and completion monies are paid to the selling party under the auction conditions. Murivest is not the auctioneer, does not hold deposits, and is not a party to the sale contract.",
  },
  {
    question: "Are there other costs on top of the fee?",
    answer:
      "Yes. A buyer at auction should budget for the deposit, stamp duty, legal and conveyancing costs, auctioneer's charges where allocated by the conditions, clearance of any arrears, and financing costs. The research desk publishes a full cost framework in the article on the true cost of buying auction property in Kenya.",
  },
];

export default function BuyerFeesPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Buyer fees", url: "/buyer-fees" },
          ]),
          faqPageJsonLd(FAQS),
        ]}
      />

      <section className="py-16 md:py-24 border-b border-hairline">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="flex flex-wrap items-center gap-2 text-[0.6rem] tracking-[0.2em] uppercase text-charcoal font-display">
              <li>
                <Link href="/" className="hover:text-gold transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-green">
                Buyer fees
              </li>
            </ol>
          </nav>
          <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-5">
            Buyer engagement terms
          </span>
          <h1 className="font-serif font-light text-green leading-[1.15] text-[clamp(2.2rem,4vw,3.6rem)] max-w-[46rem] mb-6">
            Transparent buyer representation. Clear brokerage terms.
          </h1>
          <p className="max-w-[42rem] text-[1.05rem] leading-[1.9] text-ink">
            Murivest acts for buyers, not sellers. The engagement is paid for
            by the party it serves: a brokerage fee of 2% of the final
            purchase price, payable by the successful purchaser after the 10%
            deposit. Stated plainly, agreed explicitly, recorded with every
            bid registration.
          </p>
        </Container>
      </section>

      {/* The fee, stated */}
      <section className="py-14 md:py-20 border-b border-hairline">
        <Container>
          <SectionHeader
            numeral="I"
            eyebrow="The fee"
            title="2% of the final purchase price."
          />
          <div className="max-w-[42rem]">
            <p className="text-[0.95rem] leading-[1.8] text-ink mb-6">
              {FEE_SUMMARY}
            </p>
            <div className="border-l-2 border-gold pl-6 py-1">
              <p className="text-[1rem] leading-[1.8] text-green">
                <strong>
                  The fee becomes payable after the buyer has paid the 10%
                  deposit of the purchase price to the selling party under the
                  auction conditions.
                </strong>
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Worked examples */}
      <section className="py-14 md:py-20 border-b border-hairline bg-white">
        <Container>
          <SectionHeader
            numeral="II"
            eyebrow="Worked examples"
            title="What 2% means in shillings."
          />
          <div className="max-w-[52rem] border border-hairline">
            <div className="grid grid-cols-2 bg-green text-cream">
              <p className="p-5 font-display text-[0.55rem] tracking-[0.3em] uppercase">
                Final purchase price
              </p>
              <p className="p-5 font-display text-[0.55rem] tracking-[0.3em] uppercase border-l border-cream/20">
                Murivest brokerage fee
              </p>
            </div>
            {EXAMPLES.map((row, i) => (
              <div
                key={row.price}
                className={`grid grid-cols-2 ${i > 0 ? "border-t border-hairline" : ""}`}
              >
                <p className="p-6 font-serif text-xl font-light text-green">
                  {row.price}
                </p>
                <p className="p-6 font-serif text-xl font-light text-green border-l border-hairline">
                  {row.fee}
                </p>
              </div>
            ))}
            <p className="p-5 border-t border-hairline text-[0.75rem] leading-[1.7] text-charcoal">
              Examples are illustrative. The fee is calculated on the final
              purchase price achieved at auction or through the authorised
              sale channel, and is exclusive of applicable taxes.
            </p>
          </div>
        </Container>
      </section>

      {/* Three money flows */}
      <section className="py-14 md:py-20 border-b border-hairline">
        <Container>
          <SectionHeader
            numeral="III"
            eyebrow="Three money flows, never confused"
            title="Deposit, auctioneer charges, brokerage."
          />
          <div className="grid gap-px bg-hairline border border-hairline md:grid-cols-3">
            <div className="bg-cream p-8">
              <p className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-4">
                01 — The deposit
              </p>
              <h3 className="font-serif text-xl font-light text-green mb-3">
                Paid to the selling party
              </h3>
              <p className="text-[0.9rem] leading-[1.8] text-ink">
                The 10% deposit of the purchase price, required under the
                auction conditions, is paid to the selling party — never to
                Murivest. It binds the sale at the fall of the hammer.
              </p>
            </div>
            <div className="bg-cream p-8">
              <p className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-4">
                02 — Auctioneer charges
              </p>
              <h3 className="font-serif text-xl font-light text-green mb-3">
                Set by the conditions
              </h3>
              <p className="text-[0.9rem] leading-[1.8] text-ink">
                The appointed auctioneer&apos;s charges follow the statutory
                scale and the conditions of sale, which may allocate them to
                the purchaser. They are owed to the auctioneer, not to
                Murivest.
              </p>
            </div>
            <div className="bg-cream p-8">
              <p className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-4">
                03 — Buyer brokerage
              </p>
              <h3 className="font-serif text-xl font-light text-green mb-3">
                Paid to Murivest, after the deposit
              </h3>
              <p className="text-[0.9rem] leading-[1.8] text-ink">
                The 2% fee is the buyer&apos;s separate engagement of Murivest
                — lot discovery, verification, diligence coordination, bidding
                support and completion management. Accepted in writing with
                every bid registration.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* What the fee covers */}
      <section className="py-14 md:py-20 border-b border-hairline bg-white">
        <Container>
          <SectionHeader
            numeral="IV"
            eyebrow="What the fee covers"
            title="The buyer's side of the table, staffed."
          />
          <div className="grid gap-10 lg:grid-cols-2 max-w-[52rem]">
            <ul className="space-y-4">
              {[
                "Lot discovery and verified auction intelligence",
                "Assessment of the auction process and sale authority",
                "Coordination of title, rates and occupancy diligence",
                "Inspection arrangements where access permits",
                "Bid registration, strategy and execution support",
                "Deposit, completion and documentation management",
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-4 text-[0.95rem] leading-[1.7] text-ink"
                >
                  <span aria-hidden="true" className="text-gold">
                    —
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div>
              <p className="text-[0.95rem] leading-[1.8] text-ink mb-6">
                What the fee does not cover: the deposit, stamp duty, legal
                conveyancing by the buyer&apos;s own advocate, the
                auctioneer&apos;s charges, financing costs, and any tax on the
                fee itself. The buyer engages independent legal counsel;
                Murivest does not provide legal, valuation or tax services.
              </p>
              <p className="text-[0.95rem] leading-[1.8] text-ink">
                The fee arrangement is set out in the buyer engagement terms
                and is subject to professional legal and tax review in Kenya.
                All engagements are by mandate only and subject to KYC/AML
                verification.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-14 md:py-20">
        <Container>
          <SectionHeader
            numeral="V"
            eyebrow="Questions"
            title="Buyer fee FAQs."
          />
          <div className="max-w-[42rem]">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group border-t border-hairline py-5 [&:last-of-type]:border-b"
              >
                <summary className="flex items-center justify-between gap-6 cursor-pointer list-none">
                  <span className="font-serif text-lg font-light text-green">
                    {faq.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex-shrink-0 w-7 h-7 border border-sand flex items-center justify-center text-xs text-green group-open:bg-green group-open:text-cream transition-colors"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 text-[0.95rem] leading-[1.8] text-ink max-w-[40rem]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
          <p className="mt-10 text-[0.85rem] leading-[1.7] text-charcoal max-w-[42rem]">
            Questions about a specific lot? Write to{" "}
            <a
              href={`mailto:${SITE.officeEmail}`}
              className="text-green hover:text-gold transition-colors"
            >
              {SITE.officeEmail}
            </a>{" "}
            or read{" "}
            <Link
              href="/intelligence/buyer-brokerage-2-percent-model-why-sellers-bank-never-pays"
              className="text-green underline underline-offset-4 hover:text-gold transition-colors"
            >
              why the seller&apos;s bank never pays your advisor
            </Link>
            .
          </p>
        </Container>
      </section>
    </>
  );
}
