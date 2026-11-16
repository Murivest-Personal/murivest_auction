import { notFound } from "next/navigation";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  realEstateListingJsonLd,
} from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { GalleryHero } from "@/components/auctions/GalleryHero";
import { InvestmentMetrics } from "@/components/auctions/InvestmentMetrics";
import { ConditionsOfSale } from "@/components/auctions/ConditionsOfSale";
import { SellingPartyBlock } from "@/components/auctions/SellingPartyBlock";
import { VerificationBlock } from "@/components/auctions/VerificationBlock";
import { PropertyMap } from "@/components/auctions/PropertyMap";
import { BidForm } from "@/components/auctions/BidForm";
import { InquiryForm } from "@/components/auctions/InquiryForm";
import { AuctionSidebar } from "@/components/auctions/AuctionSidebar";
import { UnderwritingGates } from "@/components/auctions/UnderwritingGates";
import { CommentList } from "@/components/auctions/CommentList";
import { CommentForm } from "@/components/auctions/CommentForm";
import { Collapsible } from "@/components/ui/Collapsible";
import { LoanRepaymentCalculator } from "@/components/calculators/LoanRepaymentCalculator";
import { ReturnCalculator } from "@/components/calculators/ReturnCalculator";
import {
  getPropertyBySlug,
  getRelatedProperties,
  getAllSlugs,
} from "@/lib/content";
import { getApprovedComments } from "@/lib/comments";
import { AUCTION_DISCLOSURE } from "@/lib/legal";
import { SITE } from "@/lib/brand";
import { formatCurrency, formatDate, marketLabel } from "@/lib/format";
import type { Property } from "@/lib/types";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

/* In-page section index — anchors used by the sticky sub-navigation. */
const IN_PAGE_SECTIONS: { id: string; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "financials", label: "Financials" },
  { id: "description", label: "Description" },
  { id: "location", label: "Location" },
  { id: "documentation", label: "Documentation" },
  { id: "parties", label: "Parties" },
  { id: "comments", label: "Comments" },
];

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property)
    return buildMetadata({
      title: "Lot not found | Murivest Group Ltd",
      description: "This auction lot could not be found.",
      path: `/auctions/${slug}`,
    });
  return buildMetadata({
    title: `${property.title} — ${marketLabel(property.market)} commercial property auction | Murivest`,
    description: `${property.title} in ${property.location} — ${property.assetType}, guide price ${property.guidePrice ?? "on application"}, auction date ${property.auctionDate ? formatDate(property.auctionDate) : "to be confirmed"}. Selling party: ${property.sellingParty}. Verified listing by Murivest Group Ltd.`,
    path: `/auctions/${property.slug}`,
    ogImage: property.mainImage?.url,
  });
}

const LISTING_FAQS = [
  {
    question: "Is Murivest the auctioneer?",
    answer:
      "No. Murivest Group Ltd provides commercial real estate services and publishes auction intelligence. Murivest is not the auctioneer, does not receive bids, does not hold deposits, and does not act as principal in any auction transaction. The selling party named on this listing is responsible for the auction process, the legal pack, and the sale contract.",
  },
  {
    question: "Do I need an account to bid?",
    answer:
      "Yes. Bidding is exclusive to registered accounts on this website — create your account or sign in, then use the Submit a bid button on this page. Your details are taken from your account, so submission is one screen. To bid at the auction itself you must also register with the auctioneer under the auctioneer's own process.",
  },
  {
    question: "What happens after I submit my bid?",
    answer:
      "Your bid is recorded against your account, received by the Murivest deal team, reviewed, and routed to the selling party named on the listing together with the auctioneer where applicable. You can follow its status from your account profile, and you will receive a confirmation by email. A submission is not a binding bid.",
  },
];

export default async function PropertyDetailPage({ params }: Params) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const [related, comments] = await Promise.all([
    getRelatedProperties(property),
    getApprovedComments(property._id),
  ]);

  const currency = property.facts.currency ?? "USD";
  const subject = property.referenceCode ?? property.title;

  return (
    <>
      <JsonLd
        data={[
          realEstateListingJsonLd(property),
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            {
              name: marketLabel(property.market),
              url: property.market === "kenya" ? "/kenya" : "/uk",
            },
            { name: property.title, url: `/auctions/${property.slug}` },
          ]),
          faqPageJsonLd(LISTING_FAQS),
        ]}
      />

      <div className="pb-24 lg:pb-0">
        <GalleryHero
          title={property.title}
          location={property.location}
          assetType={property.assetType}
          market={property.market}
          status={property.status}
          auctionDate={property.auctionDate}
          mainImage={property.mainImage}
          gallery={property.gallery}
          isNewListing={property.isNewListing}
          subline={[property.location, property.assetType, property.size]
            .filter(Boolean)
            .join(" · ")}
        />

        <Container className="py-8 md:py-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-[0.6rem] tracking-[0.2em] uppercase text-charcoal font-body">
              <li>
                <Link href="/" className="hover:text-gold transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={property.market === "kenya" ? "/kenya" : "/uk"}
                  className="hover:text-gold transition-colors"
                >
                  {marketLabel(property.market)} auctions
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-green">
                {property.referenceCode ?? property.title}
              </li>
            </ol>
          </nav>

          {/* At-a-glance band */}
          <GlanceBand property={property} />

          {/* Sticky in-page navigation */}
          <nav
            aria-label="On this page"
            className="sticky top-16 lg:top-0 z-20 -mx-4 md:mx-0 px-4 md:px-0 mt-8 bg-cream/95 backdrop-blur border-y border-hairline"
          >
            <ul className="flex gap-0 overflow-x-auto font-display text-[0.55rem] tracking-[0.22em] uppercase">
              {IN_PAGE_SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="inline-block px-3 md:px-4 py-3.5 text-charcoal hover:text-gold border-b-2 border-transparent hover:border-gold transition-colors whitespace-nowrap"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="grid gap-12 lg:gap-16 lg:grid-cols-[2fr_1fr] mt-10">
            {/* ---------------- Left column ---------------- */}
            <div>
              {/* Overview */}
              <section id="overview" className="scroll-mt-32">
                <KeyFactsTable property={property} />
              </section>

              {/* Financials */}
              <section id="financials" className="scroll-mt-32 mt-16 border-t border-hairline pt-10">
                <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-3">
                  Financials
                </span>
                <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-6">
                  Investment metrics
                </h2>
                <InvestmentMetrics property={property} />

                {property.facts.price ? (
                  <div className="mt-8">
                    <Collapsible
                      id="loan-repayment-calculator"
                      eyebrow="Debt side"
                      title="Loan repayment calculator"
                      description="Monthly payments, total interest and the amortisation schedule for this lot — click to open."
                    >
                      <LoanRepaymentCalculator
                        variant="page"
                        defaultPrincipal={Math.round(property.facts.price * 0.65)}
                        defaultRate={property.market === "kenya" ? 13 : 6.5}
                        defaultYears={10}
                        currency={currency}
                      />
                    </Collapsible>
                  </div>
                ) : null}

                <div className="mt-10">
                  <UnderwritingGates property={property} />
                </div>
              </section>

              {/* Description */}
              <section id="description" className="scroll-mt-32 mt-16 border-t border-hairline pt-10">
                <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-3">
                  The asset
                </span>
                <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-6">
                  Description
                </h2>
                <div className="max-w-[42rem] space-y-5">
                  {property.description.map((paragraph, i) => (
                    <p key={i} className="text-[1.05rem] leading-[1.9] text-ink">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {property.keyHighlights.length > 0 ? (
                  <div className="mt-10">
                    <h3 className="font-serif text-xl font-light text-green mb-5">
                      Key highlights
                    </h3>
                    <ul className="space-y-3 max-w-[42rem]">
                      {property.keyHighlights.map((highlight, i) => (
                        <li
                          key={i}
                          className="flex gap-4 text-[0.95rem] leading-[1.8] text-ink"
                        >
                          <span className="text-gold flex-shrink-0" aria-hidden="true">
                            —
                          </span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>

              {/* Location */}
              <section id="location" className="scroll-mt-32 mt-16 border-t border-hairline pt-10">
                 <PropertyMap
                  coordinates={property.coordinates}
                  title={property.title}
                  address={property.location}
                />
              </section>

              {/* Documentation + Conditions */}
              <section id="documentation" className="scroll-mt-32 mt-16 border-t border-hairline pt-10">
                <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-3">
                  Documentation
                </span>
                <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-6">
                  Documentation &amp; legal pack
                </h2>

                <div className="grid md:grid-cols-[1.15fr_1fr] gap-8">
                  <div>
                    <p className="text-[0.95rem] leading-[1.85] text-ink mb-4">
                      The full legal pack, title documents, tenancy schedule
                      and any addenda for this lot are released to qualified
                      buyers on request, under confidentiality and mandate
                      arrangements.
                    </p>
                    <p className="text-[0.85rem] leading-[1.75] text-charcoal mb-6">
                      Every request is reviewed against your account
                      verification status. Qualified buyers receive the
                      complete pack for the lots they are pursuing, together
                      with the auction notice and conditions of sale as
                      published by the selling party.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={`mailto:${SITE.officeEmail}?subject=${encodeURIComponent(
                          `Documentation request — ${subject}`
                        )}`}
                        className="inline-flex items-center justify-center px-6 py-3 text-[0.6rem] tracking-[0.22em] uppercase font-display text-cream bg-green hover:bg-green/90 transition-colors"
                      >
                        Request the legal pack
                      </a>
                      <Link
                        href="/account"
                        className="inline-flex items-center justify-center px-6 py-3 text-[0.6rem] tracking-[0.22em] uppercase font-display text-green border border-green hover:bg-green hover:text-cream transition-colors"
                      >
                        Your verification status
                      </Link>
                    </div>
                  </div>

                  <div className="border border-hairline bg-white">
                    <div className="px-4 py-3 border-b border-hairline">
                      <span className="font-display text-[0.5rem] tracking-[0.25em] uppercase text-gold">
                        Pack contents
                      </span>
                    </div>
                    <ul className="divide-y divide-hairline">
                      {[
                        {
                          label: "Legal pack",
                          hint: "Title, searches, planning, environmental",
                        },
                        {
                          label: "Title documents",
                          hint: "Registered title, plan and encumbrances",
                        },
                        {
                          label: "Tenancy schedule",
                          hint: "Occupiers, rents, lease terms",
                        },
                        {
                          label: "Addenda",
                          hint: "Amendments and clarifications",
                        },
                      ].map((d) => (
                        <li key={d.label} className="flex items-start justify-between gap-3 p-4">
                          <div className="min-w-0">
                            <p className="font-body text-[0.9rem] text-green">
                              {d.label}
                            </p>
                            <p className="text-[0.72rem] leading-[1.6] text-charcoal mt-0.5">
                              {d.hint}
                            </p>
                          </div>
                          <span className="shrink-0 inline-block px-2 py-0.5 border border-hairline text-[0.45rem] font-display tracking-[0.2em] uppercase text-charcoal whitespace-nowrap">
                            On request
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Conditions of sale — kept below documentation because
                    they are released as part of the pack */}
                <div className="mt-12">
                  {property.conditionsOfSale ? (
                    <ConditionsOfSale conditions={property.conditionsOfSale} />
                  ) : (
                    <p className="text-[0.9rem] text-charcoal">
                      Conditions of sale for this lot are available on request
                      from the selling party.
                    </p>
                  )}
                </div>
              </section>

              {/* Parties */}
              <section id="parties" className="scroll-mt-32 mt-16 border-t border-hairline pt-10">
                <SellingPartyBlock property={property} />
                <div className="mt-10">
                  <VerificationBlock property={property} />
                </div>
              </section>

              {/* Comments */}
              <section id="comments" className="scroll-mt-32 mt-16 border-t border-hairline pt-10">
                <Collapsible
                  id="public-comments"
                  eyebrow="Moderated by default"
                  title="Comments & questions"
                  meta={
                    comments.length > 0
                      ? `${comments.length} published`
                      : "Be the first"
                  }
                  description="Leave a comment or a question on this lot — published comments show the author's name only. Click to open."
                >
                  <CommentForm property={property} />
                  <CommentList comments={comments} hideHeading />
                </Collapsible>
              </section>
            </div>

            {/* ---------------- Sidebar ---------------- */}
            <div>
              <div className="lg:sticky lg:top-28">
                <AuctionSidebar property={property} />
                <QuickActionsCard subject={subject} />
                <div className="mt-6">
                  <Collapsible
                    id="return-calculator"
                    eyebrow="Buyer tools"
                    title="Return calculator"
                    description="Net yield, cash-on-cash, DSCR and levered IRR for this lot — click to open."
                  >
                    <ReturnCalculator
                      variant="embedded"
                      defaultPrice={property.facts.price ?? 260_298}
                      defaultNoi={property.facts.noi ?? 0}
                      currency={currency}
                    />
                  </Collapsible>
                </div>
              </div>
            </div>
          </div>
        </Container>

        {/* Bid submission */}
        <section
          id="submit-a-bid"
          className="scroll-mt-24 border-t border-hairline py-20 md:py-28"
        >
          <Container>
            <BidForm property={property} />
          </Container>
        </section>

        {/* Register interest */}
        <section className="border-t border-hairline py-20 md:py-28 bg-white">
          <Container>
            <div className="grid gap-12 lg:grid-cols-2 max-w-[72rem] mx-auto">
              <div>
                <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-5">
                  Not ready to bid?
                </span>
                <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-4">
                  Register your interest.
                </h2>
                <p className="text-[0.95rem] leading-[1.8] text-ink mb-8">
                  Request the property brief, arrange a viewing, or put a
                  question to the team handling this lot. Murivest represents
                  buyers — under a separate engagement with transparent terms.
                </p>
                <div className="border border-hairline">
                  <div className="p-5 border-b border-hairline">
                    <p className="text-[0.85rem] leading-[1.7] text-ink">
                      <span className="text-green">Buyer brokerage:</span>{" "}
                      Murivest charges the successful buyer a fee of{" "}
                      <strong>
                        2% of the final purchase price, payable after the{" "}
                        {property.conditionsOfSale?.depositPercent != null
                          ? `${property.conditionsOfSale.depositPercent}% deposit`
                          : "deposit required under this lot's conditions of sale"}
                      </strong>{" "}
                      (the deposit, its deadline, method and recipient are set
                      by this lot&rsquo;s conditions of sale).{" "}
                      <Link
                        href="/buyer-fees"
                        className="text-green underline underline-offset-4 hover:text-gold transition-colors"
                      >
                        Read the full fee terms
                      </Link>
                      .
                    </p>
                  </div>
                  <div className="p-5">
                    <p className="text-[0.85rem] leading-[1.7] text-ink">
                      <span className="text-green">Auction alerts:</span> be
                      notified of this and similar lots — including off-market
                      opportunities — from{" "}
                      <Link
                        href="/register"
                        className="text-green underline underline-offset-4 hover:text-gold transition-colors"
                      >
                        your account on this website
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              </div>
              <InquiryForm
                compact
                property={{
                  _id: property._id,
                  slug: property.slug,
                  title: property.title,
                }}
              />
            </div>
          </Container>
        </section>

        {/* Related lots */}
        {related.length > 0 ? (
          <section className="border-t border-hairline py-20 md:py-28">
            <Container>
              <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
                Same market · {property.assetType}
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-10">
                Related lots
              </h2>
              <div className="grid gap-px bg-hairline border border-hairline md:grid-cols-2 lg:grid-cols-3">
                {related.map((lot) => (
                  <PropertyCard key={lot._id} property={lot} className="bg-white" />
                ))}
              </div>
            </Container>
          </section>
        ) : null}

        {/* Legal disclosure */}
        <Container className="pb-16">
          <div className="border border-hairline bg-cream p-6 text-[0.75rem] leading-[1.7] text-charcoal font-body">
            {AUCTION_DISCLOSURE}
          </div>
        </Container>
      </div>

      {/* Mobile sticky bid bar */}
      <MobileBidBar property={property} />
    </>
  );
}

/* ---------------------------------------------------------------- */
/* Subcomponents                                                    */
/* ---------------------------------------------------------------- */

function GlanceBand({ property }: { property: Property }) {
  const f = property.facts;
  const items = [
    {
      label: "Guide price",
      value: property.guidePrice ?? "On application",
      price: true,
    },
    { label: "Net yield", value: property.yield ?? "—" },
    {
      label: "Net operating income",
      value: f.noi
        ? `${formatCurrency(f.noi, f.currency ?? "USD")} p.a.`
        : "—",
      price: true,
    },
    {
      label: "Auction",
      value: property.auctionDate
        ? formatDate(property.auctionDate)
        : "Offered privately",
    },
  ];

  return (
    <section
      aria-label="Key figures"
      className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-hairline border border-hairline"
    >
      {items.map((it) => (
        <div key={it.label} className="bg-white p-4 md:p-5">
          <span className="block font-display text-[0.5rem] tracking-[0.25em] uppercase text-gold mb-2">
            {it.label}
          </span>
          <span
            className={`block font-serif text-lg md:text-xl text-green leading-tight ${
              it.price ? "price" : ""
            }`}
          >
            {it.value}
          </span>
        </div>
      ))}
    </section>
  );
}

function QuickActionsCard({ subject }: { subject: string }) {
  const linkClass =
    "block px-4 py-3 font-body text-[0.85rem] text-green hover:text-gold transition-colors";
  return (
    <div className="mt-6 border border-hairline bg-white">
      <div className="border-b border-hairline px-4 py-3">
        <span className="font-display text-[0.5rem] tracking-[0.25em] uppercase text-gold">
          Quick actions
        </span>
      </div>
      <ul className="divide-y divide-hairline">
        <li>
          <a
            href={`mailto:${SITE.officeEmail}?subject=${encodeURIComponent(
              `Documentation request — ${subject}`
            )}`}
            className={linkClass}
          >
            Request documentation
          </a>
        </li>
        <li>
          <a
            href={`mailto:${SITE.officeEmail}?subject=${encodeURIComponent(
              `Viewing request — ${subject}`
            )}`}
            className={linkClass}
          >
            Arrange a viewing
          </a>
        </li>
        <li>
          <a
            href={`mailto:${SITE.officeEmail}?subject=${encodeURIComponent(
              `Question — ${subject}`
            )}`}
            className={linkClass}
          >
            Ask the deal team
          </a>
        </li>
        <li>
          <Link href="/account" className={linkClass}>
            Your verification status
          </Link>
        </li>
      </ul>
    </div>
  );
}

function MobileBidBar({ property }: { property: Property }) {
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-cream border-t border-hairline px-4 py-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <span className="block font-display text-[0.45rem] tracking-[0.22em] uppercase text-gold">
          Guide price
        </span>
        <span className="block font-serif text-base text-green truncate">
          {property.guidePrice ?? "On application"}
        </span>
      </div>
      <a
        href="#submit-a-bid"
        className="shrink-0 inline-flex items-center justify-center px-5 py-2.5 bg-green text-cream font-display text-[0.55rem] tracking-[0.22em] uppercase hover:bg-green/90 transition-colors"
      >
        Submit a bid
      </a>
    </div>
  );
}

function KeyFactsTable({ property }: { property: Property }) {
  const f = property.facts;
  const rows: { label: string; value: string; price?: boolean }[] = [
    { label: "Asset type", value: property.assetType },
    { label: "Tenure", value: property.tenure ?? "—" },
    { label: "Size", value: property.size ?? "—" },
    { label: "Guide price", value: property.guidePrice ?? "—", price: true },
    ...(property.reservePrice && property.reservePrice !== "Undisclosed"
      ? [{ label: "Reserve price", value: property.reservePrice, price: true }]
      : []),
    ...(property.yield ? [{ label: "Net yield", value: property.yield }] : []),
    {
      label: "Auction date",
      value: property.auctionDate
        ? formatDate(property.auctionDate)
        : "Offered privately",
    },
    { label: "Auction house", value: property.auctionHouse ?? "—" },
    { label: "Selling party", value: property.sellingParty },
    {
      label: "Legal pack",
      value: property.legalPackAvailable ? "Available" : "On request",
    },
    ...(f.saleType ? [{ label: "Sale type", value: f.saleType }] : []),
    ...(f.subtype ? [{ label: "Subtype", value: f.subtype }] : []),
    ...(f.buildingClass
      ? [{ label: "Building class", value: `Class ${f.buildingClass}` }]
      : []),
    ...(f.yearBuilt ? [{ label: "Year built", value: String(f.yearBuilt) }] : []),
    ...(f.price
      ? [
          {
            label: "Price",
            value: formatCurrency(f.price, f.currency ?? "USD"),
            price: true,
          },
        ]
      : []),
    ...(f.pricePerSf
      ? [
          {
            label: "Price per sq ft",
            value: formatCurrency(f.pricePerSf, f.currency ?? "USD"),
            price: true,
          },
        ]
      : []),
    ...(f.noi
      ? [
          {
            label: "Net operating income",
            value: `${formatCurrency(f.noi, f.currency ?? "USD")} p.a.`,
            price: true,
          },
        ]
      : []),
    ...(f.price
      ? [
          {
            label: "Gross annual rent",
            value: f.grossAnnualRent
              ? `${formatCurrency(f.grossAnnualRent, f.currency ?? "USD")} p.a.`
              : "Not disclosed",
            price: true,
          },
        ]
      : []),
    ...(f.tenancy ? [{ label: "Tenancy", value: f.tenancy }] : []),
    ...(f.occupancy != null
      ? [{ label: "Occupancy", value: `${f.occupancy}%` }]
      : []),
    ...(f.buildingHeight
      ? [{ label: "Building height", value: `${f.buildingHeight} stories` }]
      : []),
    ...(f.far != null ? [{ label: "Floor area ratio", value: String(f.far) }] : []),
    ...(f.lotSizeAc ? [{ label: "Lot size", value: `${f.lotSizeAc} acres` }] : []),
    ...(f.buildingSf
      ? [
          {
            label: "Building area",
            value: `${new Intl.NumberFormat("en-GB").format(f.buildingSf)} sq ft`,
          },
        ]
      : []),
  ].filter((row) => row.value && row.value !== "—");

  return (
    <section aria-label="Key facts">
      <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-6">
        Key facts
      </h2>
      <dl className="grid grid-cols-2 gap-px bg-hairline border border-hairline">
        {rows.map((row) => (
          <div key={row.label} className="bg-white p-4 md:p-5">
            <dt className="text-[0.55rem] tracking-[0.25em] uppercase text-gold mb-2 font-body">
              {row.label}
            </dt>
            <dd
              className={`font-body text-[0.9rem] text-green ${
                row.price ? "price" : ""
              }`}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}