import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/buyer/session";
import { logAuditAction } from "@/lib/audit";

export const runtime = "nodejs";

const STATUSES = [
  "submitted",
  "acknowledged",
  "routed",
  "declined",
  "withdrawn",
  "superseded",
] as const;

/** Back office — update the status of an account-submitted bid.
    Every change lands in the audit log. */
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
    const status = String(body.status ?? "");
    const note = String(body.note ?? "").trim().slice(0, 500) || null;

    if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const bid = await db.buyerBid.findUnique({
      where: { id },
      select: { id: true, reference: true, status: true, propertyTitle: true },
    });
    if (!bid) {
      return NextResponse.json({ error: "Bid not found." }, { status: 404 });
    }

    await db.buyerBid.update({
      where: { id },
      data: { status, statusNote: note },
    });

    await logAuditAction({
      buyerId: null,
      propertySlug: null,
      bidId: bid.reference,
      action: "bid_status_changed",
      details: `${bid.reference} (${bid.propertyTitle}): ${bid.status} → ${status}${note ? ` — ${note}` : ""}`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/bids] PATCH failed:", err);
    return NextResponse.json(
      { error: "Update failed." },
      { status: 500 }
    );
  }
}
