"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUSES = [
  { value: "submitted", label: "Submitted" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "routed", label: "Routed to selling party" },
  { value: "superseded", label: "Superseded" },
  { value: "declined", label: "Declined" },
  { value: "withdrawn", label: "Withdrawn" },
] as const;

/** Back office — status select + note for an account-submitted
    bid. PATCHes the bid record; every change lands in the audit
    log. */
export function BidStatusControls({
  bidId,
  current,
  note,
}: {
  bidId: string;
  current: string;
  note: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  const [noteValue, setNoteValue] = useState(note ?? "");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/bids/${bidId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value, note: noteValue }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Update failed.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Update failed.");
    } finally {
      setBusy(false);
    }
  }

  const dirty = value !== current || noteValue !== (note ?? "");

  return (
    <div className="flex flex-col gap-2 min-w-[220px]">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Bid status"
        className="w-full bg-cream border border-hairline px-3 py-2 text-[0.8rem] text-green cursor-pointer"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={noteValue}
        onChange={(e) => setNoteValue(e.target.value)}
        placeholder="Internal note (optional)"
        aria-label="Bid status note"
        className="w-full bg-transparent border-b border-sand focus:border-green outline-none py-1.5 text-[0.75rem] text-green"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={busy || !dirty}
          className="font-display text-[0.55rem] tracking-[0.22em] uppercase text-green border border-green px-4 py-1.5 hover:bg-green hover:text-cream transition-colors disabled:opacity-40"
        >
          {busy ? "Saving" : "Apply"}
        </button>
        {saved ? (
          <span className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-green">
            Saved
          </span>
        ) : null}
        {error ? (
          <span
            className="text-[0.7rem]"
            style={{ color: "var(--mv-status-error)" }}
          >
            {error}
          </span>
        ) : null}
      </div>
    </div>
  );
}
