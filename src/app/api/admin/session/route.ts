import { NextRequest, NextResponse } from "next/server";
import {
  adminPasscode,
  clearAdminSession,
  setAdminSession,
} from "@/lib/buyer/session";

export const runtime = "nodejs";

/** Back-office session. POST with the passcode; DELETE signs out. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const passcode = String(body.passcode ?? "");
    if (passcode !== adminPasscode()) {
      return NextResponse.json({ error: "Incorrect passcode." }, { status: 401 });
    }
    await setAdminSession();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
