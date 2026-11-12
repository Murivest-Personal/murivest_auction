import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/buyer/session";
import { VAULT_CATEGORIES, logVaultAction, notifyGrantees } from "@/lib/vault/service";
import {
  isAllowedVaultMime,
  privateFileKeyForVaultDocument,
  savePrivateFile,
  sha256Hex,
} from "@/lib/private-store";

export const runtime = "nodejs";

const MAX_PDF_BYTES = 25 * 1024 * 1024;

/** Upload a new version of a document. The previous version is
    superseded (kept in history) and every buyer with active access
    is notified — addenda especially, since addenda form part of
    the contract. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }
  try {
    const { id } = await params;
    const form = await req.formData();
    const notes = String(form.get("notes") ?? "").trim().slice(0, 500) || null;
    const expiresAtRaw = String(form.get("expires_at") ?? "").trim();
    const file = form.get("file");

    const document = await db.vaultDocument.findUnique({ where: { id } });
    if (!document)
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    if (!(file instanceof File) || file.size === 0)
      return NextResponse.json({ error: "Attach the new PDF version." }, { status: 400 });
    if (file.size > MAX_PDF_BYTES)
      return NextResponse.json({ error: "PDF exceeds the 25 MB limit." }, { status: 400 });
    if (!isAllowedVaultMime(file.type))
      return NextResponse.json({ error: "Data room documents must be PDFs." }, { status: 400 });

    const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;
    if (expiresAt && Number.isNaN(expiresAt.getTime()))
      return NextResponse.json({ error: "Invalid expiry date." }, { status: 400 });

    const latest = await db.vaultDocumentVersion.findFirst({
      where: { documentId: id },
      orderBy: { version: "desc" },
    });
    const nextVersion = (latest?.version ?? 0) + 1;

    const bytes = Buffer.from(await file.arrayBuffer());
    const key = privateFileKeyForVaultDocument(
      document.propertySlug,
      id,
      nextVersion,
      file.name
    );
    await savePrivateFile(bytes, key);

    await db.$transaction([
      db.vaultDocumentVersion.updateMany({
        where: { documentId: id, supersededAt: null },
        data: { supersededAt: new Date() },
      }),
      db.vaultDocumentVersion.create({
        data: {
          documentId: id,
          version: nextVersion,
          fileName: file.name,
          storedPath: key,
          fileSize: bytes.length,
          mimeType: "application/pdf",
          sha256: sha256Hex(bytes),
          uploadedBy: "back-office",
          notes,
          expiresAt,
        },
      }),
      db.vaultDocument.update({
        where: { id },
        data: { updatedAt: new Date() },
      }),
    ]);

    await logVaultAction({
      propertySlug: document.propertySlug,
      documentId: id,
      action: "version_published",
      details: `${document.title} — v${nextVersion} published${notes ? ` (${notes})` : ""}`,
    });
    await notifyGrantees(
      document.propertySlug,
      document,
      { version: nextVersion, notes }
    );

    return NextResponse.json({ ok: true, version: nextVersion });
  } catch (err) {
    console.error("[admin/data-rooms/documents/[id]] POST failed:", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}

/** Update document metadata — notably the download permission. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const document = await db.vaultDocument.findUnique({ where: { id } });
    if (!document)
      return NextResponse.json({ error: "Document not found." }, { status: 404 });

    const data: {
      allowDownload?: boolean;
      title?: string;
      category?: string;
      notes?: string | null;
    } = {};
    if (typeof body.allow_download === "boolean") data.allowDownload = body.allow_download;
    if (typeof body.title === "string" && body.title.trim().length >= 2)
      data.title = body.title.trim().slice(0, 160);
    if (
      typeof body.category === "string" &&
      VAULT_CATEGORIES.some((c) => c.value === body.category)
    )
      data.category = body.category;
    if (typeof body.notes === "string")
      data.notes = body.notes.trim().slice(0, 500) || null;

    if (Object.keys(data).length === 0)
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });

    await db.vaultDocument.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });

    if (data.allowDownload !== undefined)
      await logVaultAction({
        propertySlug: document.propertySlug,
        documentId: id,
        action: "document_created",
        details: `${document.title} — download permission set to ${data.allowDownload ? "allowed" : "view-only"}`,
      });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/data-rooms/documents/[id]] PATCH failed:", err);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
}
