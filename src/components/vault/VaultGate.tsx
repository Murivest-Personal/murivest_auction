"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  NDA_CONSENT_TEXT,
  NDA_INTRO,
  NDA_TERMS,
} from "@/lib/legal";
import { formatDate, formatNumber } from "@/lib/format";

/* ============================================================
   Vault gate — the data room entry on lot pages (embedded) and
   in the buyer portal (full). Client-fetches the session-aware
   state so it can live on ISR-cached pages.

   States, in order:
     not signed in → register / sign in
     signed in, below Qualified buyer → status + portal link
     qualified, no grant → request access (logged for back office)
     grant revoked → notice
     granted, no NDA → confidentiality agreement + timestamped accept
     unlocked → documents: secure PDF viewing, version history,
                download permissions, expiry, addenda badges
   ============================================================ */

interface VersionInfo {
  id: string;
  version: number;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  notes: string | null;
  expiresAt: string | null;
  supersededAt: string | null;
  isExpired: boolean;
}

interface StatusDoc {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  versionCount: number;
  lastUploadedAt: string | null;
  isAddendum: boolean;
  expired: boolean;
  allowDownload?: boolean;
  currentVersion: Omit<VersionInfo, "uploadedBy" | "supersededAt"> | null;
  versions: VersionInfo[];
}

interface StatusResponse {
  propertySlug: string;
  hasDataRoom: boolean;
  documents: StatusDoc[];
  session: {
    classification: string;
    classificationLabel: string;
    qualified: boolean;
  } | null;
  ndaAccepted: boolean;
  ndaAcceptedAt: string | null;
  grant: "granted" | "revoked" | "none";
  accessRequested: boolean;
  unlocked: boolean;
  error?: string;
}

const btnGreen =
  "inline-flex items-center justify-center px-8 py-3 text-[0.65rem] tracking-[0.22em] uppercase font-display bg-green text-cream hover:bg-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
const btnOutline =
  "inline-flex items-center justify-center px-8 py-3 text-[0.65rem] tracking-[0.22em] uppercase font-display text-green border border-green hover:bg-green hover:text-cream transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

function fileUrl(docId: string, mode: "view" | "download") {
  return `/api/vault/documents/${docId}/file?mode=${mode}`;
}

export function VaultGate({
  propertySlug,
  variant = "embedded",
}: {
  propertySlug: string;
  variant?: "embedded" | "full";
}) {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ndaChecked, setNdaChecked] = useState(false);
  const [ndaError, setNdaError] = useState("");
  const [openHistory, setOpenHistory] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/vault/properties/${encodeURIComponent(propertySlug)}/status`,
        { cache: "no-store" }
      );
      const json = (await res.json()) as StatusResponse;
      if (!res.ok) {
        setError(json.error ?? "Unable to load the data room.");
        return;
      }
      setData(json);
    } catch {
      setError("Unable to load the data room.");
    }
  }, [propertySlug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function requestAccess() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(
        `/api/vault/properties/${encodeURIComponent(propertySlug)}/request-access`,
        { method: "POST" }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) setError(json.error ?? "Request failed.");
      await load();
    } catch {
      setError("Request failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function acceptNda() {
    if (!ndaChecked) {
      setNdaError("Tick the acceptance box to continue.");
      return;
    }
    setBusy(true);
    setNdaError("");
    try {
      const res = await fetch(
        `/api/vault/properties/${encodeURIComponent(propertySlug)}/nda`,
        { method: "POST" }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNdaError(json.error ?? "Unable to record the acceptance.");
        return;
      }
      await load();
    } catch {
      setNdaError("Unable to record the acceptance.");
    } finally {
      setBusy(false);
    }
  }

  if (error && !data) {
    return (
      <p role="alert" className="text-[0.85rem] text-charcoal">
        {error}
      </p>
    );
  }
  if (!data) {
    return (
      <div className="border border-hairline bg-white p-6 animate-pulse" aria-hidden="true">
        <div className="h-3 w-40 bg-sand/60 mb-4" />
        <div className="h-2 w-full bg-sand/40 mb-2" />
        <div className="h-2 w-2/3 bg-sand/40" />
      </div>
    );
  }

  const full = variant === "full";

  /* ---------------- Not signed in ---------------- */
  if (!data.session) {
    return (
      <div className={full ? "border border-hairline bg-white p-6 md:p-8" : ""}>
        <p className="text-[0.9rem] leading-[1.8] text-ink mb-6">
          Full documentation for this lot — title documents, tenancy
          particulars, searches and the legal pack — is released to qualified
          buyers under a confidentiality agreement, per property. Register as a
          buyer or sign in to request access.
        </p>
        {data.documents.length > 0 ? (
          <ul className="border border-hairline divide-y divide-hairline mb-6">
            {data.documents.map((d) => (
              <li key={d.id} className="flex items-baseline justify-between gap-4 p-4">
                <span className="text-[0.85rem] text-green">
                  {d.title}
                  {d.isAddendum ? (
                    <span className="ml-2 font-display text-[0.5rem] tracking-[0.2em] uppercase text-gold">
                      Addendum
                    </span>
                  ) : null}
                </span>
                <span className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-charcoal whitespace-nowrap">
                  Under NDA
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex flex-wrap gap-4">
          <Link href="/buyers/register" className={btnGreen}>
            Register as a buyer
          </Link>
          <Link href="/buyers/sign-in" className={btnOutline}>
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------- Signed in, below qualification ---------------- */
  if (!data.session.qualified) {
    return (
      <div className="border border-hairline bg-white p-6">
        <p className="text-[0.9rem] leading-[1.8] text-ink mb-4">
          Documentation is released to qualified buyers only. Your current
          status is{" "}
          <strong className="text-green">
            {data.session.classificationLabel}
          </strong>
          .
        </p>
        <p className="text-[0.85rem] leading-[1.8] text-charcoal mb-6">
          Once your registration, KYC and funding verification are complete and
          you are classified as a Qualified buyer, you can be authorised into
          this data room under a confidentiality agreement.
        </p>
        <Link href="/buyers/portal" className={btnOutline}>
          View your status
        </Link>
      </div>
    );
  }

  /* ---------------- Access revoked ---------------- */
  if (data.grant === "revoked") {
    return (
      <div className="border border-hairline bg-white p-6">
        <p className="text-[0.9rem] leading-[1.8] text-ink mb-6">
          Your authorisation for this data room has been withdrawn. Contact the
          Murivest team at{" "}
          <a
            href="mailto:office@murivest.com"
            className="text-green underline underline-offset-4"
          >
            office@murivest.com
          </a>{" "}
          if you believe this is in error.
        </p>
      </div>
    );
  }

  /* ---------------- Qualified, awaiting grant ---------------- */
  if (data.grant === "none") {
    return (
      <div className="border border-hairline bg-white p-6">
        <p className="text-[0.9rem] leading-[1.8] text-ink mb-6">
          You are a {data.session.classificationLabel}. Authorisation to this
          data room is granted per property by the Murivest team, after your
          confidentiality undertaking.
        </p>
        {data.accessRequested ? (
          <p className="border border-green bg-cream p-4 text-[0.85rem] text-green">
            Your access request is with the Murivest team. You will be
            authorised once approved.
          </p>
        ) : (
          <button type="button" onClick={requestAccess} disabled={busy} className={btnGreen}>
            {busy ? "Sending" : "Request data room access"}
          </button>
        )}
        {error ? (
          <p role="alert" className="mt-4 text-[0.85rem]" style={{ color: "var(--mv-status-error)" }}>
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  /* ---------------- Granted, NDA pending ---------------- */
  if (!data.ndaAccepted) {
    return (
      <div className="border border-hairline bg-white p-6 md:p-8">
        <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
          Confidentiality agreement — required before access
        </span>
        <p className="text-[0.9rem] leading-[1.8] text-ink mb-6">{NDA_INTRO}</p>
        <ol className="border-t border-hairline mb-6">
          {NDA_TERMS.map((term, i) => (
            <li
              key={i}
              className="py-4 border-b border-hairline flex gap-5 text-[0.85rem] leading-[1.8] text-ink"
            >
              <span className="font-serif text-lg text-gold flex-shrink-0 w-8">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{term}</span>
            </li>
          ))}
        </ol>
        <label className="flex items-start gap-4 cursor-pointer border border-green bg-cream p-5 mb-6">
          <input
            type="checkbox"
            checked={ndaChecked}
            onChange={(e) => setNdaChecked(e.target.checked)}
            className="mt-1 accent-[#8B6C2A] w-4 h-4"
          />
          <strong className="text-[0.85rem] leading-[1.7] text-green font-bold">
            {NDA_CONSENT_TEXT}
          </strong>
        </label>
        {ndaError ? (
          <p role="alert" className="mb-4 text-[0.85rem]" style={{ color: "var(--mv-status-error)" }}>
            {ndaError}
          </p>
        ) : null}
        <button type="button" onClick={acceptNda} disabled={busy} className={btnGreen}>
          {busy ? "Recording" : "Accept & open the data room"}
        </button>
      </div>
    );
  }

  /* ---------------- Unlocked: the data room ---------------- */
  return (
    <div>
      <p className="text-[0.75rem] leading-[1.7] text-charcoal mb-6">
        Confidentiality agreement accepted{" "}
        {data.ndaAcceptedAt ? formatDate(data.ndaAcceptedAt) : ""}. Access is
        logged per document. Download permission is set per document; expired
        or superseded versions are withdrawn automatically.
      </p>

      {data.documents.length === 0 ? (
        <p className="border border-hairline bg-white p-6 text-[0.9rem] text-charcoal">
          You are authorised for this data room. Documents will appear here as
          the selling party releases them — addenda are notified the moment
          they are published.
        </p>
      ) : (
        <ul className="border border-hairline divide-y divide-hairline bg-white">
          {data.documents.map((d) => {
            const expired = d.currentVersion?.isExpired ?? d.expired;
            return (
              <li key={d.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-body text-[0.95rem] text-green">
                      {d.title}
                      {d.isAddendum ? (
                        <span className="ml-2 font-display text-[0.5rem] tracking-[0.2em] uppercase text-gold border border-gold px-2 py-0.5">
                          Addendum
                        </span>
                      ) : null}
                      {expired ? (
                        <span className="ml-2 font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal border border-hairline px-2 py-0.5">
                          Expired — awaiting replacement
                        </span>
                      ) : null}
                    </p>
                    <p className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-charcoal mt-2">
                      {d.categoryLabel} · v{d.currentVersion?.version ?? 0} ·{" "}
                      {d.currentVersion?.uploadedAt
                        ? `uploaded ${formatDate(d.currentVersion.uploadedAt)}`
                        : "not yet uploaded"}
                      {d.currentVersion?.fileSize
                        ? ` · ${formatNumber(
                            Math.round(d.currentVersion.fileSize / 1024)
                          )} KB`
                        : ""}
                      {d.currentVersion?.expiresAt
                        ? ` · expires ${formatDate(d.currentVersion.expiresAt)}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {d.currentVersion && !expired ? (
                      <>
                        {full ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewDoc(previewDoc === d.id ? null : d.id)
                            }
                            className="font-display text-[0.6rem] tracking-[0.2em] uppercase text-green underline underline-offset-4 hover:text-gold transition-colors"
                          >
                            {previewDoc === d.id ? "Close preview" : "View PDF"}
                          </button>
                        ) : (
                          <a
                            href={fileUrl(d.id, "view")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-display text-[0.6rem] tracking-[0.2em] uppercase text-green underline underline-offset-4 hover:text-gold transition-colors"
                          >
                            View PDF
                          </a>
                        )}
                        {d.allowDownload ? (
                          <a
                            href={fileUrl(d.id, "download")}
                            className="font-display text-[0.6rem] tracking-[0.2em] uppercase text-green border border-green px-4 py-2 hover:bg-green hover:text-cream transition-colors"
                          >
                            Download
                          </a>
                        ) : (
                          <span
                            className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-charcoal border border-hairline px-4 py-2"
                            title="Download permission not granted for this document"
                          >
                            View only
                          </span>
                        )}
                      </>
                    ) : null}
                    {d.versions.length > 1 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setOpenHistory(openHistory === d.id ? null : d.id)
                        }
                        aria-expanded={openHistory === d.id}
                        className="font-display text-[0.6rem] tracking-[0.2em] uppercase text-charcoal hover:text-green transition-colors"
                      >
                        {openHistory === d.id ? "Hide history" : `History (${d.versions.length})`}
                      </button>
                    ) : null}
                  </div>
                </div>

                {d.currentVersion?.notes && !expired ? (
                  <p className="mt-3 text-[0.8rem] leading-[1.7] text-charcoal">
                    <span className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-gold">
                      Notes ·{" "}
                    </span>
                    {d.currentVersion.notes}
                  </p>
                ) : null}

                {/* Version history */}
                {openHistory === d.id && d.versions.length > 0 ? (
                  <ol className="mt-4 border border-hairline divide-y divide-hairline">
                    {d.versions.map((v) => (
                      <li key={v.id} className="flex flex-wrap items-baseline justify-between gap-3 p-3.5">
                        <span className="text-[0.8rem] text-green">
                          v{v.version} · {v.fileName}
                          {v.supersededAt ? (
                            <span className="ml-2 font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal">
                              superseded
                            </span>
                          ) : null}
                          {v.isExpired ? (
                            <span className="ml-2 font-display text-[0.5rem] tracking-[0.2em] uppercase text-charcoal">
                              expired
                            </span>
                          ) : null}
                        </span>
                        <span className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-charcoal">
                          uploaded {formatDate(v.uploadedAt)}
                          {v.notes ? ` · ${v.notes}` : ""}
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : null}

                {/* Inline PDF viewer (portal) */}
                {full && previewDoc === d.id && d.currentVersion && !expired ? (
                  <div className="mt-4 border border-hairline">
                    <iframe
                      src={fileUrl(d.id, "view")}
                      title={`${d.title} — PDF preview`}
                      className="w-full h-[70vh]"
                      aria-label={`PDF preview of ${d.title}`}
                    />
                    <p className="p-3 border-t border-hairline text-[0.7rem] text-charcoal">
                      Viewing v{d.currentVersion.version}. If the preview does
                      not load,{" "}
                      <a
                        href={fileUrl(d.id, "view")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green underline underline-offset-4"
                      >
                        open the PDF in a new tab
                      </a>
                      .
                    </p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {error ? (
        <p role="alert" className="mt-4 text-[0.85rem]" style={{ color: "var(--mv-status-error)" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
