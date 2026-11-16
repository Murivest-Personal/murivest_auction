/**
 * Email helper using Resend API via fetch (no SDK dependency).
 * All functions return a Result object with success status and error details.
 */

const RESEND_API_URL = "https://api.resend.com/emails";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

/**
 * Checks if email is configured (Resend API key present).
 */
export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Sends an email using Resend API.
 * Returns { ok: true, id } on success, or { ok: false, error } on failure.
 * Does NOT throw - callers should check result.ok.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    options.from ??
    process.env.RESEND_FROM_EMAIL ??
    process.env.EMAIL_FROM ??
    "Murivest <office@murivest.com>";

  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return { ok: false, error: data.message ?? `Resend API error: ${response.status}` };
    }

    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

interface BuyerRegistrationDetails {
  buyerType: string;
  countryOfResidence: string;
  taxJurisdiction: string;
  budgetMin: number;
  budgetMax: number;
  budgetCurrency: string;
  preferredCountry: string;
  assetClasses: string[];
  fundingPreference: string;
  acquisitionTimeline: string;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

function formatDetailsHtml(details: BuyerRegistrationDetails): string {
  return `
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; color: #4a4a6a;">
      <tr><td style="padding: 8px 0; font-weight: 600; color: #1a1a2e;">Buyer type</td><td style="padding: 8px 0;">${escapeHtml(details.buyerType)}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: 600; color: #1a1a2e;">Country of residence</td><td style="padding: 8px 0;">${escapeHtml(details.countryOfResidence)}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: 600; color: #1a1a2e;">Tax jurisdiction</td><td style="padding: 8px 0;">${escapeHtml(details.taxJurisdiction)}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: 600; color: #1a1a2e;">Budget range</td><td style="padding: 8px 0;">${details.budgetMin.toLocaleString()} – ${details.budgetMax.toLocaleString()} ${escapeHtml(details.budgetCurrency)}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: 600; color: #1a1a2e;">Preferred market</td><td style="padding: 8px 0;">${escapeHtml(details.preferredCountry)}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: 600; color: #1a1a2e;">Asset classes</td><td style="padding: 8px 0;">${escapeHtml(details.assetClasses.join(", "))}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: 600; color: #1a1a2e;">Funding preference</td><td style="padding: 8px 0;">${escapeHtml(details.fundingPreference)}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: 600; color: #1a1a2e;">Acquisition timeline</td><td style="padding: 8px 0;">${escapeHtml(details.acquisitionTimeline.replace(/-/g, " "))}</td></tr>
    </table>
  `.trim();
}

function formatDetailsText(details: BuyerRegistrationDetails): string {
  return `
Buyer type: ${details.buyerType}
Country of residence: ${details.countryOfResidence}
Tax jurisdiction: ${details.taxJurisdiction}
Budget range: ${details.budgetMin.toLocaleString()} – ${details.budgetMax.toLocaleString()} ${details.budgetCurrency}
Preferred market: ${details.preferredCountry}
Asset classes: ${details.assetClasses.join(", ")}
Funding preference: ${details.fundingPreference}
Acquisition timeline: ${details.acquisitionTimeline.replace(/-/g, " ")}
  `.trim();
}

/**
 * Sends the buyer welcome email with their access code.
 * Returns { ok: true, id } on success, or { ok: false, error } on failure.
 */
export async function sendBuyerWelcomeEmail(
  to: string,
  fullName: string,
  accessCode: string,
  details?: BuyerRegistrationDetails
): Promise<SendEmailResult> {
  const subject = "Your Murivest Buyer Access Code";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://murivest.com";
  const signInUrl = `${siteUrl}/sign-in`;

  const detailsHtml = details ? formatDetailsHtml(details) : "";
  const detailsText = details ? formatDetailsText(details) : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="background: #ffffff; border: 1px solid #e8e8e8; border-radius: 8px; padding: 32px;">
    <h1 style="font-family: Georgia, 'Times New Roman', serif; font-weight: 300; font-size: 28px; color: #1a1a2e; margin: 0 0 16px;">Welcome to Murivest</h1>
    
    <p style="font-size: 16px; color: #4a4a6a; margin: 0 0 24px;">Dear ${escapeHtml(fullName)},</p>
    
    <p style="font-size: 16px; color: #4a4a6a; margin: 0 0 24px;">Your buyer account is ready. You can sign in with your email address and this access code.</p>
    
    <div style="background: #f8f8f8; border: 1px solid #e8e8e8; border-radius: 6px; padding: 24px; text-align: center; margin: 24px 0;">
      <p style="font-size: 14px; color: #6b6b8a; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.1em;">Your Access Code</p>
      <code style="font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace; font-size: 24px; font-weight: 600; color: #1a1a2e; letter-spacing: 0.2em;">${escapeHtml(accessCode)}</code>
    </div>
    
    ${detailsHtml ? `<h3 style="font-size: 16px; color: #1a1a2e; margin: 24px 0 12px;">Registration Details</h3>${detailsHtml}` : ""}
    
    <p style="font-size: 14px; color: #6b6b8a; margin: 24px 0 0;">
      <a href="${signInUrl}" style="color: #2d7d46; text-decoration: none;">Sign in to your account</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #e8e8e8; margin: 32px 0;">
    
    <p style="font-size: 14px; color: #6b6b8a; margin: 0;">
      If you did not request this registration, please contact us at 
      <a href="mailto:office@murivest.com" style="color: #2d7d46; text-decoration: none;">office@murivest.com</a>.
    </p>
  </div>
  
  <p style="font-size: 12px; color: #999; text-align: center; margin-top: 24px;">
    Murivest &mdash; Commercial Property Auctions<br>
    <a href="https://murivest.com" style="color: #999;">murivest.com</a>
  </p>
</body>
</html>
  `.trim();

  const text = `
Welcome to Murivest

Dear ${fullName},

Your buyer account is ready. You can sign in with your email address and this access code.

Access Code: ${accessCode}

${detailsText}

Sign in: ${signInUrl}

If you did not request this registration, please contact us at office@murivest.com.

Murivest - Commercial Property Auctions
https://murivest.com
  `.trim();

  return sendEmail({ to, subject, html, text });
}

/**
 * Sends a reminder email with the buyer's access code (for resend).
 */
export async function sendBuyerAccessCodeReminder(
  to: string,
  fullName: string,
  accessCode: string
): Promise<SendEmailResult> {
  const subject = "Your Murivest Access Code";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://murivest.com";
  const signInUrl = `${siteUrl}/sign-in`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="background: #ffffff; border: 1px solid #e8e8e8; border-radius: 8px; padding: 32px;">
    <h1 style="font-family: Georgia, 'Times New Roman', serif; font-weight: 300; font-size: 28px; color: #1a1a2e; margin: 0 0 16px;">Your Murivest Access Code</h1>
    
    <p style="font-size: 16px; color: #4a4a6a; margin: 0 0 24px;">Dear ${escapeHtml(fullName)},</p>
    
    <p style="font-size: 16px; color: #4a4a6a; margin: 0 0 24px;">Here is your Murivest buyer access code:</p>
    
    <div style="background: #f8f8f8; border: 1px solid #e8e8e8; border-radius: 6px; padding: 24px; text-align: center; margin: 24px 0;">
      <p style="font-size: 14px; color: #6b6b8a; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.1em;">Your Access Code</p>
      <code style="font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace; font-size: 24px; font-weight: 600; color: #1a1a2e; letter-spacing: 0.2em;">${escapeHtml(accessCode)}</code>
    </div>
    
    <p style="font-size: 14px; color: #6b6b8a; margin: 24px 0 0;">
      <a href="${signInUrl}" style="color: #2d7d46; text-decoration: none;">Sign in to your account</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #e8e8e8; margin: 32px 0;">
    
    <p style="font-size: 14px; color: #6b6b8a; margin: 0;">
      If you did not request this reminder, please contact us at 
      <a href="mailto:office@murivest.com" style="color: #2d7d46; text-decoration: none;">office@murivest.com</a>.
    </p>
  </div>
  
  <p style="font-size: 12px; color: #999; text-align: center; margin-top: 24px;">
    Murivest &mdash; Commercial Property Auctions<br>
    <a href="https://murivest.com" style="color: #999;">murivest.com</a>
  </p>
</body>
</html>
  `.trim();

  const text = `
Your Murivest Access Code

Dear ${fullName},

Here is your Murivest buyer access code:

Access Code: ${accessCode}

Sign in: ${signInUrl}

If you did not request this reminder, please contact us at office@murivest.com.

Murivest - Commercial Property Auctions
https://murivest.com
  `.trim();

  return sendEmail({ to, subject, html, text });
}