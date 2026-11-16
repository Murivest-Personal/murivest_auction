"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Back-office passcode gate. Sets the admin session cookie. */
export function AdminGate() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Sign-in failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md" aria-label="Back office sign-in">
      <div className="border border-hairline bg-white p-8">
        <h1 className="font-serif text-2xl font-light text-green mb-3">
          Murivest back office
        </h1>
        <p className="text-[0.85rem] leading-[1.8] text-ink mb-8">
          Buyer qualification, account bids and audit administration.
          Access is passcode-controlled and every action is audit-logged.
        </p>
        <label className="block mb-6">
          <span className="block text-[0.6rem] tracking-[0.28em] uppercase text-charcoal mb-3 font-display">
            Passcode
          </span>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            required
            autoFocus
            className="w-full bg-transparent border-0 border-b border-sand focus:border-green outline-none py-3 text-base text-green"
          />
        </label>
        {error ? (
          <p role="alert" className="mb-4 text-[0.85rem]" style={{ color: "var(--mv-status-error)" }}>
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="btn btn-primary w-full disabled:opacity-100"
        >
          {busy ? "Checking" : "Enter"}
        </button>
      </div>
    </form>
  );
}

/** Signs the admin session out. */
export function AdminSignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await fetch("/api/admin/session", { method: "DELETE" });
          router.refresh();
        } finally {
          setBusy(false);
        }
      }}
      className="btn btn-quiet disabled:opacity-100"
    >
      {busy ? "Signing out" : "Sign out"}
    </button>
  );
}
