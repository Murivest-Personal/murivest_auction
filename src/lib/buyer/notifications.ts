import {
  sendBuyerWelcomeEmail,
  sendBuyerAccessCodeReminder,
  sendOfficeNotification,
  sendBidConfirmationEmail,
  sendSellingSubmissionConfirmation,
  sendInquiryConfirmation,
  sendSigninCodeEmail,
  OFFICE_EMAIL,
} from "@/lib/email";
import { decryptAccessCode, encryptAccessCode } from "@/lib/buyer/access-code";
import { generateAccessCode, hashCode } from "@/lib/buyer/session";
import {
  getBuyerAccessCodeEncrypted,
  getBuyerById,
  updateBuyerAccessCodeSent,
  setBuyerAccessCode,
} from "@/lib/supabase/records";
import { insertBuyerAuditLog } from "@/lib/supabase/records";

interface AccessCodeResult {
  ok: boolean;
  accessCode?: string;
  emailSent: boolean;
  error?: string;
}

/**
 * Sends the welcome email with access code to a newly registered buyer.
 * This should be called after the buyer is created and their access code is encrypted/stored.
 * Returns { ok: true } on success, or { ok: false, error } on failure.
 */
export async function sendBuyerWelcomeNotification(
  buyerId: string
): Promise<{ ok: boolean; error?: string }> {
  const buyer = await getBuyerById(buyerId);
  if (!buyer) {
    return { ok: false, error: "Buyer not found" };
  }

  const encrypted = await getBuyerAccessCodeEncrypted(buyerId);
  if (!encrypted) {
    return { ok: false, error: "No encrypted access code found for buyer" };
  }

  const accessCode = decryptAccessCode(encrypted);
  if (!accessCode) {
    return { ok: false, error: "Failed to decrypt access code" };
  }

  const details = {
    buyerType: buyer.buyerType,
    countryOfResidence: buyer.countryOfResidence,
    taxJurisdiction: buyer.taxJurisdiction,
    budgetMin: buyer.budgetMin ?? 0,
    budgetMax: buyer.budgetMax ?? 0,
    budgetCurrency: buyer.budgetCurrency,
    preferredCountry: buyer.preferredCountry,
    assetClasses: buyer.assetClasses,
    fundingPreference: buyer.fundingPreference,
    acquisitionTimeline: buyer.acquisitionTimeline,
  };

  const result = await sendBuyerWelcomeEmail(buyer.email, buyer.fullName, accessCode, details);

  if (result.ok) {
    await updateBuyerAccessCodeSent(buyerId);
    await insertBuyerAuditLog({
      buyerId,
      action: "access_code_email_sent",
      details: `Welcome email sent to ${buyer.email} (Message ID: ${result.id})`,
    });

    // Notify office of new investor registration
    await sendOfficeNotification("new_investor", {
      buyerName: buyer.fullName,
      buyerEmail: buyer.email,
      phone: buyer.phone,
      propertyTitle: undefined,
    }).catch((err) => {
      console.error("[notifications] Office new_investor notification failed:", err);
    });

    return { ok: true };
  }

  // Log failure but don't expose internal error details
  await insertBuyerAuditLog({
    buyerId,
    action: "access_code_email_failed",
    details: `Welcome email failed: ${result.error}`,
  });

  return { ok: false, error: "Failed to send welcome email" };
}

/**
 * Resends the access code email to an existing buyer (admin action).
 * If no encrypted code exists, generates a new one, encrypts, hashes, and persists it.
 * Returns { ok, accessCode, emailSent, error }.
 */
export async function resendBuyerAccessCode(
  buyerId: string,
  adminId: string | null = null
): Promise<AccessCodeResult> {
  const buyer = await getBuyerById(buyerId);
  if (!buyer) {
    return { ok: false, emailSent: false, error: "Buyer not found" };
  }

  const encrypted = await getBuyerAccessCodeEncrypted(buyerId);
  let accessCode: string;
  let isNewCode = false;

  if (!encrypted) {
    // Generate new code
    accessCode = generateAccessCode();
    isNewCode = true;
  } else {
    // Decrypt existing code
    const decrypted = decryptAccessCode(encrypted);
    if (!decrypted) {
      // Fallback: generate new if decryption fails
      accessCode = generateAccessCode();
      isNewCode = true;
    } else {
      accessCode = decrypted;
    }
  }

  // Persist new code if generated
  if (isNewCode) {
    const newEncrypted = encryptAccessCode(accessCode);
    const newHash = hashCode(accessCode);
    const now = new Date().toISOString();
    await setBuyerAccessCode(buyerId, {
      hash: newHash,
      encrypted: newEncrypted,
      generatedAt: now,
      lastSentAt: null,
    });
    await insertBuyerAuditLog({
      buyerId,
      action: "access_code_issued",
      details: `New access code issued by admin ${adminId ?? "unknown"}`,
    });
  }

  // Send email
  const result = await sendBuyerAccessCodeReminder(buyer.email, buyer.fullName, accessCode);

  if (result.ok) {
    await updateBuyerAccessCodeSent(buyerId);
    await insertBuyerAuditLog({
      buyerId,
      action: isNewCode ? "access_code_issued" : "access_code_resent",
      details: `Access code ${isNewCode ? "issued" : "resent"} by admin ${adminId ?? "unknown"} (Message ID: ${result.id})`,
    });
    return { ok: true, accessCode, emailSent: true };
  }

  await insertBuyerAuditLog({
    buyerId,
    action: "access_code_email_failed",
    details: `Access code email failed: ${result.error}`,
  });

  return { ok: false, accessCode, emailSent: false, error: result.error };
}

/**
 * Gets the decrypted access code for admin display (admin-only, server-side).
 * Returns the plaintext access code or null if not found/decryption fails.
 */
export async function getBuyerAccessCodeForAdmin(
  buyerId: string
): Promise<string | null> {
  const encrypted = await getBuyerAccessCodeEncrypted(buyerId);
  if (!encrypted) return null;

  return decryptAccessCode(encrypted);
}

/**
 * Notifies the office of a new bid and sends a confirmation email to the client (bidder).
 */
export async function sendNewBidNotification(
  buyer: { id: string; fullName: string; email: string },
  bid: {
    reference: string;
    propertyTitle: string;
    propertySlug: string;
    bidAmount: number;
    bidCurrency: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  // Notify office
  await sendOfficeNotification("new_bid", {
    buyerName: buyer.fullName,
    buyerEmail: buyer.email,
    propertyTitle: bid.propertyTitle,
    propertySlug: bid.propertySlug,
    bidReference: bid.reference,
    bidAmount: bid.bidAmount,
    bidCurrency: bid.bidCurrency,
  }).catch((err) => {
    console.error("[notifications] Office new_bid notification failed:", err);
  });

  // Send confirmation to client
  const result = await sendBidConfirmationEmail(
    buyer.email,
    buyer.fullName,
    bid.reference,
    bid.propertyTitle,
    bid.bidAmount,
    bid.bidCurrency
  );

  if (!result.ok) {
    await insertBuyerAuditLog({
      buyerId: buyer.id,
      action: "bid_confirmation_email_failed",
      details: `Bid confirmation email failed: ${result.error}`,
    });
    return { ok: false, error: "Failed to send bid confirmation email" };
  }

  await insertBuyerAuditLog({
    buyerId: buyer.id,
    action: "bid_confirmation_email_sent",
    details: `Bid confirmation email sent to ${buyer.email} (Message ID: ${result.id})`,
  });

  return { ok: true };
}

/**
 * Notifies the office of a new property submission and sends a confirmation email to the client (seller).
 */
export async function sendNewSellingSubmissionNotification(
  sellerEmail: string,
  sellerName: string,
  reference: string
): Promise<{ ok: boolean; error?: string }> {
  // Notify office
  await sendOfficeNotification("new_submission", {
    sellerName,
    sellerEmail,
    submissionReference: reference,
  }).catch((err) => {
    console.error("[notifications] Office new_submission notification failed:", err);
  });

  // Send confirmation to client
  const result = await sendSellingSubmissionConfirmation(sellerEmail, sellerName, reference);

  return result.ok
    ? { ok: true }
    : { ok: false, error: result.error };
}

/**
 * Notifies the office of a new inquiry and sends a confirmation email to the client.
 */
export async function sendNewInquiryNotification(
  clientEmail: string,
  clientName: string,
  reference: string,
  message?: string,
  phone?: string
): Promise<{ ok: boolean; error?: string }> {
  // Notify office
  await sendOfficeNotification("new_inquiry", {
    clientName,
    clientEmail,
    inquiryReference: reference,
    message,
    phone,
  }).catch((err) => {
    console.error("[notifications] Office new_inquiry notification failed:", err);
  });

  // Send confirmation to client
  const result = await sendInquiryConfirmation(clientEmail, clientName, reference);

  return result.ok
    ? { ok: true }
    : { ok: false, error: result.error };
}

/**
 * Notifies the office of a new buyer sign-in and emails the client their access code.
 */
export async function sendNewSigninNotification(
  buyerId: string
): Promise<{ ok: boolean; error?: string }> {
  const buyer = await getBuyerById(buyerId);
  if (!buyer) {
    return { ok: false, error: "Buyer not found" };
  }

  // Notify office
  await sendOfficeNotification("new_signin", {
    buyerName: buyer.fullName,
    buyerEmail: buyer.email,
  }).catch((err) => {
    console.error("[notifications] Office new_signin notification failed:", err);
  });

  // Send access code to client
  const encrypted = await getBuyerAccessCodeEncrypted(buyerId);
  if (!encrypted) {
    return { ok: false, error: "No encrypted access code found for buyer" };
  }

  const accessCode = decryptAccessCode(encrypted);
  if (!accessCode) {
    return { ok: false, error: "Failed to decrypt access code" };
  }

  const result = await sendSigninCodeEmail(buyer.email, buyer.fullName, accessCode);

  if (result.ok) {
    await updateBuyerAccessCodeSent(buyerId);
    await insertBuyerAuditLog({
      buyerId,
      action: "access_code_email_sent",
      details: `Sign-in code email sent to ${buyer.email} (Message ID: ${result.id})`,
    });
    return { ok: true };
  }

  await insertBuyerAuditLog({
    buyerId,
    action: "access_code_email_failed",
    details: `Sign-in code email failed: ${result.error}`,
  });

  return { ok: false, error: "Failed to send sign-in code email" };
}