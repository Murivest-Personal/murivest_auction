import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/buyer/session";
import { VAULT_CATEGORIES } from "@/lib/vault/service";
import {
  isAllowedVaultMime,
  privateFileKeyForVaultDocument,
  savePrivateFile,
  sha256Hex,
} from "@/lib/private-store";

export const runtime = "nodejs";

const MAX_PDF_BYTES = 25 * 1024 * 1024; // 25 MB

/** Create a data room document for a property and upload version 1. */
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }
  try {
    const form = await req.formData();
    const propertySlug = String(form.get("property_slug") ?? "").trim();
    const title = String(form.get("title") ?? "").trim();
    const category = String(form.get("category") ?? "").trim();
    const allowDownload = form.get("allow_download") === "true";
    const notes = String(form.get("notes") ?? "").trim().slice(0, 500) || null;
    const expiresAtRaw = String(form.get("expires_at") ?? "").trim();
    const uploadedBy = "back-office";
    const file = form.get("file");

    if (!/^[a-z0-9-]{1,120}$/.test(propertySlug))
      return NextResponse.json(
        { error: "Property slug must match the Sanity lot slug (lowercase, hyphens)." },
        { status: 400 }
      );
    if (title.length < 2 || title.length > 160)
      return NextResponse.json({ error: "Provide a document title." }, { status: 400 });
    if (!VAULT_CATEGORIES.some((c) => c.value === category))
      return NextResponse.json({ error: "Select a document category." }, { status: 400 });
    if (!(file instanceof File) || file.size === 0)
      return NextResponse.json({ error: "Attach the version 1 PDF." }, { status: 400 });
    if (file.size > MAX_PDF_BYTES)
      return NextResponse.json({ error: "PDF exceeds the 25 MB limit." }, { status: 400 });
    if (!isAllowedVaultMime(file.type))
      return NextResponse.json({ error: "Data room documents must be PDFs." }, { status: 400 });

    const bytes = Buffer.from(await file.arrayBuffer());
    const documentId = crypto.randomUUID();
    const key = privateFileKeyForVaultDocument(propertySlug, documentId, 1, file.name);
    await savePrivateFile(bytes, key);

    const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;
    if (expiresAt && Number.isNaN(expiresAt.getTime()))
      return NextResponse.json({ error: "Invalid expiry date." }, { status: 400 });

    await db.vaultDocument.create({
      data: {
        id: documentId,
        propertySlug,
        title,
        category,
        allowDownload,
        notes,
      },
    });
    await db.vaultDocumentVersion.create({
      data: {
        documentId,
        version: 1,
        fileName: file.name,
        storedPath: key,
        fileSize: bytes.length,
        mimeType: "application/pdf",
        sha256: sha256Hex(bytes),
        uploadedBy,
        notes,
        expiresAt,
      },
    });

    return NextResponse.json({ ok: true, documentId });
  } catch (err) {
    console.error("[admin/data-rooms/documents] POST failed:", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
