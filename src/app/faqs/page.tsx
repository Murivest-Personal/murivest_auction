import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SITE } from "@/lib/brand";

export const metadata = buildMetadata({
  title: "Property Auction FAQs — Kenya & UK | Murivest",
  description:
    "Answers to the questions buyers actually ask about property auctions in Kenya: how auctions work, who pays the 2% brokerage fee, deposits, financing, due diligence, titles and possession.",
  path: "/faqs",
});

const GROUPS: { title: string; faqs: { question: string; answer: string }[] }[] = [
  {
    title: "How property auctions work",
    faqs: [
      {
        question: "How do property auctions work in Kenya?",
        answer:
          "A chargee — usually a bank — serves the statutory notices, instructs a licensed auctioneer, and offers the property at public auction under the Land Act 2012 power of sale. Buyers inspect the conditions of sale, conduct diligence, bid, pay the deposit set by that lot's conditions of sale, and complete within the stated window.",
      },
      {
        question: "Who conducts the auction?",
        answer:
          "A licensed auctioneer appointed by the selling party. Murivest is not the auctioneer: it publishes verified auction intelligence and represents buyers under separate mandate. The appointed auctioneer and sale conditions are identified in the formal auction notice issued to registered bidders.",
      },
      {
        question: "Does Murivest own the properties listed?",
        answer:
          "No. Murivest neither owns nor sells the lots. Properties are offered by selling parties — banks, receivers and other institutions — through the authorised sale channel. Murivest's role is buyer discovery, verification and representation.",
      },
      {
        question: "What is the difference between a guide price and a reserve price?",
        answer:
          "A guide price indicates the level at which the selling party expects bidding; the reserve is the minimum price the auctioneer may accept, usually anchored to a forced-sale valuation. Neither is a valuation of open-market value.",
      },
    ],
  },
  {
    title: "Bidding, fees and deposits",
    faqs: [
      {
        question: "How does Murivest earn its brokerage fee?",
        answer:
          "Through a buyer engagement. Murivest charges the successful buyer a brokerage fee of 2% of the final purchase price, payable after the buyer has paid the deposit required under the lot's conditions of sale. The terms are accepted explicitly at bid registration and recorded in the database.",
      },
      {
        question: "Is the 2% brokerage fee paid by the bank?",
        answer:
          "No. The selling bank or institution does not pay Murivest. The fee is the buyer's engagement of its representative — which is precisely what keeps the advice aligned with the buyer's interests rather than the seller's.",
      },
      {
        question: "Is the brokerage fee part of the auction deposit?",
        answer:
          "No. The deposit — its amount, deadline, payment method and recipient — is set by each lot's conditions of sale and paid to the selling party under those conditions. The 2% fee is a separate obligation to Murivest, payable after the deposit. Auctioneer charges, where allocated to the purchaser by the conditions, are separate again.",
      },
      {
        question: "Is an inquiry or bid registration a binding bid?",
        answer:
          "No. Bid registrations submitted through this website are expressions of buyer intent. Murivest routes them to the authorised sale channel and supports the acquisition. Formal bids are made under the auction conditions at the auction.",
      },
      {
        question: "Are auction deposits refundable?",
        answer:
          "Generally not where the successful bidder fails to complete; the conditions of sale govern forfeiture and re-sale. That is why the deposit must be liquid and the balance committed before bidding, not after.",
      },
    ],
  },
  {
    title: "Buying process and due diligence",
    faqs: [
      {
        question: "Can I inspect an auction property before bidding?",
        answer:
          "Where access permits, yes — arrangements can be made for registered bidders. Some lots, particularly occupied ones, allow exterior inspection only. The occupation status of every lot should be priced into the bid.",
      },
      {
        question: "Can I request property documents?",
        answer:
          "Registered bidders receive the property brief and, where authorised, the conditions of sale and supporting documentation. Title searches at the registry are conducted directly by the buyer's advocate.",
      },
      {
        question: "What due diligence should I do before bidding at auction in Kenya?",
        answer:
          "An official title search, county rates and land rent clearance, zoning confirmation, physical inspection, tenant documentation where tenanted, verification of the sale authority and statutory notices, and a full read of the conditions of sale. The research desk publishes the complete framework.",
      },
      {
        question: "Can I finance an auction purchase?",
        answer:
          "Yes, but the timeline is unforgiving. Auction completion windows are short; a letter of offer is not a disbursable facility. Pre-approval, bridging arrangements or cash are the workable positions.",
      },
      {
        question: "What happens after winning an auction?",
        answer:
          "The deposit is paid under the conditions, the balance is funded within the completion window, transfer is stamped and registered, and possession follows — immediately where vacant, through lawful process where the lot is occupied.",
      },
    ],
  },
  {
    title: "Kenya specifics",
    faqs: [
      {
        question: "Can foreign investors purchase property at Kenyan auctions?",
        answer:
          "Foreigners can generally acquire leasehold property in Kenya; freehold agricultural land is restricted. Financing for non-residents is limited, so foreign bidders commonly bid from cash or pre-arranged facilities. Professional advice on the Immigration and Land Control Acts is essential.",
      },
      {
        question: "What taxes and duties apply when buying at auction in Kenya?",
        answer:
          "Stamp duty on the transfer (4% of market value within municipalities and cities, 2% outside, as at writing), plus legal and auctioneer charges where the conditions allocate them. The seller's capital gains position is the seller's affair; the buyer should confirm current rates with a tax adviser.",
      },
      {
        question: "How do I register my interest in a lot?",
        answer:
          "Use the register-your-interest form on any listing, or the bid registration form. Registered bidders can also receive auction and off-market alerts through the Murivest client portal at portal.murivest.com.",
      },
      {
        question: "Can I purchase a commercial building through auction?",
        answer:
          "Yes — offices, warehouses, retail arcades and mixed-use buildings all surface at Kenyan auctions. Commercial lots reward institutional-grade diligence: tenant schedules, service charge history, zoning and title. Murivest specialises in exactly this file.",
      },
    ],
  },
];

const ALL_FAQS = GROUPS.flatMap((g) => g.faqs);

export default function FaqsPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "FAQs", url: "/faqs" },
          ]),
          faqPageJsonLd(ALL_FAQS),
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
                FAQs
              </li>
            </ol>
          </nav>
          <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-5">
            Frequently asked questions
          </span>
          <h1 className="font-serif font-light text-green leading-[1.15] text-[clamp(2.2rem,4vw,3.6rem)] max-w-[46rem] mb-6">
            The questions buyers actually ask.
          </h1>
          <p className="max-w-[42rem] text-[1.05rem] leading-[1.9] text-ink">
            Answers distinguish official auction terms from Murivest&apos;s
            service terms, and Kenya practice from UK practice. Nothing here
            is legal, tax or investment advice.
          </p>
        </Container>
      </section>

      {GROUPS.map((group, i) => (
        <section
          key={group.title}
          className={`py-14 md:py-20 ${i === 0 ? "" : "border-t border-hairline"} ${i % 2 === 1 ? "bg-white" : ""}`}
        >
          <Container>
            <SectionHeader
              numeral={String(i + 1).padStart(2, "0")}
              eyebrow={`Section ${String(i + 1).padStart(2, "0")}`}
              title={group.title}
            />
            <div className="max-w-[42rem]">
              {group.faqs.map((faq) => (
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
      ))}

      <section className="border-t border-hairline bg-green py-16 md:py-20">
        <Container>
          <div className="max-w-[46rem]">
            <span className="block font-display text-[0.55rem] tracking-[0.3em] uppercase text-[color:var(--mv-on-dark-faint)] mb-5">
              Still unanswered
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-light text-cream mb-5">
              Ask the desk directly.
            </h2>
            <p className="text-[0.95rem] leading-[1.8] text-[color:var(--mv-on-dark)] mb-8">
              Property-specific questions are answered by the team handling
              the lot. Buyer representation inquiries are answered within one
              business day, under mandate and subject to KYC/AML
              verification.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-[0.65rem] tracking-[0.25em] uppercase font-display border border-cream text-cream hover:bg-cream hover:text-green transition-colors"
              >
                Contact the desk
              </Link>
              <a
                href={`mailto:${SITE.officeEmail}`}
                className="inline-flex items-center justify-center px-8 py-4 text-[0.65rem] tracking-[0.25em] uppercase font-display text-cream/75 hover:text-gold transition-colors"
              >
                {SITE.officeEmail}
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
