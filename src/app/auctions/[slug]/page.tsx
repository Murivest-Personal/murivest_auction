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
import { LoanRepaymentCalculator } from "@/components/calculators/LoanRepaymentCalculator";
import { ReturnCalculator } from "@/components/calculators/ReturnCalculator";
import {
  getPropertyBySlug,
  getRelatedProperties,
  getAllSlugs,
  isSampleData,
} from "@/lib/content";
import { getApprovedComments } from "@/lib/comments";
import { AUCTION_DISCLOSURE } from "@/lib/legal";
import { formatCurrency, formatDate, marketLabel } from "@/lib/format";
import type { Property } from "@/lib/types";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

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
    question: "Do I need to register to bid?",
    answer:
      "You do not need an account to register your interest through this portal — the form captures your name, email, phone and intended amount, and Murivest routes the registration to the selling party named on the listing. To bid at the auction itself you must register with the auctioneer under the auctioneer's own process.",
  },
  {
    question: "What happens after I submit my bid registration?",
    answer:
      "Your registration is received by the Murivest deal team, reviewed, and routed to the selling party named on the listing together with the auctioneer where applicable. You will receive a confirmation by email. A registration is not a binding bid.",
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

      <Container className="py-10 md:py-14">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-10">
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

        <div className="grid gap-16 lg:grid-cols-[2fr_1fr]">
          {/* ---------------- Left column ---------------- */}
          <div>
            <KeyFactsTable property={property} />

            <InvestmentMetrics property={property} />

            {/* Loan repayment widget — beneath the investment metrics block (addendum §2.4) */}
            {property.facts.price ? (
              <section className="mt-10">
                <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
                  Debt side
                </span>
                <LoanRepaymentCalculator
                  variant="widget"
                  defaultPrincipal={Math.round(property.facts.price * 0.65)}
                  defaultRate={property.market === "kenya" ? 13 : 6.5}
                  defaultYears={10}
                  currency={currency}
                />
              </section>
            ) : null}

            <UnderwritingGates property={property} />

            <section className="mt-16 border-t border-hairline pt-10">
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

            <div className="mt-16 border-t border-hairline pt-10">
              <PropertyMap
                coordinates={property.coordinates}
                title={property.title}
                address={property.location}
              />
            </div>

            <div className="mt-16 border-t border-hairline pt-10">
              {property.conditionsOfSale ? (
                <ConditionsOfSale conditions={property.conditionsOfSale} />
              ) : (
                <p className="text-[0.9rem] text-charcoal">
                  Conditions of sale for this lot are available on request from
                  the selling party.
                </p>
              )}
            </div>

            <div className="mt-16 border-t border-hairline pt-10">
              <SellingPartyBlock property={property} />
            </div>

            <div className="mt-16 border-t border-hairline pt-10">
              <VerificationBlock property={property} />
            </div>

            {/* Public comments — approved comments server-rendered */}
            <div className="mt-16 border-t border-hairline pt-10">
              <CommentForm property={property} />
              <CommentList comments={comments} />
            </div>
          </div>

          {/* ---------------- Sidebar ---------------- */}
          <div>
            <div className="lg:sticky lg:top-28">
              <AuctionSidebar property={property} />
              <div className="mt-8">
                <ReturnCalculator
                  variant="widget"
                  defaultPrice={property.facts.price ?? 260_298}
                  defaultNoi={property.facts.noi ?? 0}
                  currency={currency}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Bid registration block — centred, max 42rem */}
      {property.status !== "sold" ? (
        <section
          id="register-your-bid"
          className="scroll-mt-24 border-t border-hairline py-20 md:py-28"
        >
          <Container>
            {isSampleData() ? (
              <p className="text-center text-[0.55rem] tracking-[0.25em] uppercase text-charcoal mb-8">
                Sample listing for demonstration — live listings publish
                through Sanity
              </p>
            ) : null}
            <BidForm property={property} />
          </Container>
        </section>
      ) : (
        <section className="border-t border-hairline py-16">
          <Container>
            <div className="max-w-[42rem] mx-auto text-center">
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                This lot has been sold.
              </h2>
              <p className="text-[0.95rem] leading-[1.8] text-ink mb-8">
                The transaction has completed. Registered bidders may request to
                be notified of comparable lots as they are published.
              </p>
              <Link
                href={`/${property.market}`}
                className="inline-flex items-center justify-center px-8 py-3 text-[0.65rem] tracking-[0.22em] uppercase font-display bg-green text-cream hover:bg-gold transition-colors"
              >
                View similar lots
              </Link>
            </div>
          </Container>
        </section>
      )}

      {/* Register interest + auction alerts — buyer not ready to
          name a number can request the brief; alerts live on the
          client portal */}
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
                    <strong>2% of the final purchase price, payable after the
                    10% deposit</strong>.{" "}
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
                    opportunities — by registering at{" "}
                    <a
                      href="https://portal.murivest.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green underline underline-offset-4 hover:text-gold transition-colors"
                    >
                      portal.murivest.com
                    </a>
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

      {/* Legal disclosure — every listing page */}
      <Container className="pb-16">
        <div className="border border-hairline bg-cream p-6 text-[0.75rem] leading-[1.7] text-charcoal font-body">
          {AUCTION_DISCLOSURE}
        </div>
      </Container>
    </>
  );
}

/* ---------------------------------------------------------------- */

function KeyFactsTable({ property }: { property: Property }) {
  const f = property.facts;
  const rows: { label: string; value: string }[] = [
    { label: "Asset type", value: property.assetType },
    { label: "Tenure", value: property.tenure ?? "—" },
    { label: "Size", value: property.size ?? "—" },
    { label: "Guide price", value: property.guidePrice ?? "—" },
    ...(property.reservePrice && property.reservePrice !== "Undisclosed"
      ? [{ label: "Reserve price", value: property.reservePrice }]
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
    /* Expanded fact set (addendum §1.1) */
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
          },
        ]
      : []),
    ...(f.pricePerSf
      ? [
          {
            label: "Price per sq ft",
            value: formatCurrency(f.pricePerSf, f.currency ?? "USD"),
          },
        ]
      : []),
    ...(f.noi
      ? [
          {
            label: "Net operating income",
            value: `${formatCurrency(f.noi, f.currency ?? "USD")} p.a.`,
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
            <dd className="font-body text-[0.9rem] text-green">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
