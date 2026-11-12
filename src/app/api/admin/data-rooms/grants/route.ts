import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/buyer/session";
import { grantVaultAccess, revokeVaultAccess } from "@/lib/vault/service";

export const runtime = "nodejs";

/** Grant a buyer access to a property's data room (per property). */
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const buyerId = String(body.buyer_id ?? "");
    const propertySlug = String(body.property_slug ?? "");

    if (!buyerId || !/^[a-z0-9-]{1,120}$/.test(propertySlug))
      return NextResponse.json({ error: "Invalid buyer or property." }, { status: 400 });

    const buyer = await db.buyerRegistration.findUnique({
      where: { id: buyerId },
      select: { id: true, fullName: true, classification: true },
    });
    if (!buyer)
      return NextResponse.json({ error: "Buyer not found." }, { status: 404 });

    await grantVaultAccess(buyerId, propertySlug, "back-office");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/data-rooms/grants] POST failed:", err);
    return NextResponse.json({ error: "Grant failed." }, { status: 500 });
  }
}

/** Revoke a grant — access to that property's data room stops
    immediately (revoked grants fail the active check). */
export async function DELETE(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const grantId = String(body.grant_id ?? "");
    const reason = String(body.reason ?? "").trim().slice(0, 300) || null;
    if (!grantId)
      return NextResponse.json({ error: "Grant not specified." }, { status: 400 });

    const updated = await revokeVaultAccess(grantId, "back-office", reason);
    if (!updated)
      return NextResponse.json({ error: "Grant not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/data-rooms/grants] DELETE failed:", err);
    return NextResponse.json({ error: "Revoke failed." }, { status: 500 });
  }
}
