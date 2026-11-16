"use client";

import { useState } from "react";

interface BuyerAccessCodeProps {
  buyerId: string;
  buyerEmail: string;
  buyerName: string;
  hasAccessCode: boolean;
}

interface AccessCodeResult {
  ok: boolean;
  accessCode?: string;
  emailSent: boolean;
  emailError?: string;
  error?: string;
}

export function BuyerAccessCode({ buyerId, buyerEmail, buyerName, hasAccessCode }: BuyerAccessCodeProps) {
  const [code, setCode] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [resending, setResending] = useState(false);
  const [copying, setCopying] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  async function revealCode() {
    setRevealing(true);
    try {
      const res = await fetch(`/api/admin/buyers/${buyerId}/access-code`, {
        method: "GET",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to reveal access code");
      }
      setCode(data.accessCode);
      setShowCode(true);
      showToast("Access code revealed", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to reveal access code", "error");
    } finally {
      setRevealing(false);
    }
  }

  async function resendCode() {
    setResending(true);
    try {
      const res = await fetch(`/api/admin/buyers/${buyerId}/access-code`, {
        method: "POST",
      });
      const data: AccessCodeResult = await res.json();
      if (!res.ok && !data.ok) {
        throw new Error(data.error ?? "Failed to resend access code");
      }
      if (data.accessCode) {
        setCode(data.accessCode);
        setShowCode(true);
      }
      const emailStatus = data.emailSent
        ? "Email sent"
        : data.emailError
          ? `Email failed: ${data.emailError}`
          : "Email not configured";
      showToast(emailStatus, data.emailSent ? "success" : "error");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to resend access code", "error");
    } finally {
      setResending(false);
    }
  }

  async function copyCode() {
    if (!code) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(code);
      showToast("Copied to clipboard", "success");
    } catch {
      showToast("Failed to copy", "error");
    } finally {
      setCopying(false);
    }
  }

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function formatCode(code: string): string {
    return code.replace(/(.{4})/g, "$1 ").trim();
  }

  return (
    <div className="border border-hairline bg-white p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="font-serif text-lg font-light text-green mb-1">
            Access code
          </h3>
          <p className="text-[0.8rem] text-charcoal">
            {buyerName} &middot; {buyerEmail}
          </p>
        </div>
      </div>

      {toast && (
        <div
          className={`mb-4 p-3 text-[0.8rem] border ${
            toast.type === "success"
              ? "border-green text-green bg-green/5"
              : "border-gold text-gold bg-gold/5"
          }`}
          role="alert"
        >
          {toast.message}
        </div>
      )}

      <div className="space-y-3">
        {/* Revealed code display */}
        {showCode && code && (
          <div className="border border-green bg-cream p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold">
                Access code
              </span>
              <button
                type="button"
                onClick={copyCode}
                disabled={copying}
                className="btn btn-quiet text-[0.75rem] disabled:opacity-100"
              >
                {copying ? "Copied!" : "Copy"}
              </button>
            </div>
            <code className="font-display text-xl tracking-[0.2em] text-green break-all select-all">
              {formatCode(code)}
            </code>
            <p className="text-[0.7rem] leading-[1.7] text-charcoal mt-2">
              This code is visible to administrators.
            </p>
          </div>
        )}

        {/* No recoverable code state */}
        {!hasAccessCode && !showCode && (
          <div className="border border-dashed border-sand bg-white p-6 text-center">
            <span className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold block mb-3">
              No recoverable access code
            </span>
            <p className="text-[0.85rem] text-charcoal mb-4">
              The buyer does not have a recoverable access code stored.
              Issue a new one to send it by email.
            </p>
            <button
              type="button"
              onClick={resendCode}
              disabled={resending}
              className="btn btn-primary disabled:opacity-100"
            >
              {resending ? "Issuing…" : "Issue & email new code"}
            </button>
          </div>
        )}

        {/* Hidden code state (has code but not revealed) */}
        {hasAccessCode && !showCode && (
          <div className="border border-dashed border-sand bg-white p-6 text-center">
            <span className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold block mb-3">
              Access code hidden
            </span>
            <p className="text-[0.85rem] text-charcoal mb-4">
              The buyer's access code is encrypted and not displayed by default.
              Click <strong>Reveal</strong> to decrypt and view it, or <strong>Resend</strong>
              to email it directly to the buyer.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                type="button"
                onClick={revealCode}
                disabled={revealing}
                className="btn btn-primary disabled:opacity-100"
              >
                {revealing ? "Revealing…" : "Reveal code"}
              </button>
              <button
                type="button"
                onClick={resendCode}
                disabled={resending}
                className="btn btn-secondary disabled:opacity-100"
              >
                {resending ? "Sending…" : "Resend by email"}
              </button>
            </div>
          </div>
        )}

        {/* After reveal, show resend option */}
        {showCode && (
          <div className="flex gap-3 justify-end pt-2 border-t border-hairline">
            <button
              type="button"
              onClick={resendCode}
              disabled={resending}
              className="btn btn-secondary disabled:opacity-100"
            >
              {resending ? "Sending…" : "Resend by email"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}