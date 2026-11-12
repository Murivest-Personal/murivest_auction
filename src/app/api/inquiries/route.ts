import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/** Buyer inquiries → auction_inquiries table.
    Production: Supabase RPC submit_auction_inquiry (service role).
    Demo: local Prisma mirror. Rate limits mirror the RPC:
    3 per email / 24h, 10 per IP / 24h. */

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

    const supabase = getClient();
    if (supabase) {
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

      return NextResponse.json({
        ok: true,
        inquiry_id: data?.[0]?.inquiry_id,
        reference: data?.[0]?.inquiry_id?.slice(0, 8).toUpperCase(),
      });
    }

    // Local demo store
    const email = String(body.email ?? "").trim().toLowerCase();
    if (rateLimited(email, ipHash)) {
      return NextResponse.json(
        {
          error:
            "You have submitted several inquiries recently. Please contact office@murivest.com if this is in error.",
        },
        { status: 429 }
      );
    }

    const inquiry = await db.auctionInquiry.create({
      data: {
        propertySanityId: body.property_sanity_id ?? null,
        propertySlug: body.property_slug ?? null,
        propertyTitle: body.property_title ?? null,
        fullName: String(body.full_name ?? "").trim(),
        email,
        phone: body.phone ? String(body.phone).trim() : null,
        buyerType: body.buyer_type ?? null,
        financingMethod: body.financing_method ?? null,
        message: body.message ? String(body.message).slice(0, 2000) : null,
        consentPrivacy: Boolean(body.consent_privacy),
        consentAt: new Date(),
        ipHash,
        userAgent: req.headers.get("user-agent") ?? null,
      },
    });

    recent.push({ email, ip: ipHash, at: Date.now() });

    return NextResponse.json({
      ok: true,
      inquiry_id: inquiry.id,
      reference: inquiry.id.slice(0, 8).toUpperCase(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
