/**
 * Email helper using SMTP via nodemailer.
 * All functions return a Result object with success status and error details.
 */

import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

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

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT?.trim());
  const secureRaw = process.env.SMTP_SECURE?.trim().toLowerCase();
  const secure = secureRaw ? secureRaw === "true" || secureRaw === "1" : port === 465;
  const user = process.env.SMTP_USER?.trim() || undefined;
  const pass = process.env.SMTP_PASS?.trim() || undefined;
  const from =
    process.env.SMTP_FROM?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    "Murivest <office@murivest.com>";

  return { host, port, secure, user, pass, from };
}

/**
 * Checks if email is configured (SMTP host, port, and from address present).
 */
export function emailConfigured(): boolean {
  const { host, port, from } = getSmtpConfig();
  return Boolean(host && Number.isFinite(port) && port > 0 && from);
}

function getTransporter() {
  if (!transporter) {
    const { host, port, secure, user, pass } = getSmtpConfig();
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass: pass ?? "" } : undefined,
    });
  }
  return transporter;
}

/**
 * Sends an email using the configured SMTP server.
 * Returns { ok: true, id } on success, or { ok: false, error } on failure.
 * Does NOT throw - callers should check result.ok.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const { host, port, from } = getSmtpConfig();

  if (!host || !Number.isFinite(port) || port <= 0) {
    return { ok: false, error: "SMTP_HOST and SMTP_PORT must be configured" };
  }

  try {
    const info = await getTransporter().sendMail({
      from: options.from ?? from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return { ok: true, id: info.messageId };
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

export const OFFICE_EMAIL = "office@murivest.com";

interface NotificationDetails {
  buyerName?: string;
  buyerEmail?: string;
  propertyTitle?: string;
  propertySlug?: string;
  bidAmount?: number;
  bidCurrency?: string;
  bidReference?: string;
  sellerName?: string;
  sellerEmail?: string;
  submissionReference?: string;
  clientName?: string;
  clientEmail?: string;
  inquiryReference?: string;
  message?: string;
  phone?: string;
}

function officeSubject(kind: string): string {
  const labels: Record<string, string> = {
    new_bid: "New bid submitted",
    new_investor: "New investor registered",
    new_submission: "New property submission",
    new_inquiry: "New auction inquiry",
    new_signin: "New buyer sign-in",
  };
  return `[Murivest] ${labels[kind] ?? kind}`;
}

function officeHtml(kind: string, d: NotificationDetails): string {
  const esc = (v: unknown) => escapeHtml(String(v ?? ""));
  const rows: string[] = [];
  if (d.buyerName) rows.push(`<tr><td style="padding:6px 0;font-weight:600">Buyer</td><td style="padding:6px 0">${esc(d.buyerName)}</td></tr>`);
  if (d.buyerEmail) rows.push(`<tr><td style="padding:6px 0;font-weight:600">Email</td><td style="padding:6px 0">${esc(d.buyerEmail)}</td></tr>`);
  if (d.sellerName) rows.push(`<tr><td style="padding:6px 0;font-weight:600">Seller</td><td style="padding:6px 0">${esc(d.sellerName)}</td></tr>`);
  if (d.sellerEmail) rows.push(`<tr><td style="padding:6px 0;font-weight:600">Email</td><td style="padding:6px 0">${esc(d.sellerEmail)}</td></tr>`);
  if (d.clientName) rows.push(`<tr><td style="padding:6px 0;font-weight:600">Name</td><td style="padding:6px 0">${esc(d.clientName)}</td></tr>`);
  if (d.clientEmail) rows.push(`<tr><td style="padding:6px 0;font-weight:600">Email</td><td style="padding:6px 0">${esc(d.clientEmail)}</td></tr>`);
  if (d.phone) rows.push(`<tr><td style="padding:6px 0;font-weight:600">Phone</td><td style="padding:6px 0">${esc(d.phone)}</td></tr>`);
  if (d.propertyTitle) rows.push(`<tr><td style="padding:6px 0;font-weight:600">Property</td><td style="padding:6px 0">${esc(d.propertyTitle)}</td></tr>`);
  if (d.propertySlug) rows.push(`<tr><td style="padding:6px 0;font-weight:600">Slug</td><td style="padding:6px 0">${esc(d.propertySlug)}</td></tr>`);
  if (d.bidReference) rows.push(`<tr><td style="padding:6px 0;font-weight:600">Bid reference</td><td style="padding:6px 0">${esc(d.bidReference)}</td></tr>`);
  if (d.bidAmount !== undefined && d.bidCurrency) rows.push(`<tr><td style="padding:6px 0;font-weight:600">Bid amount</td><td style="padding:6px 0">${d.bidAmount.toLocaleString()} ${esc(d.bidCurrency)}</td></tr>`);
  if (d.submissionReference) rows.push(`<tr><td style="padding:6px 0;font-weight:600">Submission reference</td><td style="padding:6px 0">${esc(d.submissionReference)}</td></tr>`);
  if (d.inquiryReference) rows.push(`<tr><td style="padding:6px 0;font-weight:600">Inquiry reference</td><td style="padding:6px 0">${esc(d.inquiryReference)}</td></tr>`);
  if (d.message) rows.push(`<tr><td style="padding:6px 0;font-weight:600">Message</td><td style="padding:6px 0">${esc(d.message)}</td></tr>`);

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;line-height:1.6;color:#1a1a2e;max-width:600px;margin:0 auto;padding:24px;">
  <div style="background:#ffffff;border:1px solid #e8e8e8;border-radius:8px;padding:32px;">
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:300;font-size:28px;color:#1a1a2e;margin:0 0 16px;">Murivest Notification</h1>
    <p style="font-size:16px;color:#4a4a6a;margin:0 0 24px;">A new ${esc(kind.replace(/_/g, " "))} has been received.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;color:#4a4a6a;">
      ${rows.join("")}
    </table>
    <p style="font-size:14px;color:#6b6b8a;margin:24px 0 0;">
      View details in the back office: <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://murivest.com"}/back-office" style="color:#2d7d46;text-decoration:none;">Back Office</a>
    </p>
    <hr style="border:none;border-top:1px solid #e8e8e8;margin:32px 0;">
    <p style="font-size:14px;color:#6b6b8a;margin:0;">Murivest &mdash; Commercial Property Auctions</p>
  </div>
  <p style="font-size:12px;color:#999;text-align:center;margin-top:24px;">murivest.com</p>
</body>
</html>
  `.trim();
}

function officeText(kind: string, d: NotificationDetails): string {
  const lines: string[] = [
    `Murivest Notification`,
    ``,
    `A new ${kind.replace(/_/g, " ")} has been received.`,
    ``,
  ];
  if (d.buyerName) lines.push(`Buyer: ${d.buyerName}`);
  if (d.buyerEmail) lines.push(`Email: ${d.buyerEmail}`);
  if (d.sellerName) lines.push(`Seller: ${d.sellerName}`);
  if (d.sellerEmail) lines.push(`Email: ${d.sellerEmail}`);
  if (d.clientName) lines.push(`Name: ${d.clientName}`);
  if (d.clientEmail) lines.push(`Email: ${d.clientEmail}`);
  if (d.phone) lines.push(`Phone: ${d.phone}`);
  if (d.propertyTitle) lines.push(`Property: ${d.propertyTitle}`);
  if (d.propertySlug) lines.push(`Slug: ${d.propertySlug}`);
  if (d.bidReference) lines.push(`Bid reference: ${d.bidReference}`);
  if (d.bidAmount !== undefined && d.bidCurrency) lines.push(`Bid amount: ${d.bidAmount.toLocaleString()} ${d.bidCurrency}`);
  if (d.submissionReference) lines.push(`Submission reference: ${d.submissionReference}`);
  if (d.inquiryReference) lines.push(`Inquiry reference: ${d.inquiryReference}`);
  if (d.message) lines.push(`Message: ${d.message}`);
  lines.push(``, `View details in the back office: ${process.env.NEXT_PUBLIC_SITE_URL ?? "https://murivest.com"}/back-office`, ``, `Murivest - Commercial Property Auctions`, `murivest.com`);
  return lines.join("\n");
}

/**
 * Sends a notification email to office@murivest.com for a platform event.
 */
export async function sendOfficeNotification(
  kind: string,
  d: NotificationDetails
): Promise<SendEmailResult> {
  return sendEmail({
    to: OFFICE_EMAIL,
    subject: officeSubject(kind),
    html: officeHtml(kind, d),
    text: officeText(kind, d),
  });
}

/**
 * Sends a bid confirmation email to the client (bidder).
 */
export async function sendBidConfirmationEmail(
  to: string,
  fullName: string,
  reference: string,
  propertyTitle: string,
  amount: number,
  currency: string
): Promise<SendEmailResult> {
  const subject = "Your Murivest Bid Confirmation";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://murivest.com";
  const accountUrl = `${siteUrl}/account`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;line-height:1.6;color:#1a1a2e;max-width:600px;margin:0 auto;padding:24px;">
  <div style="background:#ffffff;border:1px solid #e8e8e8;border-radius:8px;padding:32px;">
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:300;font-size:28px;color:#1a1a2e;margin:0 0 16px;">Bid Confirmed</h1>
    <p style="font-size:16px;color:#4a4a6a;margin:0 0 24px;">Dear ${escapeHtml(fullName)},</p>
    <p style="font-size:16px;color:#4a4a6a;margin:0 0 24px;">Your bid has been received and recorded.</p>
    <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px;color:#4a4a6a;">
      <tr><td style="padding:8px 0;font-weight:600;color:#1a1a2e;">Bid reference</td><td style="padding:8px 0">${escapeHtml(reference)}</td></tr>
      <tr><td style="padding:8px 0;font-weight:600;color:#1a1a2e;">Property</td><td style="padding:8px 0">${escapeHtml(propertyTitle)}</td></tr>
      <tr><td style="padding:8px 0;font-weight:600;color:#1a1a2e;">Amount</td><td style="padding:8px 0">${amount.toLocaleString()} ${escapeHtml(currency)}</td></tr>
    </table>
    <p style="font-size:14px;color:#6b6b8a;margin:24px 0 0;">
      <a href="${accountUrl}" style="color:#2d7d46;text-decoration:none;">View your bids in your account</a>
    </p>
    <hr style="border:none;border-top:1px solid #e8e8e8;margin:32px 0;">
    <p style="font-size:14px;color:#6b6b8a;margin:0;">
      Questions? Contact us at <a href="mailto:office@murivest.com" style="color:#2d7d46;text-decoration:none;">office@murivest.com</a>.
    </p>
  </div>
  <p style="font-size:12px;color:#999;text-align:center;margin-top:24px;">murivest.com</p>
</body>
</html>
  `.trim();

  const text = `
Bid Confirmed

Dear ${fullName},

Your bid has been received and recorded.

Bid reference: ${reference}
Property: ${propertyTitle}
Amount: ${amount.toLocaleString()} ${currency}

View your bids: ${accountUrl}

Questions? Contact us at office@murivest.com.

Murivest - Commercial Property Auctions
murivest.com
  `.trim();

  return sendEmail({ to, subject, html, text });
}

/**
 * Sends a selling submission confirmation email to the client (seller).
 */
export async function sendSellingSubmissionConfirmation(
  to: string,
  sellerName: string,
  reference: string
): Promise<SendEmailResult> {
  const subject = "Your Murivest Property Submission Confirmation";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;line-height:1.6;color:#1a1a2e;max-width:600px;margin:0 auto;padding:24px;">
  <div style="background:#ffffff;border:1px solid #e8e8e8;border-radius:8px;padding:32px;">
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:300;font-size:28px;color:#1a1a2e;margin:0 0 16px;">Property Submission Received</h1>
    <p style="font-size:16px;color:#4a4a6a;margin:0 0 24px;">Dear ${escapeHtml(sellerName)},</p>
    <p style="font-size:16px;color:#4a4a6a;margin:0 0 24px;">Your property submission has been received. Our team will review it and be in touch.</p>
    <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px;color:#4a4a6a;">
      <tr><td style="padding:8px 0;font-weight:600;color:#1a1a2e;">Submission reference</td><td style="padding:8px 0">${escapeHtml(reference)}</td></tr>
    </table>
    <p style="font-size:14px;color:#6b6b8a;margin:24px 0 0;">
      Questions? Contact us at <a href="mailto:office@murivest.com" style="color:#2d7d46;text-decoration:none;">office@murivest.com</a>.
    </p>
    <hr style="border:none;border-top:1px solid #e8e8e8;margin:32px 0;">
    <p style="font-size:14px;color:#6b6b8a;margin:0;">Murivest &mdash; Commercial Property Auctions</p>
  </div>
  <p style="font-size:12px;color:#999;text-align:center;margin-top:24px;">murivest.com</p>
</body>
</html>
  `.trim();

  const text = `
Property Submission Received

Dear ${sellerName},

Your property submission has been received. Our team will review it and be in touch.

Submission reference: ${reference}

Questions? Contact us at office@murivest.com.

Murivest - Commercial Property Auctions
murivest.com
  `.trim();

  return sendEmail({ to, subject, html, text });
}

/**
 * Sends an inquiry confirmation email to the client.
 */
export async function sendInquiryConfirmation(
  to: string,
  fullName: string,
  reference: string
): Promise<SendEmailResult> {
  const subject = "Your Murivest Inquiry Confirmation";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;line-height:1.6;color:#1a1a2e;max-width:600px;margin:0 auto;padding:24px;">
  <div style="background:#ffffff;border:1px solid #e8e8e8;border-radius:8px;padding:32px;">
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:300;font-size:28px;color:#1a1a2e;margin:0 0 16px;">Inquiry Received</h1>
    <p style="font-size:16px;color:#4a4a6a;margin:0 0 24px;">Dear ${escapeHtml(fullName)},</p>
    <p style="font-size:16px;color:#4a4a6a;margin:0 0 24px;">Your inquiry has been received. Our team will respond shortly.</p>
    <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px;color:#4a4a6a;">
      <tr><td style="padding:8px 0;font-weight:600;color:#1a1a2e;">Inquiry reference</td><td style="padding:8px 0">${escapeHtml(reference)}</td></tr>
    </table>
    <p style="font-size:14px;color:#6b6b8a;margin:24px 0 0;">
      Questions? Contact us at <a href="mailto:office@murivest.com" style="color:#2d7d46;text-decoration:none;">office@murivest.com</a>.
    </p>
    <hr style="border:none;border-top:1px solid #e8e8e8;margin:32px 0;">
    <p style="font-size:14px;color:#6b6b8a;margin:0;">Murivest &mdash; Commercial Property Auctions</p>
  </div>
  <p style="font-size:12px;color:#999;text-align:center;margin-top:24px;">murivest.com</p>
</body>
</html>
  `.trim();

  const text = `
Inquiry Received

Dear ${fullName},

Your inquiry has been received. Our team will respond shortly.

Inquiry reference: ${reference}

Questions? Contact us at office@murivest.com.

Murivest - Commercial Property Auctions
murivest.com
  `.trim();

  return sendEmail({ to, subject, html, text });
}

/**
 * Sends a sign-in code email to the client (buyer).
 */
export async function sendSigninCodeEmail(
  to: string,
  fullName: string,
  accessCode: string
): Promise<SendEmailResult> {
  const subject = "Your Murivest Sign-In Code";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://murivest.com";
  const signInUrl = `${siteUrl}/sign-in`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;line-height:1.6;color:#1a1a2e;max-width:600px;margin:0 auto;padding:24px;">
  <div style="background:#ffffff;border:1px solid #e8e8e8;border-radius:8px;padding:32px;">
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:300;font-size:28px;color:#1a1a2e;margin:0 0 16px;">Your Sign-In Code</h1>
    <p style="font-size:16px;color:#4a4a6a;margin:0 0 24px;">Dear ${escapeHtml(fullName)},</p>
    <p style="font-size:16px;color:#4a4a6a;margin:0 0 24px;">You recently signed in to your Murivest buyer account. Here is your access code:</p>
    <div style="background:#f8f8f8;border:1px solid #e8e8e8;border-radius:6px;padding:24px;text-align:center;margin:24px 0;">
      <p style="font-size:14px;color:#6b6b8a;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.1em;">Access Code</p>
      <code style="font-family:'SF Mono','Monaco','Inconsolata','Fira Mono',monospace;font-size:24px;font-weight:600;color:#1a1a2e;letter-spacing:0.2em;">${escapeHtml(accessCode)}</code>
    </div>
    <p style="font-size:14px;color:#6b6b8a;margin:24px 0 0;">
      <a href="${signInUrl}" style="color:#2d7d46;text-decoration:none;">Sign in to your account</a>
    </p>
    <hr style="border:none;border-top:1px solid #e8e8e8;margin:32px 0;">
    <p style="font-size:14px;color:#6b6b8a;margin:0;">
      If you did not sign in, please contact us at <a href="mailto:office@murivest.com" style="color:#2d7d46;text-decoration:none;">office@murivest.com</a>.
    </p>
  </div>
  <p style="font-size:12px;color:#999;text-align:center;margin-top:24px;">murivest.com</p>
</body>
</html>
  `.trim();

  const text = `
Your Sign-In Code

Dear ${fullName},

You recently signed in to your Murivest buyer account. Here is your access code:

Access Code: ${accessCode}

Sign in: ${signInUrl}

If you did not sign in, please contact us at office@murivest.com.

Murivest - Commercial Property Auctions
murivest.com
  `.trim();

  return sendEmail({ to, subject, html, text });
}