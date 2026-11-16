import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/buyer/session";
import { getSellingSubmissionById } from "@/lib/supabase/selling";
import { readPrivateFile } from "@/lib/private-store";
import { insertBuyerAuditLog } from "@/lib/supabase/records";

export const runtime = "nodejs";

/**
 * Sanitizes a filename for use in Content-Disposition header.
 * Removes non-ASCII characters and quotes.
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^\x20-\x7E]/g, "_") // Replace non-printable ASCII with underscore
    .replace(/"/g, "") // Remove double quotes
    .replace(/\\/g, "_"); // Replace backslashes
}

/**
 * GET /api/admin/selling/[id]/files/[kind]/[index]
 * Serves a private selling submission file (image or document) for admin viewing.
 * Requires admin authentication. Audit logs every access.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; kind: string; index: string }> }
) {
  const { id, kind, index } = await params;

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const submission = await getSellingSubmissionById(id);
    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const kindType = kind as "images" | "documents";
    const idx = parseInt(index, 10);

    if (kindType !== "images" && kindType !== "documents") {
      return NextResponse.json({ error: "Invalid file kind" }, { status: 400 });
    }

    if (!Number.isFinite(idx) || idx < 0) {
      return NextResponse.json({ error: "Invalid file index" }, { status: 400 });
    }

    const files = kindType === "images" ? submission.images : submission.documents;
    const file = files[idx];

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Audit log the file access
    await insertBuyerAuditLog({
      buyerId: null,
      propertySlug: null,
      bidId: null,
      action: "selling_file_viewed",
      details: `Admin viewed ${kindType} file "${file.fileName}" for submission ${submission.reference}`,
    });

    // Get the file from private store
    const fileBuffer = await readPrivateFile(file.storedPath);
    if (!fileBuffer) {
      return NextResponse.json({ error: "File not found in store" }, { status: 404 });
    }

    // Determine content type
    const contentType = file.mimeType || "application/octet-stream";

    // Return file with appropriate headers
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${sanitizeFilename(file.fileName)}"`,
        "Content-Length": String(file.fileSize),
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("[admin/selling/[id]/files] GET error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve file" },
      { status: 500 }
    );
  }
}