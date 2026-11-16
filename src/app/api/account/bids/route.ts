import { NextRequest, NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
import { createBuyerBid, getBuyerById } from "@/lib/supabase/records";
import { getBuyerSessionId } from "@/lib/buyer/session";
import { getPropertyBySlug } from "@/lib/content";
import { logAuditAction } from "@/lib/audit";
import { sendNewBidNotification } from "@/lib/buyer/notifications";
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
    const buyer = await getBuyerById(buyerId);
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

    const bidCurrency =
      property.facts.currency ??
      (property.market === "kenya" ? "KES" : "GBP");

    const bid = await createBuyerBid({
      id: randomUUID(),
      reference: bidReference(),
      buyer_id: buyerId,
      property_sanity_id: property._id,
      property_slug: property.slug,
      property_title: property.title,
      property_market: property.market,
      bid_amount: amount,
      bid_currency: bidCurrency,
      consent_terms: true,
      consent_fee: true,
      terms_consent_at: new Date().toISOString(),
      fee_consent_at: new Date().toISOString(),
      terms_version: TERMS_CONSENT_VERSION,
      fee_terms_version: FEE_CONSENT_VERSION,
      status: "submitted",
      ip_hash: ip ? createHash("sha256").update(ip).digest("hex") : null,
      user_agent: req.headers.get("user-agent") ?? null,
    });

    await logAuditAction({
      buyerId,
      propertySlug: property.slug,
      bidId: bid.reference,
      action: "bid_submitted",
      details: `${buyer.fullName} — ${property.title} — ${amount}`,
      ipHash: ip ? createHash("sha256").update(ip).digest("hex") : null,
    });

    await sendNewBidNotification(
      { id: buyer.id, fullName: buyer.fullName, email: buyer.email },
      {
        reference: bid.reference,
        propertyTitle: property.title,
        propertySlug: property.slug,
        bidAmount: amount,
        bidCurrency,
      }
    ).catch((err) => {
      console.error("[account/bids] New bid notification failed:", err);
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
