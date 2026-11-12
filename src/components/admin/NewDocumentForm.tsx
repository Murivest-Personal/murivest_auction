"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const inputCls =
  "w-full bg-cream border border-hairline px-3 py-2.5 text-[0.85rem] text-green outline-none focus:border-green transition-colors";
const labelCls =
  "block text-[0.55rem] tracking-[0.25em] uppercase text-charcoal mb-2 font-display";

/** Create a data room document (with version 1) for a property. */
export function NewDocumentForm({
  defaultSlug,
}: {
  defaultSlug?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    property_slug: defaultSlug ?? "",
    title: "",
    category: "legal_pack",
    allow_download: true,
    notes: "",
    expires_at: "",
  });
  const [file, setFile] = useState<File | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Attach the version 1 PDF.");
      return;
    }
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      fd.append("file", file);
      const res = await fetch("/api/admin/data-rooms/documents", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      setSaved(true);
      setForm((f) => ({ ...f, title: "", notes: "", expires_at: "" }));
      setFile(null);
      router.refresh();
    } catch {
      setError("Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="border border-hairline bg-white p-6">
      <p className="font-display text-[0.6rem] tracking-[0.28em] uppercase text-gold mb-6">
        Add a data room document
      </p>
      <div className="grid gap-5 sm:grid-cols-2 mb-5">
        <label className="block">
          <span className={labelCls}>Property slug</span>
          <input
            type="text"
            value={form.property_slug}
            onChange={(e) => setForm((f) => ({ ...f, property_slug: e.target.value }))}
            required
            placeholder="the lot's Sanity slug, e.g. westlands-office-block"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>Document title</span>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            placeholder="e.g. Title deed & official search"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>Category</span>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className={inputCls}
          >
            <option value="legal_pack">Legal pack</option>
            <option value="title">Title & encumbrances</option>
            <option value="tenancy">Tenancy schedule</option>
            <option value="searches">Searches</option>
            <option value="valuation">Valuation</option>
            <option value="addendum">Addendum</option>
            <option value="report">Survey & condition</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="block">
          <span className={labelCls}>Version 1 expiry (optional)</span>
          <input
            type="date"
            value={form.expires_at}
            onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
            className={inputCls}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelCls}>Notes (shown to authorised buyers)</span>
          <input
            type="text"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="e.g. Supplied by the chargee's advocates"
            className={inputCls}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelCls}>PDF (max 25 MB)</span>
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
            className="text-[0.8rem] text-green"
          />
        </label>
      </div>
      <label className="flex items-center gap-3 mb-5 cursor-pointer">
        <input
          type="checkbox"
          checked={form.allow_download}
          onChange={(e) => setForm((f) => ({ ...f, allow_download: e.target.checked }))}
          className="accent-[#1C2B1E] w-4 h-4"
        />
        <span className="text-[0.8rem] text-ink">
          Allow download (unchecked = view-only in the PDF viewer)
        </span>
      </label>
      {error ? (
        <p role="alert" className="mb-4 text-[0.8rem]" style={{ color: "var(--mv-status-error)" }}>
          {error}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="mb-4 text-[0.8rem] text-green">
          Document published to the data room.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="px-8 py-3 text-[0.6rem] tracking-[0.22em] uppercase font-display bg-green text-cream hover:bg-gold transition-colors disabled:opacity-40"
      >
        {busy ? "Publishing" : "Publish document"}
      </button>
    </form>
  );
}
