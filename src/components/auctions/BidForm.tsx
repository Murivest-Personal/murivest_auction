"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AUCTION_DISCLOSURE,
  BID_SUBLINE,
  FEE_CONSENT_TEXT,
  TERMS_CONSENT_TEXT,
} from "@/lib/legal";
import type { Property } from "@/lib/types";

type Status = "idle" | "submitting" | "success" | "error";
type Session = { signedIn: boolean; name?: string } | null;

/** Account bid submission — bids are exclusive to registered
    accounts and are submitted from the property page. Signed-out
    visitors see the sign-in / register path (with a redirect back
    to this lot); signed-in buyers only enter the amount and the
    two consents — their details come from the account, so
    submission is one screen. Sold and under-offer lots never
    render a submission path (and the API rejects them again
    server-side). */
export function BidForm({ property }: { property: Property }) {
  const [session, setSession] = useState<Session>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [form, setForm] = useState({
    bid_amount: "",
    consent_terms: false,
    consent_fee: false,
  });

  const currency =
    property.facts.currency ?? (property.market === "kenya" ? "KES" : "GBP");

  const bidClosed =
    property.status === "under-offer" || property.status === "sold";

  const signInHref = `/sign-in?next=${encodeURIComponent(
    `/auctions/${property.slug}#submit-a-bid`
  )}`;
  const registerHref = `/register`;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/account/session")
      .then((r) => r.json())
      .then((data: { signedIn: boolean; name?: string }) => {
        if (!cancelled) setSession(data);
      })
      .catch(() => {
        if (!cancelled) setSession({ signedIn: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (bidClosed) return;
    const amount = Number(form.bid_amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 99_999_999_999) {
      setError("Please provide a bid amount greater than zero.");
      setStatus("error");
      return;
    }
    if (!form.consent_terms) {
      setError("You must accept the Terms and Privacy Policy.");
      setStatus("error");
      return;
    }
    if (!form.consent_fee) {
      setError("You must accept the 2% buyer brokerage fee to submit your bid.");
      setStatus("error");
      return;
    }
    setError("");
    setStatus("submitting");
    try {
      const res = await fetch("/api/account/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_slug: property.slug,
          bid_amount: amount,
          consent_terms: form.consent_terms,
          consent_fee: form.consent_fee,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Unable to submit bid. Please try again.");
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

  /* ---------- Success ---------- */
  if (status === "success") {
    return (
      <div
        role="status"
        className="border border-hairline bg-white p-8 md:p-10 max-w-[42rem] mx-auto text-center"
      >
        <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
          Bid received
        </span>
        <p className="font-serif text-2xl font-light text-green mb-4">
          Thank you, {session?.name ?? "your bid is in"}.
        </p>
        <p className="text-[0.95rem] leading-[1.8] text-ink mb-4">
          Your bid has been recorded against your account and will be reviewed
          by the Murivest deal team, then routed to the authorised sale channel.
          Your acceptance of the buyer brokerage terms has been recorded with a
          timestamp. You will receive confirmation by email.
        </p>
        {reference ? (
          <p className="text-[0.6rem] tracking-[0.25em] uppercase text-charcoal font-display mb-6">
            Reference {reference}
          </p>
        ) : null}
        <Link
          href="/account#bids"
          className="btn btn-secondary"
        >
          View your bids
        </Link>
      </div>
    );
  }

  /* ---------- Closed lots ---------- */
  if (bidClosed) {
    return (
      <div className="border border-hairline bg-white p-8 md:p-10 max-w-[42rem] mx-auto text-center">
        <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-3">
          {property.status === "sold"
            ? "This lot has been sold."
            : "This lot is under offer."}
        </h2>
        <p className="text-[0.9rem] leading-[1.8] text-ink mb-6">
          {property.status === "sold"
            ? "The transaction has completed and bidding is closed."
            : "Bidding is paused while the current offer is being processed. Registered accounts can be notified should the transaction not proceed."}
        </p>
        <Link
          href={`/${property.market}`}
          className="btn btn-primary"
        >
          View similar lots
        </Link>
      </div>
    );
  }

  /* ---------- Signed out: the account gate ---------- */
  if (session && !session.signedIn) {
    return (
      <div className="border border-hairline bg-white p-8 md:p-10 max-w-[42rem] mx-auto text-center">
        <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-3">
          Submit a bid
        </h2>
        <p className="text-[0.9rem] leading-[1.8] text-ink mb-8">
          Bidding is exclusive to registered accounts. Sign in with your access
          code — or create your account, it takes four steps — and return here
          to submit your bid on this lot.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={signInHref}
            className="w-full sm:w-auto btn btn-primary"
          >
            Sign in to bid
          </Link>
          <Link
            href={registerHref}
            className="w-full sm:w-auto btn btn-secondary"
          >
            Create your account
          </Link>
        </div>
        <p className="text-[0.75rem] leading-[1.7] text-charcoal mt-6">
          {BID_SUBLINE}
        </p>
      </div>
    );
  }

  /* ---------- Signed in: the submission form ---------- */
  return (
    <form
      onSubmit={onSubmit}
      className="max-w-[42rem] mx-auto"
      noValidate
      aria-label="Submit a bid"
    >
      <div className="border border-hairline bg-white p-6 md:p-10">
        <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-3">
          Submit a bid
        </h2>
        <p className="text-[0.85rem] leading-[1.8] text-ink mb-6">
          {BID_SUBLINE}
        </p>

        <p className="mb-6 text-[0.6rem] tracking-[0.25em] uppercase text-charcoal font-display">
          {session ? (
            <>
              Bidding as{" "}
              <span className="text-green">{session.name ?? "registered account"}</span>
              {" · "}
              <Link
                href="/account"
                className="text-green underline underline-offset-4 hover:text-gold transition-colors"
              >
                your account
              </Link>
            </>
          ) : (
            "Loading your account…"
          )}
        </p>

        {property.guidePrice ? (
          <p className="mb-6 text-[0.6rem] tracking-[0.25em] uppercase text-charcoal font-display">
            Guide price: <span className="text-green price">{property.guidePrice}</span>
          </p>
        ) : null}

        <label className="block max-w-[16rem]">
          <span className="block text-[0.6rem] tracking-[0.28em] uppercase text-charcoal mb-3 font-display">
            Bid amount ({currency})
          </span>
          <input
            type="number"
            value={form.bid_amount}
            onChange={(e) =>
              setForm((f) => ({ ...f, bid_amount: e.target.value }))
            }
            required
            min={1}
            step={1000}
            inputMode="numeric"
            disabled={status === "submitting" || !session?.signedIn}
            className="w-full bg-transparent border-0 border-b border-sand focus:border-green outline-none py-3 text-base text-green placeholder:text-charcoal/50 transition-colors disabled:bg-transparent disabled:text-charcoal disabled:border-sand disabled:cursor-not-allowed disabled:opacity-100"
          />
        </label>

        <p className="text-[0.75rem] leading-[1.7] text-charcoal mt-4">
          Your name, contact details and qualification file are taken from your
          account — nothing to re-enter. The Murivest team reviews each bid and
          routes it to the authorised sale channel.
        </p>

        {/* Consent 1 — Terms & Privacy */}
        <label className="flex items-start gap-4 mt-8 cursor-pointer">
          <input
            type="checkbox"
            checked={form.consent_terms}
            onChange={(e) =>
              setForm((f) => ({ ...f, consent_terms: e.target.checked }))
            }
            required
            className="mt-1 accent-[#1C2B1E] w-4 h-4"
          />
          <span className="text-[0.75rem] leading-[1.7] text-charcoal">
            {TERMS_CONSENT_TEXT}
          </span>
        </label>

        {/* Consent 2 — the 2% buyer brokerage fee. BOLD, boxed,
            gold-ruled. Stored with a timestamp and consent-text
            version. */}
        <div className="border border-green bg-cream p-5 mt-5">
          <label className="flex items-start gap-4 cursor-pointer">
            <input
              type="checkbox"
              checked={form.consent_fee}
              onChange={(e) =>
                setForm((f) => ({ ...f, consent_fee: e.target.checked }))
              }
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
          disabled={status === "submitting" || !session?.signedIn}
          className="btn btn-primary w-full mt-8 disabled:opacity-100"
        >
          {status === "submitting" ? "Submitting" : "Submit bid"}
        </button>
      </div>

      {/* Auction disclosure — verbatim, on every bid form */}
      <div className="border border-hairline bg-cream p-6 mt-6 text-[0.75rem] leading-[1.7] text-charcoal">
        {AUCTION_DISCLOSURE}
      </div>
    </form>
  );
}
