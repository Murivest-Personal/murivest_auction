import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBuyerSessionId } from "@/lib/buyer/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lightweight session probe for client components (header link,
    lot-page actions, bid form). Returns signed-in state and the
    display name — never any qualification or funding data. */
export async function GET() {
  const buyerId = await getBuyerSessionId();
  if (!buyerId) {
    return NextResponse.json({ signedIn: false });
  }
  const buyer = await db.buyerRegistration.findUnique({
    where: { id: buyerId },
    select: { fullName: true },
  });
  if (!buyer) {
    return NextResponse.json({ signedIn: false });
  }
  return NextResponse.json({
    signedIn: true,
    name: buyer.fullName,
  });
}
