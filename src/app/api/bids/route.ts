import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

export const runtime = "nodejs";

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

const IP_SALT = process.env.BID_IP_SALT ?? "change-me";

function hashIp(ip: string | null) {
  if (!ip) return null;
  return createHash("sha256").update(ip + IP_SALT).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Honeypot + timing
    if (body.hp_field)
      return NextResponse.json({ error: "Rejected" }, { status: 400 });
    const elapsed = Date.now() - Number(body.form_started_at ?? 0);
    if (!Number.isFinite(elapsed) || elapsed < 1500) {
      return NextResponse.json({ error: "Rejected" }, { status: 400 });
    }

    const supabase = getClient();
    if (!supabase) {
      return NextResponse.json(
        {
          error:
            "Bid registration is temporarily unavailable. Please contact office@murivest.com.",
        },
        { status: 503 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      null;

    const { data, error } = await supabase.rpc("submit_auction_bid", {
      p_property_sanity_id: body.property_sanity_id,
      p_property_slug: body.property_slug,
      p_property_title: body.property_title,
      p_property_market: body.property_market,
      p_bidder_name: body.bidder_name,
      p_bidder_email: body.bidder_email,
      p_bidder_phone: body.bidder_phone,
      p_bid_amount: Number(body.bid_amount),
      p_bid_currency: body.bid_currency,
      p_consent_terms: Boolean(body.consent_terms),
      p_ip_hash: hashIp(ip),
      p_user_agent: req.headers.get("user-agent") ?? null,
      p_referrer: req.headers.get("referer") ?? null,
    });

    if (error) {
      const msg = error.message ?? "";
      const map: Record<string, [number, string]> = {
        RATE_LIMIT_EMAIL: [
          429,
          "You have submitted several bids recently. Please contact office@murivest.com if this is in error.",
        ],
        RATE_LIMIT_IP: [
          429,
          "You have submitted several bids recently. Please contact office@murivest.com if this is in error.",
        ],
        DUPLICATE_BID: [
          409,
          "You already submitted this exact bid for this property recently.",
        ],
        INVALID_EMAIL: [400, "Please provide a valid email address."],
        INVALID_NAME: [400, "Please provide your full name."],
        INVALID_PHONE: [400, "Please provide a valid phone number."],
        INVALID_AMOUNT: [400, "Please provide a bid amount greater than zero."],
        CONSENT_REQUIRED: [
          400,
          "You must accept the Terms and Privacy Policy.",
        ],
      };
      for (const key of Object.keys(map)) {
        if (msg.includes(key)) {
          return NextResponse.json(
            { error: map[key][1] },
            { status: map[key][0] }
          );
        }
      }
      // Never surface raw Postgres errors to the client.
      return NextResponse.json(
        { error: "Unable to submit bid. Please try again." },
        { status: 500 }
      );
    }

    // Fire-and-forget internal notification
    void notifyOffice(supabase, body, data?.[0]?.bid_id).catch(() => {});

    return NextResponse.json({
      ok: true,
      bid_id: data?.[0]?.bid_id,
      reference: data?.[0]?.bid_id?.slice(0, 8).toUpperCase(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

async function notifyOffice(
  supabase: ReturnType<typeof createClient>,
  body: Record<string, unknown>,
  bidId?: string
) {
  await supabase.functions.invoke("notify-new-bid", {
    body: { ...body, bid_id: bidId },
  });
}
