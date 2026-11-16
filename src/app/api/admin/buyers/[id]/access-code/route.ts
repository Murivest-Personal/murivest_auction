import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/buyer/session";
import { getBuyerAccessCodeForAdmin, resendBuyerAccessCode } from "@/lib/buyer/notifications";
import { getBuyerById } from "@/lib/supabase/records";
import { insertBuyerAuditLog } from "@/lib/supabase/records";

export const runtime = "nodejs";

/**
 * GET /api/admin/buyers/[id]/access-code
 * Returns the decrypted access code for admin display.
 * Requires admin authentication.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const buyer = await getBuyerById(id);
    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    const accessCode = await getBuyerAccessCodeForAdmin(id);
    if (!accessCode) {
      return NextResponse.json(
        { error: "Access code not available" },
        { status: 404 }
      );
    }

    // Audit log - don't log the actual code
    await insertBuyerAuditLog({
      buyerId: id,
      action: "access_code_viewed",
      details: `Admin viewed access code for ${buyer.email}`,
    });

    return NextResponse.json({ accessCode });
  } catch (err) {
    console.error("[admin/buyers/[id]/access-code] GET error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve access code" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/buyers/[id]/access-code
 * Resends the access code email to the buyer (or issues a new one if none exists).
 * Returns { ok: true, accessCode, emailSent, emailError }.
 * Requires admin authentication.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const buyer = await getBuyerById(id);
    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    const result = await resendBuyerAccessCode(id, "admin");

    return NextResponse.json({
      ok: result.ok,
      accessCode: result.accessCode,
      emailSent: result.emailSent,
      emailError: result.error,
    });
  } catch (err) {
    console.error("[admin/buyers/[id]/access-code] POST error:", err);
    return NextResponse.json(
      { error: "Failed to resend access code" },
      { status: 500 }
    );
  }
}