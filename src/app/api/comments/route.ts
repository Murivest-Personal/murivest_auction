import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getSupabaseService } from "@/lib/supabase/server";

export const runtime = "nodejs";

/* Public property comments — honeypot, timing check, IP hash with
   BID_IP_SALT, service-role RPC, mapped errors, friendly messages
   only (addendum §4.4). */

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

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      null;

    const supabase = getSupabaseService();
    const { data, error } = await supabase.rpc("submit_property_comment", {
      p_property_sanity_id: body.property_sanity_id,
      p_property_slug: body.property_slug,
      p_author_name: body.author_name,
      p_author_email: body.author_email,
      p_body: body.body,
      p_ip_hash: hashIp(ip),
    });

    if (error) {
      const msg = error.message ?? "";
      const map: Record<string, [number, string]> = {
        RATE_LIMIT_EMAIL: [
          429,
          "You have submitted several comments recently. Please contact office@murivest.com if this is in error.",
        ],
        INVALID_NAME: [400, "Please provide your name (2–80 characters)."],
        INVALID_EMAIL: [400, "Please provide a valid email address."],
        INVALID_BODY: [
          400,
          "Comments must be between 10 and 2000 characters.",
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
        { error: "Unable to submit comment. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      comment_id: data?.[0]?.comment_id,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}