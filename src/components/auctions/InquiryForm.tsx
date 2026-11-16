"use client";

import { useState } from "react";
import Link from "next/link";

type Status = "idle" | "submitting" | "success" | "error";

/** Buyer inquiry / register-your-interest form. Posts to
    /api/inquiries, which persists to auction_inquiries (Supabase
    RPC in production, local Prisma store in demo mode). No
    account, no portal — a public guest form. */
export function InquiryForm({
  property,
  compact = false,
}: {
  property?: {
    _id: string;
    slug: string;
    title: string;
  };
  compact?: boolean;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [startedAt] = useState(() => Date.now());
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    buyer_type: "Individual",
    financing_method: "Undecided",
    message: "",
    consent_privacy: false,
    hp_field: "",
  });

  const set =
    (key: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) =>
      setForm((f) => ({
        ...f,
        [key]:
          e.target instanceof HTMLInputElement && e.target.type === "checkbox"
            ? e.target.checked
            : e.target.value,
      }));

  function validate(): string | null {
    if (form.full_name.trim().length < 2 || form.full_name.trim().length > 120)
      return "Please provide your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return "Please provide a valid email address.";
    if (form.phone && !/^[+0-9\-() ]{7,20}$/.test(form.phone.trim()))
      return "Please provide a valid phone number.";
    if (!form.consent_privacy)
      return "You must accept the Privacy Policy to continue.";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setStatus("error");
      return;
    }
    setError("");
    setStatus("submitting");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_sanity_id: property?._id ?? null,
          property_slug: property?.slug ?? null,
          property_title: property?.title ?? null,
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          buyer_type: form.buyer_type,
          financing_method: form.financing_method,
          message: form.message,
          consent_privacy: form.consent_privacy,
          hp_field: form.hp_field,
          form_started_at: startedAt,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Unable to submit inquiry. Please try again.");
        setStatus("error");
        return;
      }
      setReference(data.reference ?? "");
      setStatus("success");
    } catch {
      setError("Unable to submit inquiry. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="border border-hairline bg-white p-8 text-center"
      >
        <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
          Inquiry received
        </span>
        <p className="font-serif text-2xl font-light text-green mb-4">
          Thank you.
        </p>
        <p className="text-[0.95rem] leading-[1.8] text-ink mb-4">
          Your inquiry has been received. A member of the Murivest team will
          respond with the property brief and next steps.
        </p>
        {reference ? (
          <p className="text-[0.6rem] tracking-[0.25em] uppercase text-charcoal font-display">
            Reference {reference}
          </p>
        ) : null}
      </div>
    );
  }

  const fieldLabel =
    "block text-[0.6rem] tracking-[0.28em] uppercase text-charcoal mb-3 font-display";
  const inputCls =
    "w-full bg-transparent border-0 border-b border-sand focus:border-green outline-none py-3 text-base text-green placeholder:text-charcoal/50 transition-colors";

  return (
    <form onSubmit={onSubmit} noValidate>
      <div
        className={
          compact
            ? "border border-hairline bg-white p-6"
            : "border border-hairline bg-white p-6 md:p-10"
        }
      >
        <h2
          className={`font-serif font-light text-green mb-3 ${
            compact ? "text-xl" : "text-2xl md:text-3xl"
          }`}
        >
          {property ? "Register your interest" : "Make an inquiry"}
        </h2>
        <p className="text-[0.85rem] leading-[1.8] text-ink mb-8">
          {property
            ? "Request the property brief, arrange a viewing, or ask a question about this lot. Murivest represents buyers and will respond with the available documentation."
            : "Buyer inquiries, viewing requests, and acquisition consultations. Murivest represents buyers under separate engagement."}
        </p>

        <div className="grid gap-8 sm:grid-cols-2">
          <label className="block">
            <span className={fieldLabel}>Full name</span>
            <input
              type="text"
              value={form.full_name}
              onChange={set("full_name")}
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={fieldLabel}>Email address</span>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              required
              autoComplete="email"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={fieldLabel}>Phone (optional)</span>
            <input
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              autoComplete="tel"
              placeholder="+254 …"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={fieldLabel}>Buyer type</span>
            <select
              value={form.buyer_type}
              onChange={set("buyer_type")}
              className={inputCls}
            >
              <option>Individual</option>
              <option>Company</option>
              <option>Family office</option>
              <option>Institutional</option>
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className={fieldLabel}>Financing method</span>
            <select
              value={form.financing_method}
              onChange={set("financing_method")}
              className={inputCls}
            >
              <option>Cash</option>
              <option>Financing</option>
              <option>Undecided</option>
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className={fieldLabel}>Message (optional)</span>
            <textarea
              value={form.message}
              onChange={set("message")}
              rows={3}
              maxLength={2000}
              placeholder="Intended budget, timeline, questions about this lot…"
              className={`${inputCls} resize-none`}
            />
          </label>
        </div>

        {/* Honeypot */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <label>
            Leave this field empty
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.hp_field}
              onChange={set("hp_field")}
            />
          </label>
        </div>

        <label className="flex items-start gap-4 mt-8 cursor-pointer">
          <input
            type="checkbox"
            checked={form.consent_privacy}
            onChange={set("consent_privacy")}
            required
            className="mt-1 accent-[#1C2B1E] w-4 h-4"
          />
          <span className="text-[0.75rem] leading-[1.7] text-charcoal">
            I consent to the{" "}
            <Link
              href="/privacy"
              className="text-green underline underline-offset-4 hover:text-gold"
            >
              Privacy Policy
            </Link>{" "}
            and to being contacted about this and related auction opportunities.
          </span>
        </label>

        {status === "error" && error ? (
          <p
            role="alert"
            className="mt-6 text-[0.85rem] leading-[1.7]"
            style={{ color: "var(--mv-status-error)" }}
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn btn-primary w-full mt-8 disabled:opacity-100"
        >
          {status === "submitting" ? "Submitting" : "Submit inquiry"}
        </button>
      </div>
    </form>
  );
}
