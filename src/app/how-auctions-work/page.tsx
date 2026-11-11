import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = buildMetadata({
  title: "How Commercial Property Auctions Work — Kenya & UK | Murivest",
  description:
    "A buyer's and seller's guide to commercial property auctions in Kenya and the UK — legal packs, deposits, contracts, and the role of the auctioneer.",
  path: "/how-auctions-work",
});

const GUIDES = [
  {
    title: "Buying at auction",
    href: "/how-auctions-work/buying",
    description:
      "The process in both markets — preparation, the auction day, deposits and completion timetables.",
  },
  {
    title: "Selling at auction",
    href: "/how-auctions-work/selling",
    description:
      "Choosing the auction route, reserve strategy, preparing the legal pack early, and timing against the calendar.",
  },
  {
    title: "Legal pack and due diligence",
    href: "/how-auctions-work/legal-pack",
    description:
      "What a legal pack contains, what to review first, and what it means that the buyer purchases with full knowledge of title.",
  },
  {
    title: "Auction glossary",
    href: "/how-auctions-work/glossary",
    description:
      "Kenya and UK commercial property terms — from chargee sale and statutory notice to special conditions and buyer's premium.",
  },
];

const FAQS = [
  {
    question: "What is a commercial property auction?",
    answer:
      "A public sale in which a property is offered to the highest bidder above a reserve price, under a published set of conditions. In Kenya the process is governed by the Land Act 2012 and the Auctioneers Act; in the UK by the auction house's conditions, commonly the RICS Common Auction Conditions or the Standard Commercial Property Conditions.",
  },
  {
    question: "Can I bid without attending in person?",
    answer:
      "Most auction houses accept proxy, telephone and increasingly online bidding, but registration requirements and deposit arrangements differ. Confirm the mechanism with the auctioneer named on the listing before the auction date.",
  },
  {
    question: "What deposit do I need at a commercial auction?",
    answer:
      "In Kenya, 25% of the purchase price, payable immediately on the fall of the hammer in cash or by banker's cheque, with the 75% balance within 90 days. In the UK, 10% on exchange, with the balance typically 20 working days later.",
  },
  {
    question: "Is Murivest the auctioneer?",
    answer:
      "No. Murivest Group Ltd provides commercial real estate services and publishes auction intelligence. Murivest is not the auctioneer, does not receive bids, does not hold deposits, and does not act as principal in any auction transaction.",
  },
];

export default function HowAuctionsWorkPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "How auctions work", url: "/how-auctions-work" },
          ]),
          faqPageJsonLd(FAQS),
        ]}
      />

      <section className="py-16 md:py-24 border-b border-hairline">
        <Container>
          <SectionHeader
            numeral="—"
            eyebrow="Guides for buyers and sellers"
            title="How commercial property auctions work."
          />
          <div className="max-w-[42rem] space-y-5">
            <p className="text-[1.1rem] leading-[1.9] text-ink">
              A commercial property auction is a public sale in which a
              property is offered to the highest bidder above a reserve price,
              under a published set of conditions that bind the moment the
              auctioneer&rsquo;s hammer falls. The certainty of that moment is
              the product the auction room sells — and the reason preparation,
              not price, is what separates successful bidders from the rest.
            </p>
            <p className="text-[1.05rem] leading-[1.9] text-ink">
              The rules differ between Kenya and the United Kingdom in ways
              that matter: the deposit, the settlement period, the statutory
              notices, and the tax treatment. These guides set out both
              regimes side by side.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <div className="grid gap-px bg-hairline border border-hairline md:grid-cols-2">
            {GUIDES.map((guide, i) => (
              <Reveal key={guide.href} delay={i * 70} className="bg-cream">
                <article className="p-8 md:p-12 h-full flex flex-col">
                  <span className="text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-4">
                    Guide {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-serif text-2xl font-light text-green mb-4">
                    {guide.title}
                  </h2>
                  <p className="text-[0.95rem] leading-[1.8] text-ink mb-8">
                    {guide.description}
                  </p>
                  <div className="mt-auto">
                    <ArrowLink href={guide.href}>Read the guide</ArrowLink>
                  </div>
                </article>
              </Reveal>
            ))}
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
        </Container>
      </section>
    </>
  );
}
