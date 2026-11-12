import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { getBuyerSessionId } from "@/lib/buyer/session";
import { canAccessVault } from "@/lib/buyer/qualification";
import { NDA_TERMS_VERSION } from "@/lib/legal";
import { getNda, logVaultAction } from "@/lib/vault/service";

export const runtime = "nodejs";

/** Record the NDA acceptance — buyer + property + timestamp +
    terms version. Idempotent per buyer/property. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const buyerId = await getBuyerSessionId();
    if (!buyerId)
      return NextResponse.json(
        { error: "Sign in to accept the confidentiality agreement." },
        { status: 401 }
      );

    const buyer = await db.buyerRegistration.findUnique({
      where: { id: buyerId },
      select: { classification: true },
    });
    if (!buyer)
      return NextResponse.json({ error: "Session expired." }, { status: 401 });
    if (!canAccessVault(buyer.classification))
      return NextResponse.json(
        {
          error:
            "Your buyer classification does not yet permit confidentiality agreement acceptance.",
        },
        { status: 403 }
      );

    const existing = await getNda(buyerId, slug);
    if (existing) {
      return NextResponse.json({
        ok: true,
        acceptedAt: existing.acceptedAt.toISOString(),
        alreadyAccepted: true,
      });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      null;

    const nda = await db.ndaAcceptance.create({
      data: {
        buyerId,
        propertySlug: slug,
        termsVersion: NDA_TERMS_VERSION,
        ipHash: ip ? createHash("sha256").update(ip).digest("hex") : null,
        userAgent: req.headers.get("user-agent") ?? null,
      },
    });

    await logVaultAction({
      buyerId,
      propertySlug: slug,
      action: "nda_accepted",
      details: `Terms version ${NDA_TERMS_VERSION}`,
      ipHash: nda.ipHash,
    });

    return NextResponse.json({
      ok: true,
      acceptedAt: nda.acceptedAt.toISOString(),
      alreadyAccepted: false,
    });
  } catch (err) {
    console.error("[vault/nda] Failed:", err);
    return NextResponse.json(
      { error: "Unable to record the acceptance. Please try again." },
      { status: 500 }
    );
  }
}
