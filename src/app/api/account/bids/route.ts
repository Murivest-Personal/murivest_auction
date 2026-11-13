import { NextRequest, NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
import { db } from "@/lib/db";
import { getBuyerSessionId } from "@/lib/buyer/session";
import { getPropertyBySlug } from "@/lib/content";
import { logAuditAction } from "@/lib/audit";
import {
  FEE_CONSENT_TEXT,
  FEE_CONSENT_VERSION,
  TERMS_CONSENT_TEXT,
  TERMS_CONSENT_VERSION,
} from "@/lib/legal";

export const runtime = "nodejs";

/* Bid submission — exclusive to registered (signed-in) accounts.
   Bids are submitted from the property page and stored against the
   account. The guest bid route is gone: no account, no bid. */

const MAX_AMOUNT = 99_999_999_999;

/** Human-readable reference, e.g. "MV-B-8F3K2Q". */
function bidReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `MV-B-${suffix}`;
}

export async function POST(req: NextRequest) {
  const buyerId = await getBuyerSessionId();
  if (!buyerId) {
    return NextResponse.json(
      { error: "Sign in to your account to submit a bid." },
      { status: 401 }
    );
  }

  try {
    const buyer = await db.buyerRegistration.findUnique({
      where: { id: buyerId },
      select: { id: true, fullName: true },
    });
    if (!buyer) {
      return NextResponse.json(
        { error: "Sign in to your account to submit a bid." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const propertySlug = String(body.property_slug ?? "").trim();
    const amount = Number(body.bid_amount);
    const consentTerms = body.consent_terms === true;
    const consentFee = body.consent_fee === true;

    if (!propertySlug) {
      return NextResponse.json(
        { error: "Missing property." },
        { status: 400 }
      );
    }

    const property = await getPropertyBySlug(propertySlug);
    if (!property) {
      return NextResponse.json(
        { error: "This lot could not be found." },
        { status: 404 }
      );
    }

    /* Sold and under-offer lots accept no bids — enforced again
       server-side, not only in the UI. */
    if (property.status === "sold" || property.status === "under-offer") {
      return NextResponse.json(
        {
          error:
            property.status === "sold"
              ? "This lot has been sold. Bidding is closed."
              : "This lot is currently under offer. Bidding is paused.",
        },
        { status: 409 }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) {
      return NextResponse.json(
        { error: "Please provide a bid amount greater than zero." },
        { status: 400 }
      );
    }
    if (!consentTerms) {
      return NextResponse.json(
        { error: "You must accept the Terms and Privacy Policy." },
        { status: 400 }
      );
    }
    if (!consentFee) {
      return NextResponse.json(
        {
          error:
            "You must accept the 2% buyer brokerage fee to submit your bid.",
        },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      null;

    const bid = await db.buyerBid.create({
      data: {
        id: randomUUID(),
        reference: bidReference(),
        buyerId,
        propertySanityId: property._id,
        propertySlug: property.slug,
        propertyTitle: property.title,
        propertyMarket: property.market,
        bidAmount: amount,
        bidCurrency:
          property.facts.currency ??
          (property.market === "kenya" ? "KES" : "GBP"),
        consentTerms: true,
        consentFee: true,
        termsConsentAt: new Date(),
        feeConsentAt: new Date(),
        termsVersion: TERMS_CONSENT_VERSION,
        feeTermsVersion: FEE_CONSENT_VERSION,
        status: "submitted",
        ipHash: ip ? createHash("sha256").update(ip).digest("hex") : null,
        userAgent: req.headers.get("user-agent") ?? null,
      },
      select: { reference: true },
    });

    await logAuditAction({
      buyerId,
      propertySlug: property.slug,
      bidId: bid.reference,
      action: "bid_submitted",
      details: `${buyer.fullName} — ${property.title} — ${amount}`,
      ipHash: ip ? createHash("sha256").update(ip).digest("hex") : null,
    });

    return NextResponse.json({
      ok: true,
      reference: bid.reference,
      feeConsentText: FEE_CONSENT_TEXT,
      termsConsentText: TERMS_CONSENT_TEXT,
    });
  } catch (err) {
    console.error("[account/bids] POST failed:", err);
    return NextResponse.json(
      { error: "Unable to submit bid. Please try again." },
      { status: 500 }
    );
  }
}
