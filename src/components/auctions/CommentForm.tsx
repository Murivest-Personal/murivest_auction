"use client";

import { useEffect, useState } from "react";
import { COMMENT_INTRO, COMMENT_LEGAL } from "@/lib/legal";
import type { Property } from "@/lib/types";

type Status = "idle" | "submitting" | "success" | "error";

/** Public comment form — no sign-in. Honeypot + timing check,
    posts to /api/comments (addendum §4.5). */
export function CommentForm({ property }: { property: Property }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  // Captured at first client render — the timing check rejects
  // submissions faster than 1500ms after this point.
  const [startedAt] = useState(() => Date.now());
  const [form, setForm] = useState({
    author_name: "",
    author_email: "",
    body: "",
    consent: false,
    hp_field: "",
  });

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) =>
    setForm((f) => ({
      ...f,
      [key]:
        (e.target as HTMLInputElement).type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value,
    }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      form.author_name.trim().length < 2 ||
      form.author_name.trim().length > 80
    ) {
      setError("Please provide your name (2–80 characters).");
      setStatus("error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.author_email.trim())) {
      setError("Please provide a valid email address.");
      setStatus("error");
      return;
    }
    if (form.body.trim().length < 10 || form.body.trim().length > 2000) {
      setError("Comments must be between 10 and 2000 characters.");
      setStatus("error");
      return;
    }
    if (!form.consent) {
      setError("Please confirm you accept the comment terms.");
      setStatus("error");
      return;
    }
    setError("");
    setStatus("submitting");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_sanity_id: property._id,
          property_slug: property.slug,
          author_name: form.author_name,
          author_email: form.author_email,
          body: form.body,
          hp_field: form.hp_field,
          form_started_at: startedAt,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Unable to submit comment. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setError("Unable to submit comment. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="border border-hairline bg-cream p-6 md:p-10 max-w-[42rem] mb-10">
      <h3 className="font-serif text-xl md:text-2xl font-light text-green mb-3">
        Leave a comment
      </h3>
      <p className="text-[0.8rem] leading-[1.7] text-charcoal font-body mb-8">
        {COMMENT_INTRO}
      </p>

      {status === "success" ? (
        <p role="status" className="border border-hairline bg-white p-6 text-[0.9rem] leading-[1.8] text-green">
          Thank you. Your comment has been received and will appear once
          reviewed.
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <div className="grid gap-8 sm:grid-cols-2">
            <label className="block">
              <span className="block text-[0.6rem] tracking-[0.28em] uppercase text-charcoal mb-3 font-body">
                Name
              </span>
              <input
                type="text"
                value={form.author_name}
                onChange={set("author_name")}
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
                className="w-full bg-transparent border-0 border-b border-sand focus:border-green outline-none py-3 font-body text-base text-green transition-colors"
              />
            </label>
            <label className="block">
              <span className="block text-[0.6rem] tracking-[0.28em] uppercase text-charcoal mb-3 font-body">
                Email address
              </span>
              <input
                type="email"
                value={form.author_email}
                onChange={set("author_email")}
                required
                autoComplete="email"
                className="w-full bg-transparent border-0 border-b border-sand focus:border-green outline-none py-3 font-body text-base text-green transition-colors"
              />
              <span className="block mt-2 text-[0.7rem] text-charcoal">
                Never displayed. Used for moderation only.
              </span>
            </label>
          </div>

          <label className="block mt-8">
            <span className="block text-[0.6rem] tracking-[0.28em] uppercase text-charcoal mb-3 font-body">
              Comment
            </span>
            <textarea
              value={form.body}
              onChange={set("body")}
              required
              minLength={10}
              maxLength={2000}
              rows={5}
              className="w-full bg-transparent border-0 border-b border-sand focus:border-green outline-none py-3 font-body text-base text-green transition-colors resize-y"
            />
            <span className="block mt-2 text-[0.7rem] text-charcoal">
              {form.body.trim().length}/2000 characters
            </span>
          </label>

          {/* Honeypot */}
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

          <label className="flex items-start gap-4 mt-8 cursor-pointer">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={set("consent")}
              required
              className="mt-1 accent-[#1C2B1E] w-4 h-4"
            />
            <span className="text-[0.75rem] leading-[1.7] text-charcoal font-body">
              I accept the comment terms below and the Terms of Service.
            </span>
          </label>

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
            className="btn btn-primary mt-8 w-full disabled:opacity-100"
          >
            {status === "submitting" ? "Submitting" : "Submit comment"}
          </button>
        </form>
      )}

      <p className="mt-8 border-t border-hairline pt-6 text-[0.7rem] leading-[1.7] text-charcoal font-body">
        {COMMENT_LEGAL}
      </p>
    </div>
  );
}
