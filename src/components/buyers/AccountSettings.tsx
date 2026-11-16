"use client";

import { useState } from "react";

/** Notification settings on the account profile — toggles for
    new-lot alerts, off-market opportunities and bid status
    updates. PATCHes /api/account/settings; the rest of the
    registration file is changed through the Murivest team. */
export function AccountSettings({
  initial,
}: {
  initial: {
    notifyNewLots: boolean;
    notifyOffMarket: boolean;
    notifyBidUpdates: boolean;
  };
}) {
  const [settings, setSettings] = useState(initial);
  const [savedSnapshot, setSavedSnapshot] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const TOGGLES: {
    key: keyof typeof settings;
    label: string;
    description: string;
  }[] = [
    {
      key: "notifyNewLots",
      label: "New auction lots",
      description:
        "Auction dates and newly published lots in your preferred markets and asset classes.",
    },
    {
      key: "notifyOffMarket",
      label: "Off-market opportunities",
      description:
        "Discreet opportunities that never reach a public catalogue, matched to your budget and preferences.",
    },
    {
      key: "notifyBidUpdates",
      label: "Bid status updates",
      description:
        "Status changes on the bids you submit from property pages — acknowledgement, routing and outcome.",
    },
  ];

  async function save() {
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/account/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Unable to save your settings.");
        return;
      }
      if (data.settings) {
        setSettings(data.settings);
        setSavedSnapshot(data.settings);
      }
      setSaved(true);
    } catch {
      setError("Unable to save your settings.");
    } finally {
      setBusy(false);
    }
  }

  const dirty = TOGGLES.some((t) => settings[t.key] !== savedSnapshot[t.key]);

  function handleToggle(key: keyof typeof settings) {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
    setSaved(false);
    setError("");
  }

  return (
    <div className="border border-hairline bg-white">
      <ul className="divide-y divide-hairline">
        {TOGGLES.map((t) => (
          <li
            key={t.key}
            className="flex items-start justify-between gap-6 p-5"
          >
            <div>
              <p className="font-body text-[0.9rem] text-green mb-1">
                {t.label}
              </p>
              <p className="text-[0.75rem] leading-[1.7] text-charcoal">
                {t.description}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings[t.key]}
              aria-label={t.label}
              disabled={busy}
              onClick={() => handleToggle(t.key)}
              className={`flex-shrink-0 w-12 h-6 border transition-colors relative disabled:opacity-100 disabled:cursor-not-allowed ${
                settings[t.key]
                  ? "bg-green border-green"
                  : "bg-white border-sand"
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 transition-all ${
                  settings[t.key]
                    ? "left-[calc(100%-1.15rem)] bg-cream"
                    : "left-[0.15rem] bg-sand"
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-4 p-5 border-t border-hairline" aria-live="polite">
        <button
          type="button"
          onClick={save}
          disabled={busy || !dirty}
          className="btn btn-secondary disabled:opacity-100"
        >
          {busy ? "Saving" : "Save settings"}
        </button>
        {saved ? (
          <span className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-green">
            Saved
          </span>
        ) : null}
        {error ? (
          <span
            className="text-[0.75rem]"
            style={{ color: "var(--mv-status-error)" }}
          >
            {error}
          </span>
        ) : null}
      </div>
    </div>
  );
}