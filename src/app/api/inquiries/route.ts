import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getSupabaseService } from "@/lib/supabase/server";
import { sendNewInquiryNotification } from "@/lib/buyer/notifications";

export const runtime = "nodejs";

/** Buyer inquiries → auction_inquiries table.
    Production: Supabase RPC submit_auction_inquiry (service role).
    Rate limits mirror the RPC: 3 per email / 24h, 10 per IP / 24h. */

const IP_SALT = process.env.BID_IP_SALT ?? "change-me";

function hashIp(ip: string | null) {
  if (!ip) return null;
  return createHash("sha256").update(ip + IP_SALT).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.hp_field)
      return NextResponse.json({ error: "Rejected" }, { status: 400 });
    const elapsed = Date.now() - Number(body.form_started_at ?? 0);
    if (!Number.isFinite(elapsed) || elapsed < 1500) {
      return NextResponse.json({ error: "Rejected" }, { status: 400 });
    }
    if (!body.consent_privacy) {
      return NextResponse.json(
        { error: "You must accept the Privacy Policy to continue." },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      null;
    const ipHash = hashIp(ip);

    const supabase = getSupabaseService();
    const { data, error } = await supabase.rpc("submit_auction_inquiry", {
      p_property_sanity_id: body.property_sanity_id ?? null,
      p_property_slug: body.property_slug ?? null,
      p_property_title: body.property_title ?? null,
      p_full_name: body.full_name,
      p_email: body.email,
      p_phone: body.phone || null,
      p_buyer_type: body.buyer_type || null,
      p_financing_method: body.financing_method || null,
      p_message: body.message || null,
      p_ip_hash: ipHash,
      p_user_agent: req.headers.get("user-agent") ?? null,
    });

    if (error) {
      const msg = error.message ?? "";
      const map: Record<string, [number, string]> = {
        RATE_LIMIT_EMAIL: [
          429,
          "You have submitted several inquiries recently. Please contact office@murivest.com if this is in error.",
        ],
        RATE_LIMIT_IP: [
          429,
          "You have submitted several inquiries recently. Please contact office@murivest.com if this is in error.",
        ],
        INVALID_EMAIL: [400, "Please provide a valid email address."],
        INVALID_NAME: [400, "Please provide your full name."],
        INVALID_PHONE: [400, "Please provide a valid phone number."],
      };
      for (const key of Object.keys(map)) {
        if (msg.includes(key)) {
          return NextResponse.json(
            { error: map[key][1] },
            { status: map[key][0] }
          );
        }
      }
      return NextResponse.json(
        { error: "Unable to submit inquiry. Please try again." },
        { status: 500 }
      );
    }

    const inquiryId = data?.[0]?.inquiry_id;
    const reference = inquiryId?.slice(0, 8).toUpperCase();

    await sendNewInquiryNotification(
      body.email,
      body.full_name,
      reference ?? "",
      body.message || null,
      body.phone || null
    ).catch((err) => {
      console.error("[api/inquiries] New inquiry notification failed:", err);
    });

    return NextResponse.json({
      ok: true,
      inquiry_id: inquiryId,
      reference,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}