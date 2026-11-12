import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";

export const metadata = buildMetadata({
  title: "The Legal Pack — Commercial Auction Due Diligence | Murivest",
  description:
    "What a commercial property auction legal pack contains in Kenya and the UK, what to review first, and why the buyer is deemed to purchase with full knowledge of title.",
  path: "/how-auctions-work/legal-pack",
});

const FAQS = [
  {
    question: "What is a legal pack?",
    answer:
      "The bundle of documents on which an auction lot will sell and complete — title documents, searches, tenancy information, statutory notices where applicable, and the general and special conditions of sale. Under the standard UK conditions the buyer is deemed to purchase with full knowledge of its contents.",
  },
  {
    question: "Can I bid if the legal pack is incomplete?",
    answer:
      "You can, but the price should reflect the residual risk. Track addenda up to the fall of the hammer — addenda form part of the contract. Where core documents are missing, the diligence question is not what the pack says, but what it cannot say.",
  },
  {
    question: "Who prepares the legal pack?",
    answer:
      "The selling party's solicitors or advocates prepare it; the auctioneer publishes it. Murivest states each lot's legal pack status — available, on request, or in preparation — on the listing, and routes legal pack requests to the selling party.",
  },
];

export default function LegalPackPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "How auctions work", url: "/how-auctions-work" },
            {
              name: "Legal pack and due diligence",
              url: "/how-auctions-work/legal-pack",
            },
          ]),
          faqPageJsonLd(FAQS),
        ]}
      />

      <section className="py-16 md:py-24 border-b border-hairline">
        <Container>
          <SectionHeader
            numeral="III"
            eyebrow="Due diligence"
            title="The legal pack and due diligence."
          />
          <p className="max-w-[42rem] text-[1.1rem] leading-[1.9] text-ink">
            A legal pack is the bundle of documents on which an auction lot
            will sell and complete. Under the standard conditions the buyer is
            deemed to purchase with full knowledge of title and raises no
            objection on matters disclosed in the pack, whether or not they
            inspected it. Review before bidding is therefore not optional
            diligence — it is the allocation of risk.
          </p>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <div className="max-w-[42rem] space-y-12">
            <div>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                What the pack contains
              </h2>
              <ul className="space-y-3">
                {[
                  "Title documents — the register or official search, the title plan or deed plan, and any documents referred to in the charges section.",
                  "Searches and replies — local, land charges and, in the UK, the property information enquiries; in Kenya, the official search and rates and rent clearance position.",
                  "Tenancy information — the tenancy schedule, leases and any licences, with rent review and break dates itemised.",
                  "Statutory notices — in Kenya, the notices under the Land Act 2012 and the Auctioneers Act on which the chargee sale depends.",
                  "Conditions of sale — the general conditions and the special conditions that vary deposit, completion and costs for the individual lot.",
                  "Addenda — anything published after the catalogue. Addenda form part of the contract and must be tracked to the fall of the hammer.",
                ].map((item) => (
                  <li key={item} className="flex gap-4 text-[1rem] leading-[1.8] text-ink">
                    <span className="text-gold flex-shrink-0" aria-hidden="true">
                      —
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                What to review first
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink mb-4">
                Start with the special conditions, because they move the
                numbers: the deposit, the completion date, the buyer&rsquo;s
                premium, and any costs the buyer bears. Then the tenure and
                encumbrances — what is being sold and what burdens it. Then
                the income: does the tenancy schedule support the stated net
                operating income, and are there arrears, breaks or upcoming
                vacancies the guide yield ignores?
              </p>
              <p className="text-[1rem] leading-[1.9] text-ink">
                In Kenya, commission an independent official search close to
                the auction date — the register can change between publication
                and the hammer. Verify rates arrears and zoning compliance at
                the Lands Registry and the county offices.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                When the pack is incomplete
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink mb-4">
                A missing document is information. It tells you the seller
                either does not have the document or has chosen not to show
                it, and the price should reflect which. Where the legal pack
                is at an early stage, the Murivest listing says so — buyers
                can register interest and be notified when it is published.
              </p>
              <p className="text-[1rem] leading-[1.9] text-ink">
                What the pack cannot ever do is become a substitute for your
                own advocate&rsquo;s review. The buyer who relies on the
                selling party&rsquo;s diligence has accepted the selling
                party&rsquo;s risk.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-hairline py-14 md:py-20">
        <Container>
          <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-8">
            Frequently asked questions
          </h2>
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
          <div className="mt-12">
            <ArrowLink href="/how-auctions-work/glossary">
              Auction glossary
            </ArrowLink>
          </div>
        </Container>
      </section>
    </>
  );
}
