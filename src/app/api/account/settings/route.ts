import { NextRequest, NextResponse } from "next/server";
import { updateBuyerSettings } from "@/lib/supabase/records";
import { getBuyerSessionId } from "@/lib/buyer/session";
import { logAuditAction } from "@/lib/audit";

export const runtime = "nodejs";

/** Notification settings on the account profile — new-lot and
    off-market alerts, bid status updates. PATCH only; everything
    else on the file is changed through the Murivest team. */
export async function PATCH(req: NextRequest) {
  const buyerId = await getBuyerSessionId();
  if (!buyerId) {
    return NextResponse.json(
      { error: "Sign in to your account first." },
      { status: 401 }
    );
  }
  try {
    const body = await req.json();
    const data: Record<string, boolean> = {};
    for (const key of ["notifyNewLots", "notifyOffMarket", "notifyBidUpdates"]) {
      if (typeof body[key] === "boolean") data[key] = body[key];
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Nothing to update." },
        { status: 400 }
      );
    }
    const buyer = await updateBuyerSettings(buyerId, data);
    await logAuditAction({
      buyerId,
      action: "account_setting_changed",
      details: Object.entries(data)
        .map(([k, v]) => `${k}=${v}`)
        .join(", "),
    });
    return NextResponse.json({ ok: true, settings: buyer });
  } catch (err) {
    console.error("[account/settings] PATCH failed:", err);
    return NextResponse.json(
      { error: "Unable to save your settings." },
      { status: 500 }
    );
  }
}
