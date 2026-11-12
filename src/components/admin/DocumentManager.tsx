"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { VaultDocumentView } from "@/lib/vault/service";

/** Per-property document management: upload new versions (with
    addenda notifications to authorised buyers), toggle download
    permission, inspect version history and expiry. */
export function DocumentManager({
  propertySlug,
  documents,
}: {
  propertySlug: string;
  documents: VaultDocumentView[];
}) {
  const router = useRouter();
  const [uploadFor, setUploadFor] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [openHistory, setOpenHistory] = useState<string | null>(null);

  async function uploadVersion(documentId: string) {
    if (!file) {
      setError("Choose the new PDF version first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (notes) fd.append("notes", notes);
      if (expiresAt) fd.append("expires_at", expiresAt);
      const res = await fetch(`/api/admin/data-rooms/documents/${documentId}`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      setUploadFor(null);
      setFile(null);
      setNotes("");
      setExpiresAt("");
      router.refresh();
    } catch {
      setError("Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleDownload(doc: VaultDocumentView) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/data-rooms/documents/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allow_download: !doc.allowDownload }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Update failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("Update failed.");
    } finally {
      setBusy(false);
    }
  }

  if (documents.length === 0) {
    return (
      <p className="border border-hairline bg-white p-6 text-[0.85rem] text-charcoal">
        No documents in this data room yet. Add the first document below.
      </p>
    );
  }

  return (
    <div>
      <ul className="border border-hairline divide-y divide-hairline bg-white">
        {documents.map((doc) => (
          <li key={doc.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-body text-[0.95rem] text-green">
                  {doc.title}
                  {doc.category === "addendum" ? (
                    <span className="ml-2 font-display text-[0.5rem] tracking-[0.2em] uppercase text-gold border border-gold px-2 py-0.5">
                      Addendum
                    </span>
                  ) : null}
                </p>
                <p className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-charcoal mt-2">
                  {doc.categoryLabel} · current v{doc.currentVersion?.version ?? 0} ·{" "}
                  {doc.currentVersion?.uploadedAt
                    ? new Date(doc.currentVersion.uploadedAt).toLocaleDateString("en-GB")
                    : "—"}
                  {doc.currentVersion?.expiresAt
                    ? ` · expires ${new Date(doc.currentVersion.expiresAt).toLocaleDateString("en-GB")}`
                    : ""}
                  {doc.currentVersion?.isExpired ? " · EXPIRED" : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleDownload(doc)}
                  disabled={busy}
                  className={`font-display text-[0.55rem] tracking-[0.2em] uppercase px-4 py-2 border transition-colors ${
                    doc.allowDownload
                      ? "border-green text-green hover:bg-green hover:text-cream"
                      : "border-hairline text-charcoal"
                  }`}
                >
                  {doc.allowDownload ? "Downloads: allowed" : "Downloads: blocked"}
                </button>
                {doc.versions.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setOpenHistory(openHistory === doc.id ? null : doc.id)
                    }
                    className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-charcoal underline underline-offset-4 hover:text-green"
                  >
                    {openHistory === doc.id ? "Hide history" : `History (${doc.versions.length})`}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() =>
                    setUploadFor(uploadFor === doc.id ? null : doc.id)
                  }
                  className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-green border border-green px-4 py-2 hover:bg-green hover:text-cream transition-colors"
                >
                  {uploadFor === doc.id ? "Cancel" : "New version"}
                </button>
              </div>
            </div>

            {openHistory === doc.id ? (
              <ol className="mt-4 border border-hairline divide-y divide-hairline">
                {doc.versions.map((v) => (
                  <li key={v.id} className="flex flex-wrap justify-between gap-2 p-3">
                    <span className="text-[0.78rem] text-green">
                      v{v.version} · {v.fileName}
                      {v.supersededAt ? " · superseded" : ""}
                      {v.isExpired ? " · expired" : ""}
                    </span>
                    <span className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-charcoal">
                      {new Date(v.uploadedAt).toLocaleDateString("en-GB")}
                      {v.notes ? ` · ${v.notes}` : ""}
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}

            {uploadFor === doc.id ? (
              <div className="mt-4 border border-hairline bg-cream p-4 space-y-3">
                <p className="text-[0.78rem] text-ink">
                  Uploading a new version supersedes the current one and
                  notifies every authorised buyer
                  {doc.category === "addendum"
                    ? " — addenda notifications are the point."
                    : ""}
                  .
                </p>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="text-[0.8rem] text-green block"
                  aria-label="New PDF version"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Version notes (optional)"
                    className="bg-white border border-hairline px-3 py-2 text-[0.8rem] text-green outline-none focus:border-green"
                  />
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    aria-label="Version expiry"
                    className="bg-white border border-hairline px-3 py-2 text-[0.8rem] text-green outline-none focus:border-green"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => uploadVersion(doc.id)}
                  disabled={busy}
                  className="px-6 py-2.5 text-[0.6rem] tracking-[0.22em] uppercase font-display bg-green text-cream hover:bg-gold transition-colors disabled:opacity-40"
                >
                  {busy ? "Uploading" : "Publish new version"}
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {error ? (
        <p role="alert" className="mt-4 text-[0.8rem]" style={{ color: "var(--mv-status-error)" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
