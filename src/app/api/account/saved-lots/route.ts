import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBuyerSessionId } from "@/lib/buyer/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Saved / liked lots — stored against the signed-in account.
   GET  ?slug=<propertySlug> → the caller's save/like state for
       that lot (used by lot pages, which stay ISR-cacheable).
   POST { property_slug, kind: "save" | "like" } → toggle.
   Guests get { saved: false, liked: false } and 401 on POST — the
   client shows the sign-in link instead. */

const KINDS = ["save", "like"] as const;
type Kind = (typeof KINDS)[number];

function parseKind(value: unknown): Kind | null {
  return KINDS.includes(value as Kind) ? (value as Kind) : null;
}

export async function GET(req: NextRequest) {
  const buyerId = await getBuyerSessionId();
  const slug = req.nextUrl.searchParams.get("slug")?.trim() ?? "";
  if (!buyerId || !slug) {
    return NextResponse.json({ saved: false, liked: false });
  }
  const rows = await db.savedLot.findMany({
    where: { buyerId, propertySlug: slug },
    select: { kind: true },
  });
  return NextResponse.json({
    saved: rows.some((r) => r.kind === "save"),
    liked: rows.some((r) => r.kind === "like"),
  });
}

export async function POST(req: NextRequest) {
  const buyerId = await getBuyerSessionId();
  if (!buyerId) {
    return NextResponse.json(
      { error: "Sign in to your account to save lots." },
      { status: 401 }
    );
  }
  try {
    const body = await req.json();
    const propertySlug = String(body.property_slug ?? "").trim();
    const kind = parseKind(body.kind);
    if (!propertySlug || !kind) {
      return NextResponse.json(
        { error: "Invalid request." },
        { status: 400 }
      );
    }
    const existing = await db.savedLot.findUnique({
      where: {
        buyerId_propertySlug_kind: { buyerId, propertySlug, kind },
      },
      select: { id: true },
    });
    if (existing) {
      await db.savedLot.delete({ where: { id: existing.id } });
      return NextResponse.json({ ok: true, active: false, kind });
    }
    await db.savedLot.create({
      data: { buyerId, propertySlug, kind },
    });
    return NextResponse.json({ ok: true, active: true, kind });
  } catch (err) {
    console.error("[account/saved-lots] POST failed:", err);
    return NextResponse.json(
      { error: "Unable to update your saved lots." },
      { status: 500 }
    );
  }
}
