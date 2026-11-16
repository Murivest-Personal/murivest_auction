import { sendBuyerWelcomeEmail, sendBuyerAccessCodeReminder } from "@/lib/email";
import { decryptAccessCode, encryptAccessCode } from "@/lib/buyer/access-code";
import { generateAccessCode, hashCode } from "@/lib/buyer/session";
import {
  getBuyerAccessCodeEncrypted,
  getBuyerById,
  updateBuyerAccessCodeSent,
  setBuyerAccessCode,
} from "@/lib/supabase/records";
import { insertBuyerAuditLog } from "@/lib/supabase/records";

interface ResendResult {
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
      details: `Welcome email sent to ${buyer.email} (Resend ID: ${result.id})`,
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
): Promise<ResendResult> {
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
      details: `Access code ${isNewCode ? "issued" : "resent"} by admin ${adminId ?? "unknown"} (Resend ID: ${result.id})`,
    });
    return { ok: true, accessCode, emailSent: true };
  }

  await insertBuyerAuditLog({
    buyerId,
    action: "access_code_email_failed",
    details: `Resend email failed: ${result.error}`,
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