import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBuyerSessionId } from "@/lib/buyer/session";
import { canAccessVault, classificationLabel } from "@/lib/buyer/qualification";
import {
  getDocumentsForProperty,
  getGrantState,
  getNda,
  hasPendingAccessRequest,
} from "@/lib/vault/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Public + session-aware state for a property's data room. Returns
   document METADATA only (titles, categories, dates) — file access
   always goes through the authenticated document route. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const documents = await getDocumentsForProperty(slug);

    const buyerId = await getBuyerSessionId();
    if (!buyerId) {
      return NextResponse.json({
        propertySlug: slug,
        hasDataRoom: documents.length > 0,
        documents: documents.map((d) => ({
          id: d.id,
          title: d.title,
          category: d.category,
          categoryLabel: d.categoryLabel,
          versionCount: d.versions.length,
          lastUploadedAt: d.currentVersion?.uploadedAt ?? null,
          isAddendum: d.category === "addendum",
          expired:
            d.currentVersion?.isExpired ??
            (d.currentVersion === null ? false : false),
        })),
        session: null,
        ndaAccepted: false,
        ndaAcceptedAt: null,
        grant: "none",
        accessRequested: false,
      });
    }

    const buyer = await db.buyerRegistration.findUnique({
      where: { id: buyerId },
      select: { classification: true },
    });
    if (!buyer) {
      return NextResponse.json({
        propertySlug: slug,
        hasDataRoom: documents.length > 0,
        documents: [],
        session: null,
        ndaAccepted: false,
        ndaAcceptedAt: null,
        grant: "none",
        accessRequested: false,
      });
    }

    const [grant, nda, accessRequested] = await Promise.all([
      getGrantState(buyerId, slug),
      getNda(buyerId, slug),
      hasPendingAccessRequest(buyerId, slug),
    ]);

    const session = {
      classification: buyer.classification,
      classificationLabel: classificationLabel(buyer.classification),
      qualified: canAccessVault(buyer.classification),
    };

    const unlocked =
      session.qualified && grant === "granted" && nda !== null;

    return NextResponse.json({
      propertySlug: slug,
      hasDataRoom: documents.length > 0,
      documents: documents.map((d) => ({
        id: d.id,
        title: d.title,
        category: d.category,
        categoryLabel: d.categoryLabel,
        versionCount: d.versions.length,
        lastUploadedAt: d.currentVersion?.uploadedAt ?? null,
        isAddendum: d.category === "addendum",
        expired: d.currentVersion?.isExpired ?? false,
        /* Only exposed when the buyer is fully unlocked. */
        allowDownload: unlocked ? d.allowDownload : undefined,
        currentVersion: unlocked
          ? {
              id: d.currentVersion?.id ?? null,
              version: d.currentVersion?.version ?? null,
              fileName: d.currentVersion?.fileName ?? null,
              fileSize: d.currentVersion?.fileSize ?? null,
              uploadedAt: d.currentVersion?.uploadedAt ?? null,
              notes: d.currentVersion?.notes ?? null,
              expiresAt: d.currentVersion?.expiresAt ?? null,
              isExpired: d.currentVersion?.isExpired ?? false,
            }
          : null,
        versions: unlocked
          ? d.versions.map((v) => ({
              id: v.id,
              version: v.version,
              fileName: v.fileName,
              fileSize: v.fileSize,
              uploadedAt: v.uploadedAt,
              uploadedBy: v.uploadedBy,
              notes: v.notes,
              expiresAt: v.expiresAt,
              supersededAt: v.supersededAt,
              isExpired: v.isExpired,
            }))
          : [],
      })),
      session,
      ndaAccepted: nda !== null,
      ndaAcceptedAt: nda ? nda.acceptedAt.toISOString() : null,
      ndaTermsVersion: nda?.termsVersion ?? null,
      grant,
      accessRequested,
      unlocked,
    });
  } catch (err) {
    console.error("[vault/status] Failed:", err);
    return NextResponse.json(
      { error: "Unable to load the data room state." },
      { status: 500 }
    );
  }
}
