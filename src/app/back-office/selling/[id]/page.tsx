import type { Metadata } from "next";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/buyer/session";
import { getSellingSubmissionById } from "@/lib/supabase/selling";
import { Container } from "@/components/ui/Container";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Selling submission | Murivest Back Office",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SellingDetailPage({ params }: Props) {
  if (!(await isAdminAuthenticated())) {
    return (
      <Container className="py-16 md:py-24">
        <div className="max-w-md mx-auto text-center">
          <h1 className="font-serif text-2xl font-light text-green mb-4">Sign in required</h1>
          <p className="text-[0.85rem] leading-[1.8] text-charcoal mb-6">
            Please sign in to the back office to view this submission.
          </p>
          <Link href="/back-office" className="btn btn-primary">
            Back to sign in
          </Link>
        </div>
      </Container>
    );
  }

  const { id } = await params;
  const submission = await getSellingSubmissionById(id);

  if (!submission) {
    return (
      <Container className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/back-office" className="inline-flex items-center gap-2 text-green underline underline-offset-4 hover:text-gold mb-8">
            <span aria-hidden="true">&larr;</span> Back to back office
          </Link>
          <div className="border border-hairline bg-white p-8">
            <h1 className="font-serif text-2xl font-light text-green mb-4">Submission not found</h1>
            <p className="text-[0.9rem] leading-[1.8] text-charcoal mb-6">
              No selling submission exists with the ID <code className="font-display">{id}</code>.
            </p>
            <Link href="/back-office?tab=selling" className="btn btn-secondary">
              Back to selling submissions
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  const { data, images, documents, reference, status, qualificationStatus, sellerName, sellerEmail, sellerPhone, createdAt } = submission;

  // Extract typed facts for easier rendering
  const facts = data.facts as
    | Record<string, unknown>
    | undefined;
  const currency = (facts?.currency as string) || "KES";
  const pricePerSf = facts?.pricePerSf as number | undefined;
  const buildingHeight = facts?.buildingHeight as number | undefined;
  const far = facts?.far as number | undefined;
  const lotSizeAc = facts?.lotSizeAc as number | undefined;
  const buildingSf = facts?.buildingSf as number | undefined;
  const occupancy = facts?.occupancy as number | undefined;
  const summaryPoints = data.conditionsOfSale?.summaryPoints as string[] | undefined;
  const coordinates = data.coordinates as { lat: number; lng: number; zoom: number } | undefined;

  return (
    <Container className="py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        <Link href="/back-office" className="inline-flex items-center gap-2 text-green underline underline-offset-4 hover:text-gold mb-8">
          <span aria-hidden="true">&larr;</span> Back to back office
        </Link>

        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
          <div>
            <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-2">
              Selling submission
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-light text-green">{reference}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-block px-3 py-1 font-display text-[0.5rem] tracking-[0.2em] uppercase border ${
              status === "new" || status === "review"
                ? "border-gold text-gold bg-gold/5"
                : status === "approved" || status === "listed"
                  ? "border-green text-green bg-green/5"
                  : "border-sand text-charcoal"
            }`}>
              {status}
            </span>
            <span className={`inline-block px-3 py-1 font-display text-[0.5rem] tracking-[0.2em] uppercase border ${
              qualificationStatus === "eligible"
                ? "border-green text-green bg-green/5"
                : qualificationStatus === "ineligible"
                  ? "border-gold text-gold bg-gold/5"
                  : "border-sand text-charcoal"
            }`}>
              {qualificationStatus}
            </span>
          </div>
        </div>

        <dl className="space-y-10">
          {/* Property */}
          <div className="border border-hairline bg-white p-6">
            <dt className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-4">
              Property
            </dt>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Title</p>
                <p className="text-green">{data.title}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Market</p>
                <p className="text-green">{data.market}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Region</p>
                <p className="text-green">{data.region}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Location</p>
                <p className="text-green">{data.location}</p>
              </div>
              <div className="md:col-span-2">
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Asset type</p>
                <p className="text-green">{data.assetType}</p>
              </div>
              <div className="md:col-span-2">
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Tenure</p>
                <p className="text-green">{data.tenure}</p>
              </div>
              <div className="md:col-span-2">
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Size</p>
                <p className="text-green">{data.size}</p>
              </div>
              <div className="md:col-span-2">
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Selling party</p>
                <p className="text-green">{data.sellingParty}</p>
              </div>
            </div>
          </div>

          {/* Income & facts */}
          <div className="border border-hairline bg-white p-6">
            <dt className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-4">
              Income & facts
            </dt>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Guide price</p>
                <p className="text-green price">{formatCurrency(data.guidePrice, currency)}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Sale type</p>
                <p className="text-green">{String(facts?.saleType ?? "—")}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Tenure</p>
                <p className="text-green">{String(facts?.tenure ?? "—")}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Building class</p>
                <p className="text-green">{String(facts?.buildingClass ?? "—")}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Year built</p>
                <p className="text-green">{String(facts?.yearBuilt ?? "—")}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Price</p>
                <p className="text-green price">{formatCurrency(Number(facts?.price) || 0, currency)}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Currency</p>
                <p className="text-green">{String(facts?.currency ?? "—")}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">NOI</p>
                <p className="text-green price">{formatCurrency(Number(facts?.noi) || 0, currency)}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Gross annual rent</p>
                <p className="text-green price">{formatCurrency(Number(facts?.grossAnnualRent) || 0, currency)}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Tenancy</p>
                <p className="text-green">{String(facts?.tenancy ?? "—")}</p>
              </div>
              {pricePerSf != null ? (
                <div>
                  <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Price / sq ft</p>
                  <p className="text-green price">{formatCurrency(pricePerSf, currency)}</p>
                </div>
              ) : null}
              {buildingHeight != null ? (
                <div>
                  <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Building height (m)</p>
                  <p className="text-green">{buildingHeight.toLocaleString()}</p>
                </div>
              ) : null}
              {far != null ? (
                <div>
                  <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">FAR</p>
                  <p className="text-green">{far.toLocaleString()}</p>
                </div>
              ) : null}
              {lotSizeAc != null ? (
                <div>
                  <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Lot size (acres)</p>
                  <p className="text-green">{lotSizeAc.toLocaleString()}</p>
                </div>
              ) : null}
              {buildingSf != null ? (
                <div>
                  <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Building (sq ft)</p>
                  <p className="text-green">{buildingSf.toLocaleString()}</p>
                </div>
              ) : null}
              {occupancy != null ? (
                <div>
                  <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Occupancy (%)</p>
                  <p className="text-green">{occupancy.toFixed(1)}%</p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Description & highlights */}
          <div className="border border-hairline bg-white p-6">
            <dt className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-4">
              Description & highlights
            </dt>
            <div className="space-y-6">
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-2">Description</p>
                <p className="text-ink leading-[1.8] whitespace-pre-wrap">{data.description}</p>
              </div>
              {data.keyHighlights && data.keyHighlights.length > 0 ? (
                <div>
                  <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-2">Key highlights</p>
                  <ul className="list-disc list-inside space-y-1 text-ink leading-[1.8]">
                    {data.keyHighlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          {/* Conditions of sale */}
          <div className="border border-hairline bg-white p-6">
            <dt className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-4">
              Conditions of sale
            </dt>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Jurisdiction</p>
                <p className="text-green">{String(data.conditionsOfSale?.jurisdiction ?? "—")}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Deposit %</p>
                <p className="text-green">{String(data.conditionsOfSale?.depositPercent ?? "—")}%</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Deposit due</p>
                <p className="text-green">{String(data.conditionsOfSale?.depositDue ?? "—")}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Deposit payment method</p>
                <p className="text-green">{String(data.conditionsOfSale?.depositPaymentMethod ?? "—")}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Deposit payee</p>
                <p className="text-green">{String(data.conditionsOfSale?.depositPayee ?? "—")}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Balance days</p>
                <p className="text-green">{String(data.conditionsOfSale?.balanceDays ?? "—")}</p>
              </div>
              {summaryPoints && summaryPoints.length > 0 && (
                <div className="md:col-span-2">
                  <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-2">Summary points</p>
                  <ol className="list-decimal list-inside space-y-1 text-ink leading-[1.8]">
                    {summaryPoints.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="border border-hairline bg-white p-6">
            <dt className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-4">
              Location
            </dt>
            <div className="grid gap-4 md:grid-cols-3">
              {coordinates ? (
                <>
                  <div>
                    <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Latitude</p>
                    <p className="text-green">{coordinates.lat}</p>
                  </div>
                  <div>
                    <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Longitude</p>
                    <p className="text-green">{coordinates.lng}</p>
                  </div>
                  <div>
                    <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Zoom</p>
                    <p className="text-green">{coordinates.zoom}</p>
                  </div>
                </>
              ) : (
                <div className="md:col-span-3 text-charcoal">No coordinates provided</div>
              )}
            </div>
          </div>

          {/* Seller */}
          <div className="border border-hairline bg-white p-6">
            <dt className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-4">
              Seller
            </dt>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Name</p>
                <p className="text-green">{sellerName}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Email</p>
                <p className="text-green">{sellerEmail}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Phone</p>
                <p className="text-green">{sellerPhone}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Role</p>
                <p className="text-green">{data.sellerRole}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">No commission</p>
                <p className="text-green">{data.noCommission ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Flexible guide price</p>
                <p className="text-green">{data.flexibleGuidePrice ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Legal pack available</p>
                <p className="text-green">{data.legalPackAvailable}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Reserve price</p>
                <p className="text-green price">{data.reservePrice ? formatCurrency(data.reservePrice, data.facts?.currency as string || "KES") : "—"}</p>
              </div>
            </div>
          </div>

          {/* Files */}
          <div className="border border-hairline bg-white p-6">
            <dt className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-4">
              Files
            </dt>
            <div className="space-y-6">
              {/* Images */}
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-3">Images ({images.length})</p>
                {images.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {images.map((img, i) => (
                      <a
                        key={img.storedPath}
                        href={`/api/admin/selling/${id}/files/images/${i}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border border-hairline bg-cream p-3 hover:border-green transition-colors"
                      >
                        <p className="font-body text-[0.8rem] text-green truncate">{img.fileName}</p>
                        <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mt-1">
                          {formatCurrency(img.fileSize / 1024, "KB")} · {img.mimeType}
                        </p>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-charcoal">No images</p>
                )}
              </div>

              {/* Documents */}
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-3">Documents ({documents.length})</p>
                {documents.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {documents.map((doc, i) => (
                      <a
                        key={doc.storedPath}
                        href={`/api/admin/selling/${id}/files/documents/${i}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border border-hairline bg-cream p-3 hover:border-green transition-colors"
                      >
                        <p className="font-body text-[0.8rem] text-green truncate">{doc.fileName}</p>
                        <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mt-1">
                          {formatCurrency(doc.fileSize / 1024, "KB")} · {doc.mimeType}
                        </p>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-charcoal">No documents</p>
                )}
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="border border-hairline bg-white p-6">
            <dt className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-4">
              Submission details
            </dt>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Reference</p>
                <p className="text-green font-display">{reference}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">Submitted</p>
                <p className="text-green">{formatDate(createdAt.toISOString())}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">IP hash</p>
                <p className="text-green font-display text-[0.7rem] break-all">{submission.ipHash ?? "—"}</p>
              </div>
              <div>
                <p className="font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal mb-1">User agent</p>
                <p className="text-green font-display text-[0.7rem] break-all">{submission.userAgent ?? "—"}</p>
              </div>
            </div>
          </div>
        </dl>
      </div>
    </Container>
  );
}