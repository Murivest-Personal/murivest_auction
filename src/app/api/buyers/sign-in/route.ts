import { NextRequest, NextResponse } from "next/server";
import { getBuyerCredentials } from "@/lib/supabase/records";
import { hashCode, setBuyerSession } from "@/lib/buyer/session";

export const runtime = "nodejs";

/* Simple in-memory throttle: 5 failed attempts per email per 15 min. */
const WINDOW_MS = 15 * 60 * 1000;
const attempts: { email: string; at: number }[] = [];

function tooManyAttempts(email: string): boolean {
  const now = Date.now();
  while (attempts.length && now - attempts[0].at > WINDOW_MS) attempts.shift();
  return attempts.filter((a) => a.email === email).length >= 5;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const accessCode = String(body.access_code ?? "").trim().toUpperCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || accessCode.length < 6) {
      return NextResponse.json(
        { error: "Enter your registered email address and access code." },
        { status: 400 }
      );
    }
    if (tooManyAttempts(email)) {
      return NextResponse.json(
        {
          error:
            "Too many attempts. Please wait 15 minutes or contact office@murivest.com.",
        },
        { status: 429 }
      );
    }

    const buyer = await getBuyerCredentials(email);
    if (!buyer || buyer.accessCodeHash !== hashCode(accessCode)) {
      attempts.push({ email, at: Date.now() });
      return NextResponse.json(
        { error: "Invalid email address or access code." },
        { status: 401 }
      );
    }

    await setBuyerSession(buyer.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
