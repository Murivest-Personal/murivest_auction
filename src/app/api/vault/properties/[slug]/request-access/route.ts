import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { getBuyerSessionId } from "@/lib/buyer/session";
import {
  getActiveGrant,
  hasPendingAccessRequest,
  logVaultAction,
} from "@/lib/vault/service";

export const runtime = "nodejs";

/** Buyer asks Murivest to authorise data room access for this
    property. Logged for the back office; Murivest grants or
    declines per property. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const buyerId = await getBuyerSessionId();
    if (!buyerId)
      return NextResponse.json(
        { error: "Sign in to request data room access." },
        { status: 401 }
      );

    const buyer = await db.buyerRegistration.findUnique({
      where: { id: buyerId },
      select: { id: true, fullName: true, classification: true },
    });
    if (!buyer)
      return NextResponse.json({ error: "Session expired." }, { status: 401 });

    const active = await getActiveGrant(buyerId, slug);
    if (active) {
      return NextResponse.json({
        ok: true,
        state: "granted",
        message: "You already have access to this data room.",
      });
    }
    const pending = await hasPendingAccessRequest(buyerId, slug);
    if (pending) {
      return NextResponse.json({
        ok: true,
        state: "already-requested",
        message: "Your access request is with the Murivest team.",
      });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      null;

    await logVaultAction({
      buyerId,
      propertySlug: slug,
      action: "access_requested",
      details: `Requested by ${buyer.fullName} (${buyer.classification})`,
      ipHash: ip ? createHash("sha256").update(ip).digest("hex") : null,
    });

    return NextResponse.json({
      ok: true,
      state: "requested",
      message:
        "Request received. The Murivest team will review and authorise your access to this data room.",
    });
  } catch (err) {
    console.error("[vault/request-access] Failed:", err);
    return NextResponse.json(
      { error: "Unable to submit the request. Please try again." },
      { status: 500 }
    );
  }
}
