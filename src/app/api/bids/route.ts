import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { FEE_CONSENT_VERSION, TERMS_CONSENT_VERSION } from "@/lib/legal";

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

/* ---------- Local fallback rate limiting (demo mode) ----------
   In Supabase mode the Postgres RPC enforces the same limits:
   3 per email / 24h, 10 per IP / 24h, 1h dedupe. */
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;
const recent: { email: string; ip: string | null; at: number }[] = [];

function rateLimited(email: string, ip: string | null): boolean {
  const now = Date.now();
  while (recent.length && now - recent[0].at > RATE_WINDOW_MS) recent.shift();
  const byEmail = recent.filter((r) => r.email === email).length;
  const byIp = ip ? recent.filter((r) => r.ip === ip).length : 0;
  return byEmail >= 3 || byIp >= 10;
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

    // Server-side consent enforcement — both consents are mandatory
    // and both are recorded in the database.
    if (!body.consent_terms) {
      return NextResponse.json(
        { error: "You must accept the Terms and Privacy Policy." },
        { status: 400 }
      );
    }
    if (!body.consent_fee) {
      return NextResponse.json(
        {
          error:
            "You must accept the 2% buyer brokerage fee to register your bid.",
        },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      null;
    const ipHash = hashIp(ip);

    /* ---------- Supabase (production) ---------- */
    const supabase = getClient();
    if (supabase) {
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
        p_consent_fee: Boolean(body.consent_fee),
        p_terms_version: TERMS_CONSENT_VERSION,
        p_fee_terms_version: FEE_CONSENT_VERSION,
        p_ip_hash: ipHash,
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
            "You must accept the Terms and the 2% buyer brokerage fee.",
          ],
          FEE_CONSENT_REQUIRED: [
            400,
            "You must accept the 2% buyer brokerage fee to register your bid.",
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

      return NextResponse.json({
        ok: true,
        bid_id: data?.[0]?.bid_id,
        reference: data?.[0]?.bid_id?.slice(0, 8).toUpperCase(),
      });
    }

    /* ---------- Local fallback (demo without Supabase) ----------
       Persists the full record — including both consent timestamps
       and consent text versions — to the local Prisma store. */
    const email = String(body.bidder_email ?? "").trim().toLowerCase();
    if (rateLimited(email, ipHash)) {
      return NextResponse.json(
        {
          error:
            "You have submitted several bids recently. Please contact office@murivest.com if this is in error.",
        },
        { status: 429 }
      );
    }

    const amount = Number(body.bid_amount);
    const bid = await db.auctionBid.create({
      data: {
        propertySanityId: String(body.property_sanity_id ?? ""),
        propertySlug: String(body.property_slug ?? ""),
        propertyTitle: String(body.property_title ?? ""),
        propertyMarket: String(body.property_market ?? "kenya"),
        bidderName: String(body.bidder_name ?? "").trim(),
        bidderEmail: email,
        bidderPhone: String(body.bidder_phone ?? "").trim(),
        bidAmount: amount,
        bidCurrency: String(body.bid_currency ?? "KES"),
        consentTerms: Boolean(body.consent_terms),
        consentFee: Boolean(body.consent_fee),
        termsConsentAt: new Date(),
        feeConsentAt: new Date(),
        depositAcknowledged: true,
        termsVersion: TERMS_CONSENT_VERSION,
        feeTermsVersion: FEE_CONSENT_VERSION,
        ipHash,
        userAgent: req.headers.get("user-agent") ?? null,
        referrer: req.headers.get("referer") ?? null,
      },
    });

    recent.push({ email, ip: ipHash, at: Date.now() });

    return NextResponse.json({
      ok: true,
      bid_id: bid.id,
      reference: bid.id.slice(0, 8).toUpperCase(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
