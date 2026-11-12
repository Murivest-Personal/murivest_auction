"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const inputCls =
  "w-full bg-transparent border-0 border-b border-sand focus:border-green outline-none py-3 text-base text-green placeholder:text-charcoal/50 transition-colors";
const labelCls =
  "block text-[0.6rem] tracking-[0.28em] uppercase text-charcoal mb-3 font-display";

/** Buyer portal sign-in — email + the access code issued at
    registration. Sets the httpOnly session cookie. */
export function BuyerSignInForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", access_code: "" });

  const set =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/buyers/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          access_code: form.access_code,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Sign-in failed. Please try again.");
        setStatus("error");
        return;
      }
      router.push("/buyers/portal");
      router.refresh();
    } catch {
      setError("Sign-in failed. Please try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Buyer portal sign-in" className="max-w-md">
      <div className="border border-hairline bg-white p-6 md:p-10">
        <h2 className="font-serif text-2xl font-light text-green mb-3">
          Sign in to the buyer portal
        </h2>
        <p className="text-[0.85rem] leading-[1.8] text-ink mb-8">
          Use the email address you registered with and the access code issued
          when you registered. Your portal shows your qualification status and
          the data rooms you are authorised to enter.
        </p>

        <div className="space-y-8">
          <label className="block">
            <span className={labelCls}>Email address</span>
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
            <span className={labelCls}>Access code</span>
            <input
              type="text"
              value={form.access_code}
              onChange={set("access_code")}
              required
              autoComplete="off"
              placeholder="e.g. K7QM-4XZD-9PRT"
              className={`${inputCls} font-display tracking-[0.15em] uppercase`}
            />
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
          disabled={status === "submitting"}
          className="w-full mt-8 px-8 py-4 text-[0.65rem] tracking-[0.25em] uppercase font-display bg-green text-cream hover:bg-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === "submitting" ? "Signing in" : "Sign in"}
        </button>

        <p className="text-[0.75rem] leading-[1.7] text-charcoal mt-6">
          Lost your access code? Contact{" "}
          <a
            href="mailto:office@murivest.com"
            className="text-green underline underline-offset-4 hover:text-gold transition-colors"
          >
            office@murivest.com
          </a>
          . Not registered yet?{" "}
          <Link
            href="/buyers/register"
            className="text-green underline underline-offset-4 hover:text-gold transition-colors"
          >
            Register as a buyer
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
