"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface GrantRow {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  classification: string;
  classificationLabel: string;
  grantedAt: string;
  revokedAt: string | null;
  revokedReason: string | null;
  ndaAcceptedAt: string | null;
}

interface BuyerOption {
  id: string;
  fullName: string;
  classification: string;
  classificationLabel: string;
  qualified: boolean;
}

/** Grant / revoke per-property data room access. Revocation takes
    effect immediately — the access check fails closed. */
export function GrantPanel({
  propertySlug,
  buyers,
  grants,
}: {
  propertySlug: string;
  buyers: BuyerOption[];
  grants: GrantRow[];
}) {
  const router = useRouter();
  const [buyerId, setBuyerId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function grant() {
    if (!buyerId) {
      setError("Select a buyer.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/data-rooms/grants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyer_id: buyerId, property_slug: propertySlug }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Grant failed.");
        return;
      }
      setBuyerId("");
      router.refresh();
    } catch {
      setError("Grant failed.");
    } finally {
      setBusy(false);
    }
  }

  async function revoke(grantId: string) {
    const reason = window.prompt(
      "Reason for revocation (shown to the buyer, optional):"
    );
    if (reason === null) return; // cancelled
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/data-rooms/grants", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grant_id: grantId, reason }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Revoke failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("Revoke failed.");
    } finally {
      setBusy(false);
    }
  }

  const active = grants.filter((g) => !g.revokedAt);
  const revoked = grants.filter((g) => g.revokedAt);

  return (
    <div className="border border-hairline bg-white p-6">
      <p className="font-display text-[0.6rem] tracking-[0.28em] uppercase text-gold mb-6">
        Authorised buyers — per property
      </p>

      <div className="flex flex-wrap items-end gap-3 mb-8">
        <label className="block flex-1 min-w-[240px]">
          <span className="block text-[0.55rem] tracking-[0.25em] uppercase text-charcoal mb-2 font-display">
            Buyer
          </span>
          <select
            value={buyerId}
            onChange={(e) => setBuyerId(e.target.value)}
            className="w-full bg-cream border border-hairline px-3 py-2.5 text-[0.85rem] text-green cursor-pointer"
          >
            <option value="">Select a buyer…</option>
            {buyers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.fullName} — {b.classificationLabel}
                {b.qualified ? "" : " (not yet qualified)"}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={grant}
          disabled={busy}
          className="px-6 py-2.5 text-[0.6rem] tracking-[0.22em] uppercase font-display bg-green text-cream hover:bg-gold transition-colors disabled:opacity-40"
        >
          {busy ? "Working" : "Grant access"}
        </button>
      </div>

      {active.length === 0 ? (
        <p className="text-[0.85rem] text-charcoal">
          No active authorisations for this property.
        </p>
      ) : (
        <ul className="divide-y divide-hairline border border-hairline">
          {active.map((g) => (
            <li key={g.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-[0.9rem] text-green">
                  {g.buyerName}{" "}
                  <span className="text-charcoal text-[0.75rem]">({g.buyerEmail})</span>
                </p>
                <p className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-charcoal mt-1">
                  {g.classificationLabel} · granted{" "}
                  {new Date(g.grantedAt).toLocaleDateString("en-GB")} ·{" "}
                  {g.ndaAcceptedAt
                    ? `NDA accepted ${new Date(g.ndaAcceptedAt).toLocaleDateString("en-GB")}`
                    : "NDA pending"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => revoke(g.id)}
                disabled={busy}
                className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-charcoal border border-hairline px-4 py-2 hover:text-green hover:border-green transition-colors disabled:opacity-40"
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
      )}

      {revoked.length > 0 ? (
        <div className="mt-6">
          <p className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-charcoal mb-2">
            Withdrawn
          </p>
          <ul className="text-[0.8rem] text-charcoal space-y-1">
            {revoked.map((g) => (
              <li key={g.id}>
                {g.buyerName} — revoked{" "}
                {g.revokedAt ? new Date(g.revokedAt).toLocaleDateString("en-GB") : ""}
                {g.revokedReason ? ` (${g.revokedReason})` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-4 text-[0.8rem]" style={{ color: "var(--mv-status-error)" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
