"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ACQUISITION_TIMELINES,
  ASSET_CLASSES,
  BUDGET_CURRENCIES,
  BUYER_TERMS_TEXT,
  BUYER_TYPES,
  COUNTRIES,
  CORPORATE_BUYER_TYPES,
  FUNDING_PREFERENCES,
  ID_TYPES,
  PREFERRED_COUNTRIES,
  POF_TYPES,
} from "@/lib/buyer/constants";

/* ============================================================
   Buyer registration — the 10-point qualification capture in a
   4-step form. Posts multipart data to /api/buyers/register:
   proof of funds travels with the request and is stored in the
   private store (never public/). On success the buyer receives a
   one-time access code and a session cookie.
   ============================================================ */

interface Owner {
  name: string;
  share: string;
}

const STEPS = [
  { n: "01", title: "Buyer profile" },
  { n: "02", title: "Mandate & preferences" },
  { n: "03", title: "Funding & evidence" },
  { n: "04", title: "Review & submit" },
];

const inputCls =
  "w-full bg-transparent border-0 border-b border-sand focus:border-green outline-none py-3 text-base text-green placeholder:text-charcoal/50 transition-colors";
const labelCls =
  "block text-[0.6rem] tracking-[0.28em] uppercase text-charcoal mb-3 font-display";
const selectCls = `${inputCls} appearance-none cursor-pointer bg-cream`;

type OptionList = readonly { value: string; label: string }[];
function labelOf(list: OptionList, value: string) {
  return list.find((i) => i.value === value)?.label ?? value;
}

export function BuyerRegisterForm() {
  const [step, setStep] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [pofFile, setPofFile] = useState<File | null>(null);
  const [owners, setOwners] = useState<Owner[]>([{ name: "", share: "" }]);
  const [assetClasses, setAssetClasses] = useState<string[]>([]);
  const [form, setForm] = useState({
    buyer_type: "individual",
    full_name: "",
    email: "",
    phone: "",
    country_of_residence: "",
    tax_jurisdiction: "",
    id_type: "passport",
    id_number: "",
    purchasing_entity_name: "",
    purchasing_entity_jurisdiction: "",
    budget_min: "",
    budget_max: "",
    budget_currency: "USD",
    preferred_country: "kenya",
    preferred_locations: "",
    funding_preference: "cash",
    pof_type: "",
    lender_name: "",
    acquisition_timeline: "",
    consent_terms: false,
    hp_field: "",
  });

  const corporate = CORPORATE_BUYER_TYPES.includes(form.buyer_type);

  const set =
    (key: keyof typeof form) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) =>
      setForm((f) => ({
        ...f,
        [key]:
          e.target instanceof HTMLInputElement && e.target.type === "checkbox"
            ? e.target.checked
            : e.target.value,
      }));

  function toggleAssetClass(asset: string) {
    setAssetClasses((list) =>
      list.includes(asset) ? list.filter((a) => a !== asset) : [...list, asset]
    );
  }

  function validateStep(): string | null {
    if (step === 0) {
      if (form.full_name.trim().length < 2) return "Provide your full name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
        return "Provide a valid email address.";
      if (!/^[+0-9\-() ]{7,20}$/.test(form.phone.trim()))
        return "Provide a valid phone number.";
      if (!form.country_of_residence) return "Select your country of residence.";
      if (!form.tax_jurisdiction) return "Select your tax jurisdiction.";
      if (form.id_number.trim().length < 3)
        return "Provide your identification number.";
    }
    if (step === 1) {
      if (corporate && form.purchasing_entity_name.trim().length < 2)
        return "Corporate buyers must provide the purchasing entity name.";

      // Validate beneficial owners up-front so the user doesn't
      // only discover a bad row after pressing Submit on step 4.
      if (corporate) {
        for (const o of owners) {
          const hasName = o.name.trim().length > 0;
          const hasShare = o.share.trim() !== "";
          if (hasName !== hasShare)
            return "Each beneficial owner needs both a name and a percentage.";
          if (hasName && o.name.trim().length < 2)
            return "Beneficial owner names must be at least 2 characters.";
          if (hasShare) {
            const share = Number(o.share);
            if (!Number.isFinite(share) || share < 0 || share > 100)
              return "Ownership percentages must be between 0 and 100.";
          }
        }
        const total = owners
          .filter((o) => o.name.trim().length >= 2 && o.share.trim() !== "")
          .reduce((s, o) => s + Number(o.share), 0);
        if (total > 100.5)
          return "Total beneficial ownership cannot exceed 100%.";
      }

      const min = Number(form.budget_min);
      const max = Number(form.budget_max);
      if (!Number.isFinite(min) || min <= 0) return "Provide a minimum budget.";
      if (!Number.isFinite(max) || max <= 0) return "Provide a maximum budget.";
      if (max < min) return "The maximum budget cannot be below the minimum.";
      if (assetClasses.length === 0) return "Select at least one asset class.";
      if (!form.acquisition_timeline) return "Select your acquisition timeline.";
    }
    if (step === 2) {
      if (!form.funding_preference) return "Select a funding preference.";
      if (form.pof_type === "lender_letter" && form.lender_name.trim().length < 2)
        return "Provide the lender's name for the lender evidence.";
    }
    if (step === 3) {
      if (!form.consent_terms) return "You must accept the registration terms.";
    }
    return null;
  }

  function next() {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, 3));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStatus("submitting");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      assetClasses.forEach((a) => fd.append("asset_classes", a));
      const filledOwners = owners.filter(
        (o) => o.name.trim().length >= 2 && o.share.trim() !== ""
      );
      if (corporate && filledOwners.length > 0) {
        fd.append(
          "beneficial_owners",
          JSON.stringify(
            filledOwners.map((o) => ({
              name: o.name.trim(),
              share: Number(o.share),
            }))
          )
        );
      }
      if (pofFile) fd.append("proof_of_funds", pofFile);
      fd.append("form_started_at", String(startedAt));

      const res = await fetch("/api/buyers/register", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Registration failed. Please try again.");
        setStatus("error");
        return;
      }
      setAccessCode(data.accessCode ?? "");
      setStatus("success");
    } catch {
      setError("Registration failed. Please try again.");
      setStatus("error");
    }
  }

  /* ---------- Success ---------- */
  if (status === "success") {
    return (
      <div role="status" className="border border-hairline bg-white p-8 md:p-10">
        <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
          Registration received
        </span>
        <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-4">
          You are registered. Your qualification review has started.
        </h2>
        <p className="text-[0.95rem] leading-[1.8] text-ink mb-8">
          Your status is <strong>Registration pending</strong>. The Murivest team
          will review your details and move you through identity verification
          (KYC) and funding verification. You can follow your status at any
          time from your account profile on this website.
        </p>
        <div className="border border-green bg-cream p-6 mb-8">
          <span className="block font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-3">
            Your access code — shown once, keep it safe
          </span>
          <p className="font-display text-2xl tracking-[0.2em] text-green select-all">
            {accessCode}
          </p>
          <p className="text-[0.75rem] leading-[1.7] text-charcoal mt-3">
            You will need this code together with your email address to sign in
            to your account on this website. In production this code is
            delivered by email; in this environment it is shown here once only.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/account"
            className="inline-flex items-center justify-center px-8 py-3 text-[0.65rem] tracking-[0.22em] uppercase font-display bg-green text-cream hover:bg-gold transition-colors"
          >
            Open your account
          </Link>
          <Link
            href="/auctions"
            className="inline-flex items-center justify-center px-8 py-3 text-[0.65rem] tracking-[0.22em] uppercase font-display text-green border border-green hover:bg-green hover:text-cream transition-colors"
          >
            Browse auctions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Buyer registration">
      {/* Step indicator */}
      <ol className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-hairline border border-hairline mb-10">
        {STEPS.map((s, i) => (
          <li
            key={s.n}
            aria-current={i === step ? "step" : undefined}
            className={`p-4 ${
              i === step
                ? "bg-green text-cream"
                : i < step
                  ? "bg-white text-green"
                  : "bg-white text-charcoal/50"
            }`}
          >
            <span className="block font-display text-[0.55rem] tracking-[0.3em] uppercase mb-1">
              {s.n}
            </span>
            <span className="font-body text-[0.75rem] leading-snug block">
              {s.title}
            </span>
          </li>
        ))}
      </ol>

      {/* ---------- Step 1: Buyer profile ---------- */}
      {step === 0 ? (
        <div className="space-y-10">
          <fieldset>
            <legend className={labelCls}>
              1 · Individual or corporate buyer
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {BUYER_TYPES.map((t) => (
                <label
                  key={t.value}
                  className={`flex items-center gap-3 border p-4 cursor-pointer transition-colors ${
                    form.buyer_type === t.value
                      ? "border-green bg-cream"
                      : "border-hairline hover:border-sand"
                  }`}
                >
                  <input
                    type="radio"
                    name="buyer_type"
                    value={t.value}
                    checked={form.buyer_type === t.value}
                    onChange={set("buyer_type")}
                    className="accent-[#1C2B1E] w-4 h-4"
                  />
                  <span className="font-body text-[0.85rem] text-green">
                    {t.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-8 sm:grid-cols-2">
            <label className="block">
              <span className={labelCls}>Full name</span>
              <input
                type="text"
                value={form.full_name}
                onChange={set("full_name")}
                required
                autoComplete="name"
                className={inputCls}
              />
            </label>
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
              <span className={labelCls}>Phone</span>
              <input
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                required
                placeholder="+254 …"
                autoComplete="tel"
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className={labelCls}>Country of residence</span>
              <select
                value={form.country_of_residence}
                onChange={set("country_of_residence")}
                required
                className={selectCls}
              >
                <option value="">Select a country…</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelCls}>Tax jurisdiction</span>
              <select
                value={form.tax_jurisdiction}
                onChange={set("tax_jurisdiction")}
                required
                className={selectCls}
              >
                <option value="">Select a jurisdiction…</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelCls}>Identification type</span>
              <select
                value={form.id_type}
                onChange={set("id_type")}
                className={selectCls}
              >
                {ID_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className={labelCls}>Identification number</span>
              <input
                type="text"
                value={form.id_number}
                onChange={set("id_number")}
                required
                className={inputCls}
              />
            </label>
          </div>
        </div>
      ) : null}

      {/* ---------- Step 2: Mandate & preferences ---------- */}
      {step === 1 ? (
        <div className="space-y-10">
          {corporate ? (
            <div className="border border-hairline p-6 space-y-8">
              <p className="font-display text-[0.6rem] tracking-[0.28em] uppercase text-gold">
                Purchasing entity & beneficial ownership
              </p>
              <div className="grid gap-8 sm:grid-cols-2">
                <label className="block">
                  <span className={labelCls}>Purchasing entity name</span>
                  <input
                    type="text"
                    value={form.purchasing_entity_name}
                    onChange={set("purchasing_entity_name")}
                    className={inputCls}
                    placeholder="e.g. Acacia Holdings Ltd"
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Entity jurisdiction</span>
                  <select
                    value={form.purchasing_entity_jurisdiction}
                    onChange={set("purchasing_entity_jurisdiction")}
                    className={selectCls}
                  >
                    <option value="">Select…</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div>
                <span className={labelCls}>
                  Beneficial owners (name · % owned)
                </span>
                <div className="space-y-3">
                  {owners.map((o, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_110px_44px] gap-3 items-center"
                    >
                      <input
                        type="text"
                        value={o.name}
                        aria-label={`Beneficial owner ${i + 1} name`}
                        onChange={(e) =>
                          setOwners((list) =>
                            list.map((x, j) =>
                              j === i ? { ...x, name: e.target.value } : x
                            )
                          )
                        }
                        placeholder="Full name"
                        className={inputCls}
                      />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={o.share}
                        aria-label={`Beneficial owner ${i + 1} percentage`}
                        onChange={(e) =>
                          setOwners((list) =>
                            list.map((x, j) =>
                              j === i ? { ...x, share: e.target.value } : x
                            )
                          )
                        }
                        placeholder="%"
                        className={inputCls}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setOwners((list) => list.filter((_, j) => j !== i))
                        }
                        aria-label={`Remove owner ${i + 1}`}
                        className="w-9 h-9 border border-hairline text-charcoal hover:text-green hover:border-green transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setOwners((list) => [...list, { name: "", share: "" }])}
                  className="mt-4 font-display text-[0.6rem] tracking-[0.25em] uppercase text-green border border-green px-5 py-2 hover:bg-green hover:text-cream transition-colors"
                >
                  + Add owner
                </button>
              </div>
            </div>
          ) : null}

          <div className="grid gap-8 sm:grid-cols-3">
            <label className="block">
              <span className={labelCls}>Budget — minimum</span>
              <input
                type="number"
                min={1}
                step={1000}
                value={form.budget_min}
                onChange={set("budget_min")}
                required
                className={inputCls}
                placeholder="e.g. 500000"
              />
            </label>
            <label className="block">
              <span className={labelCls}>Budget — maximum</span>
              <input
                type="number"
                min={1}
                step={1000}
                value={form.budget_max}
                onChange={set("budget_max")}
                required
                className={inputCls}
                placeholder="e.g. 2500000"
              />
            </label>
            <label className="block">
              <span className={labelCls}>Currency</span>
              <select
                value={form.budget_currency}
                onChange={set("budget_currency")}
                className={selectCls}
              >
                {BUDGET_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <label className="block">
              <span className={labelCls}>Preferred market</span>
              <select
                value={form.preferred_country}
                onChange={set("preferred_country")}
                className={selectCls}
              >
                {PREFERRED_COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelCls}>Preferred locations (optional)</span>
              <input
                type="text"
                value={form.preferred_locations}
                onChange={set("preferred_locations")}
                className={inputCls}
                placeholder="e.g. Westlands, Upper Hill, Manchester"
              />
            </label>
          </div>

          <fieldset>
            <legend className={labelCls}>Asset classes of interest</legend>
            <div className="flex flex-wrap gap-3">
              {ASSET_CLASSES.map((a) => (
                <label
                  key={a}
                  className={`flex items-center gap-2 border px-4 py-2.5 cursor-pointer transition-colors ${
                    assetClasses.includes(a)
                      ? "border-green bg-cream"
                      : "border-hairline hover:border-sand"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={assetClasses.includes(a)}
                    onChange={() => toggleAssetClass(a)}
                    className="accent-[#1C2B1E] w-4 h-4"
                  />
                  <span className="font-body text-[0.85rem] text-green">{a}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block max-w-md">
            <span className={labelCls}>Expected acquisition timeline</span>
            <select
              value={form.acquisition_timeline}
              onChange={set("acquisition_timeline")}
              required
              className={selectCls}
            >
              <option value="">Select…</option>
              {ACQUISITION_TIMELINES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {/* ---------- Step 3: Funding & evidence ---------- */}
      {step === 2 ? (
        <div className="space-y-10">
          <fieldset>
            <legend className={labelCls}>8 · Cash or financing</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {FUNDING_PREFERENCES.map((t) => (
                <label
                  key={t.value}
                  className={`flex items-center gap-3 border p-4 cursor-pointer transition-colors ${
                    form.funding_preference === t.value
                      ? "border-green bg-cream"
                      : "border-hairline hover:border-sand"
                  }`}
                >
                  <input
                    type="radio"
                    name="funding_preference"
                    value={t.value}
                    checked={form.funding_preference === t.value}
                    onChange={set("funding_preference")}
                    className="accent-[#1C2B1E] w-4 h-4"
                  />
                  <span className="font-body text-[0.85rem] text-green">
                    {t.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-8 sm:grid-cols-2">
            <label className="block">
              <span className={labelCls}>
                9 · Evidence type (optional)
              </span>
              <select
                value={form.pof_type}
                onChange={set("pof_type")}
                className={selectCls}
              >
                <option value="">Provide later / on request</option>
                {POF_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelCls}>Lender name (if financed)</span>
              <input
                type="text"
                value={form.lender_name}
                onChange={set("lender_name")}
                className={inputCls}
                placeholder="e.g. KCB Bank / UK bridging lender"
              />
            </label>
          </div>

          <div>
            <span className={labelCls}>
              Proof of funds / lender letter (optional · PDF, PNG or JPG · max 10 MB)
            </span>
            <label className="block border border-dashed border-sand hover:border-green transition-colors p-6 cursor-pointer">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
                onChange={(e) => setPofFile(e.target.files?.[0] ?? null)}
                className="sr-only"
              />
              <span className="font-body text-[0.85rem] text-green">
                {pofFile ? pofFile.name : "Choose a file or drag it here…"}
              </span>
              <span className="block text-[0.75rem] leading-[1.7] text-charcoal mt-3">
                Uploaded evidence is stored in Murivest&apos;s private,
                access-controlled document store — never in a public directory
                and never displayed on the website. Only the Murivest
                qualification team can view it, and every view is logged.
              </span>
            </label>
          </div>
        </div>
      ) : null}

      {/* ---------- Step 4: Review & submit ---------- */}
      {step === 3 ? (
        <div className="space-y-8">
          <dl className="border border-hairline divide-y divide-hairline">
            {(
              [
                ["Buyer type", labelOf(BUYER_TYPES, form.buyer_type)],
                [
                  "Name / contact",
                  `${form.full_name} · ${form.email} · ${form.phone}`,
                ],
                [
                  "Residence / tax",
                  `${form.country_of_residence} · ${form.tax_jurisdiction}`,
                ],
                [
                  "Identification",
                  `${labelOf(ID_TYPES, form.id_type)} · ${form.id_number}`,
                ],
                ...(corporate
                  ? ([
                      ["Purchasing entity", form.purchasing_entity_name || "—"],
                      [
                        "Beneficial owners",
                        owners
                          .filter((o) => o.name.trim())
                          .map((o) => `${o.name} (${o.share}%)`)
                          .join(" · ") || "—",
                      ],
                    ] as [string, string][])
                  : []),
                [
                  "Budget",
                  `${form.budget_min} – ${form.budget_max} ${form.budget_currency}`,
                ],
                [
                  "Market / locations",
                  `${labelOf(PREFERRED_COUNTRIES, form.preferred_country)}${
                    form.preferred_locations ? ` · ${form.preferred_locations}` : ""
                  }`,
                ],
                ["Asset classes", assetClasses.join(", ") || "—"],
                [
                  "Funding",
                  labelOf(FUNDING_PREFERENCES, form.funding_preference),
                ],
                [
                  "Evidence",
                  pofFile
                    ? `${pofFile.name} (attached)`
                    : labelOf(POF_TYPES, form.pof_type) || "On request",
                ],
                [
                  "Timeline",
                  labelOf(ACQUISITION_TIMELINES, form.acquisition_timeline),
                ],
              ] as [string, string][]
            ).map(([k, v]) => (
              <div key={k} className="grid sm:grid-cols-[200px_1fr] gap-2 p-4">
                <dt className="font-display text-[0.55rem] tracking-[0.25em] uppercase text-gold pt-1">
                  {k}
                </dt>
                <dd className="font-body text-[0.9rem] text-green break-words">
                  {v}
                </dd>
              </div>
            ))}
          </dl>

          <label className="flex items-start gap-4 cursor-pointer border border-green bg-cream p-5">
            <input
              type="checkbox"
              checked={form.consent_terms}
              onChange={set("consent_terms")}
              required
              className="mt-1 accent-[#8B6C2A] w-4 h-4"
            />
            <span>
              <span className="block font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-2">
                Registration terms — required
              </span>
              <strong className="text-[0.85rem] leading-[1.7] text-green font-bold">
                {BUYER_TERMS_TEXT}
              </strong>
            </span>
          </label>
        </div>
      ) : null}

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

      {error ? (
        <p
          role="alert"
          className="mt-6 text-[0.85rem] leading-[1.7]"
          style={{ color: "var(--mv-status-error)" }}
        >
          {error}
        </p>
      ) : null}

      {/* Navigation */}
      <div className="flex flex-wrap items-center gap-4 mt-10">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => {
              setError("");
              setStep((s) => s - 1);
            }}
            className="px-6 py-3 text-[0.65rem] tracking-[0.22em] uppercase font-display text-green border border-hairline hover:border-green transition-colors"
          >
            Back
          </button>
        ) : null}
        {step < 3 ? (
          <button
            type="button"
            onClick={next}
            className="px-8 py-3 text-[0.65rem] tracking-[0.22em] uppercase font-display bg-green text-cream hover:bg-gold transition-colors"
          >
            Continue
          </button>
        ) : (
          <button
            type="submit"
            disabled={status === "submitting"}
            className="px-8 py-3 text-[0.65rem] tracking-[0.22em] uppercase font-display bg-green text-cream hover:bg-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === "submitting" ? "Submitting" : "Submit registration"}
          </button>
        )}
      </div>
    </form>
  );
}