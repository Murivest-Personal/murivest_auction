import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/buyer/session";
import { logVaultAction } from "@/lib/vault/service";
import { readPrivateFile } from "@/lib/private-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Proof-of-funds access — back office only. The file lives in the
   private store (never public/) and every view is logged. This is
   the ONLY route that can read a buyer's proof of funds. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }
  try {
    const { id } = await params;
    const buyer = await db.buyerRegistration.findUnique({
      where: { id },
      select: { fullName: true, pofStoredPath: true, pofFileName: true, pofMimeType: true },
    });
    if (!buyer || !buyer.pofStoredPath) {
      return NextResponse.json(
        { error: "No proof of funds on file for this buyer." },
        { status: 404 }
      );
    }
    const bytes = await readPrivateFile(buyer.pofStoredPath);
    if (!bytes) {
      return NextResponse.json(
        { error: "The proof of funds file could not be loaded." },
        { status: 500 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    await logVaultAction({
      buyerId: id,
      action: "pof_viewed",
      details: `${buyer.fullName} — ${buyer.pofFileName ?? "proof of funds"}`,
      ipHash: ip ? createHash("sha256").update(ip).digest("hex") : null,
    });

    const safeName = (buyer.pofFileName ?? "proof-of-funds").replace(
      /[^\x20-\x7E]/g,
      "_"
    ).replace(/"/g, "");
    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": buyer.pofMimeType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${safeName}"`,
        "Content-Length": String(bytes.length),
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[admin/pof] Failed:", err);
    return NextResponse.json({ error: "Unable to load the file." }, { status: 500 });
  }
}
