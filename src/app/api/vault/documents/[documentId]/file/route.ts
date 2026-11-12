import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { getBuyerSessionId } from "@/lib/buyer/session";
import {
  checkDocumentAccess,
  logVaultAction,
} from "@/lib/vault/service";
import { readPrivateFile } from "@/lib/private-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Secure document access. The file bytes live in the private store
   (never public/) and are streamed ONLY when the buyer:
     1. has a valid session,
     2. is classified Qualified buyer or above,
     3. holds an active per-property access grant, and
     4. has accepted the NDA for this property.
   Downloads additionally require the document's download permission.
   Every view and download — and every denial — is written to the
   buyer access log. */

function ipHashOf(req: NextRequest): string | null {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null;
  return ip ? createHash("sha256").update(ip).digest("hex") : null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;
    const mode =
      req.nextUrl.searchParams.get("mode") === "download"
        ? "download"
        : "view";

    const buyerId = await getBuyerSessionId();
    if (!buyerId) {
      return NextResponse.json(
        { error: "Sign in to access data room documents." },
        { status: 401 }
      );
    }

    const document = await db.vaultDocument.findUnique({
      where: { id: documentId },
      select: { id: true, propertySlug: true, title: true, allowDownload: true },
    });
    if (!document) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 }
      );
    }

    const access = await checkDocumentAccess(
      buyerId,
      document.propertySlug,
      documentId
    );
    if (!access.allowed) {
      await logVaultAction({
        buyerId,
        propertySlug: document.propertySlug,
        documentId,
        action: mode === "download" ? "download_denied" : "view_denied",
        details: access.reason,
        ipHash: ipHashOf(req),
      });
      return NextResponse.json({ error: access.reason }, { status: access.status });
    }

    if (mode === "download" && !document.allowDownload) {
      await logVaultAction({
        buyerId,
        propertySlug: document.propertySlug,
        documentId,
        action: "download_denied",
        details: "Download permission not granted for this document",
        ipHash: ipHashOf(req),
      });
      return NextResponse.json(
        {
          error:
            "This document is view-only. Download permission has not been granted for it.",
        },
        { status: 403 }
      );
    }

    /* Load the version's file from the private store. */
    const versionRow = await db.vaultDocumentVersion.findUnique({
      where: { id: access.version.id },
      select: { storedPath: true, fileName: true, mimeType: true },
    });
    if (!versionRow) {
      return NextResponse.json(
        { error: "Document version not found." },
        { status: 404 }
      );
    }
    const bytes = await readPrivateFile(versionRow.storedPath);
    if (!bytes) {
      console.error(
        `[vault/file] File missing from private store: ${versionRow.storedPath}`
      );
      return NextResponse.json(
        { error: "The document file could not be loaded." },
        { status: 500 }
      );
    }

    await logVaultAction({
      buyerId,
      propertySlug: document.propertySlug,
      documentId,
      versionId: access.version.id,
      action: mode === "download" ? "download" : "view",
      details: `${document.title} — v${access.version.version} (${mode})`,
      ipHash: ipHashOf(req),
    });

    const safeName = versionRow.fileName.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "");
    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": versionRow.mimeType || "application/pdf",
        "Content-Disposition": `${mode === "download" ? "attachment" : "inline"}; filename="${safeName}"`,
        "Content-Length": String(bytes.length),
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[vault/file] Failed:", err);
    return NextResponse.json(
      { error: "Unable to load the document." },
      { status: 500 }
    );
  }
}
