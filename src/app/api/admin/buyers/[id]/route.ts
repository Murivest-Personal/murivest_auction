import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/buyer/session";
import { classificationLabel, isValidClassification } from "@/lib/buyer/qualification";
import { logVaultAction } from "@/lib/vault/service";

export const runtime = "nodejs";

/** Update a buyer's classification (the 8-stage ladder). Every
    change is written to the audit log with the old → new value. */
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
    const classification = String(body.classification ?? "");
    const note = String(body.note ?? "").trim().slice(0, 500) || null;

    if (!isValidClassification(classification)) {
      return NextResponse.json({ error: "Invalid classification." }, { status: 400 });
    }

    const buyer = await db.buyerRegistration.findUnique({
      where: { id },
      select: { id: true, classification: true, fullName: true },
    });
    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found." }, { status: 404 });
    }

    await db.buyerRegistration.update({
      where: { id },
      data: { classification, classificationNote: note },
    });

    await logVaultAction({
      buyerId: id,
      action: "classification_changed",
      details: `${buyer.fullName}: ${classificationLabel(buyer.classification)} → ${classificationLabel(classification)}${note ? ` — ${note}` : ""}`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/buyers] PATCH failed:", err);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
}
