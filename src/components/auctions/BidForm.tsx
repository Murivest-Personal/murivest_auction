"use client";

import { useEffect, useRef, useState } from "react";
import {
  AUCTION_DISCLOSURE,
  BID_SUBLINE,
  FEE_CONSENT_TEXT,
  TERMS_CONSENT_TEXT,
} from "@/lib/legal";
import type { Property } from "@/lib/types";

type Status = "idle" | "submitting" | "success" | "error";

/** Guest bid registration — no sign-in, no account, no session
    (features spec §2). Posts to /api/bids, which calls the
    service-role RPC. Honeypot + timing check on every submission.
    The buyer must accept BOTH the Terms and the bold 2% buyer
    brokerage fee (payable after the 10% deposit) — both consents
    are recorded in the database with timestamps and text versions. */
export function BidForm({ property }: { property: Property }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  // Captured at first client render — the timing check rejects
  // submissions faster than 1500ms after this point.
  const [startedAt] = useState(() => Date.now());
  const [form, setForm] = useState({
    bidder_name: "",
    bidder_email: "",
    bidder_phone: "",
    bid_amount: "",
    consent_terms: false,
    consent_fee: false,
    hp_field: "",
  });
  const amountRef = useRef<HTMLInputElement>(null);

  const currency =
    property.facts.currency ?? (property.market === "kenya" ? "KES" : "GBP");

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) =>
    setForm((f) => ({
      ...f,
      [key]:
        e.target.type === "checkbox"
          ? e.target.checked
          : e.target.value,
    }));

  function validate(): string | null {
    if (form.bidder_name.trim().length < 2 || form.bidder_name.trim().length > 120)
      return "Please provide your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.bidder_email.trim()))
      return "Please provide a valid email address.";
    if (!/^[+0-9\-() ]{7,20}$/.test(form.bidder_phone.trim()))
      return "Please provide a valid phone number.";
    const amount = Number(form.bid_amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 99_999_999_999)
      return "Please provide a bid amount greater than zero.";
    if (!form.consent_terms)
      return "You must accept the Terms and Privacy Policy.";
    if (!form.consent_fee)
      return "You must accept the 2% buyer brokerage fee to register your bid.";
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
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_sanity_id: property._id,
          property_slug: property.slug,
          property_title: property.title,
          property_market: property.market,
          bidder_name: form.bidder_name,
          bidder_email: form.bidder_email,
          bidder_phone: form.bidder_phone,
          bid_amount: Number(form.bid_amount),
          bid_currency: currency,
          consent_terms: form.consent_terms,
          consent_fee: form.consent_fee,
          hp_field: form.hp_field,
          form_started_at: startedAt,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data.error ?? "Unable to submit bid. Please try again."
        );
        setStatus("error");
        return;
      }
      setReference(data.reference ?? "");
      setStatus("success");
    } catch {
      setError("Unable to submit bid. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="border border-hairline bg-white p-8 md:p-10 max-w-[42rem] mx-auto text-center"
      >
        <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
          Registration received
        </span>
        <p className="font-serif text-2xl font-light text-green mb-4">
          Thank you.
        </p>
        <p className="text-[0.95rem] leading-[1.8] text-ink mb-4">
          Your bid registration has been received and will be reviewed by the
          Murivest team. Your acceptance of the buyer brokerage terms has been
          recorded. You will receive confirmation by email.
        </p>
        {reference ? (
          <p className="text-[0.6rem] tracking-[0.25em] uppercase text-charcoal font-display">
            Reference {reference}
          </p>
        ) : null}
      </div>
    );
  }

  const disabled = property.status === "under-offer";

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-[42rem] mx-auto"
      noValidate
    >
      <div className="border border-hairline bg-white p-6 md:p-10">
        <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-3">
          Register your bid
        </h2>
        <p className="text-[0.85rem] leading-[1.8] text-ink mb-8">
          {BID_SUBLINE}
        </p>

        {property.guidePrice ? (
          <p className="mb-6 text-[0.6rem] tracking-[0.25em] uppercase text-charcoal font-display">
            Guide price: <span className="text-green">{property.guidePrice}</span>
          </p>
        ) : null}

        {disabled ? (
          <p
            role="alert"
            className="border border-hairline bg-cream p-4 text-[0.85rem] text-charcoal mb-6"
          >
            This lot is currently under offer. Bid registration is paused.
            Register to be notified should the transaction not proceed.
          </p>
        ) : null}

        <div className="grid gap-8 sm:grid-cols-2">
          <label className="block">
            <span className="block text-[0.6rem] tracking-[0.28em] uppercase text-charcoal mb-3 font-display">
              Full name
            </span>
            <input
              type="text"
              value={form.bidder_name}
              onChange={set("bidder_name")}
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
              className="w-full bg-transparent border-0 border-b border-sand focus:border-green outline-none py-3 text-base text-green placeholder:text-charcoal/50 transition-colors"
            />
          </label>
          <label className="block">
            <span className="block text-[0.6rem] tracking-[0.28em] uppercase text-charcoal mb-3 font-display">
              Email address
            </span>
            <input
              type="email"
              value={form.bidder_email}
              onChange={set("bidder_email")}
              required
              autoComplete="email"
              className="w-full bg-transparent border-0 border-b border-sand focus:border-green outline-none py-3 text-base text-green placeholder:text-charcoal/50 transition-colors"
            />
          </label>
          <label className="block">
            <span className="block text-[0.6rem] tracking-[0.28em] uppercase text-charcoal mb-3 font-display">
              Phone
            </span>
            <input
              type="tel"
              value={form.bidder_phone}
              onChange={set("bidder_phone")}
              required
              autoComplete="tel"
              placeholder="+254 …"
              className="w-full bg-transparent border-0 border-b border-sand focus:border-green outline-none py-3 text-base text-green placeholder:text-charcoal/50 transition-colors"
            />
          </label>
          <label className="block">
            <span className="block text-[0.6rem] tracking-[0.28em] uppercase text-charcoal mb-3 font-display">
              Bid amount ({currency})
            </span>
            <input
              ref={amountRef}
              type="number"
              value={form.bid_amount}
              onChange={set("bid_amount")}
              required
              min={1}
              step={1000}
              inputMode="numeric"
              className="w-full bg-transparent border-0 border-b border-sand focus:border-green outline-none py-3 text-base text-green placeholder:text-charcoal/50 transition-colors"
            />
          </label>
        </div>

        {/* Honeypot — invisible to humans */}
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

        {/* Consent 1 — Terms & Privacy */}
        <label className="flex items-start gap-4 mt-8 cursor-pointer">
          <input
            type="checkbox"
            checked={form.consent_terms}
            onChange={set("consent_terms")}
            required
            className="mt-1 accent-[#1C2B1E] w-4 h-4"
          />
          <span className="text-[0.75rem] leading-[1.7] text-charcoal">
            {TERMS_CONSENT_TEXT}
          </span>
        </label>

        {/* Consent 2 — the 2% buyer brokerage fee. BOLD, boxed,
            gold-ruled. The acceptance is stored in the database
            with a timestamp and consent-text version. */}
        <div className="border border-green bg-cream p-5 mt-5">
          <label className="flex items-start gap-4 cursor-pointer">
            <input
              type="checkbox"
              checked={form.consent_fee}
              onChange={set("consent_fee")}
              required
              className="mt-1 accent-[#8B6C2A] w-4 h-4"
            />
            <span>
              <span className="block font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-2">
                Buyer brokerage fee — required
              </span>
              <strong className="text-[0.85rem] leading-[1.7] text-green font-bold">
                {FEE_CONSENT_TEXT}
              </strong>
            </span>
          </label>
        </div>

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
          disabled={status === "submitting" || disabled}
          className="w-full mt-8 px-8 py-4 text-[0.65rem] tracking-[0.25em] uppercase font-display bg-green text-cream hover:bg-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === "submitting" ? "Submitting" : "Submit bid registration"}
        </button>
      </div>

      {/* Auction disclosure — verbatim, on every bid form */}
      <div className="border border-hairline bg-cream p-6 mt-6 text-[0.75rem] leading-[1.7] text-charcoal">
        {AUCTION_DISCLOSURE}
      </div>
    </form>
  );
}
