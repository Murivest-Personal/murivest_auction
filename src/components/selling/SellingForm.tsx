"use client";



import { useState, useMemo, useCallback } from "react";

import { evaluateSellingEligibility, type SellingEligibilityInput, type SellingRejection } from "@/lib/selling/criteria";

import { ArrowLink } from "@/components/ui/ArrowLink";



type FormData = {

  title: string;

  market: string;

  region: string;

  location: string;

  assetType: string;

  tenure: string;

  size: string;

  guidePrice: string;

  reservePrice: string;

  auctionDate: string;

  auctionHouse: string;

  sellingParty: string;

  referenceCode: string;

  facts: {

    saleType: string;

    tenure: string;

    subtype: string;

    buildingClass: string;

    yearBuilt: string;

    price: string;

    currency: string;

    pricePerSf: string;

    noi: string;

    grossAnnualRent: string;

    tenancy: string;

    buildingHeight: string;

    far: string;

    lotSizeAc: string;

    buildingSf: string;

    occupancy: string;

  };

  description: string;

  keyHighlights: string;

  viewingDetails: string;

  conditionsOfSale: {

    jurisdiction: string;

    summaryPoints: string;

    depositPercent: string;

    depositDue: string;

    depositPaymentMethod: string;

    depositPayee: string;

    balanceDays: string;

    buyersPremium: string;

    documentLabel: string;

  };

  legalPackAvailable: string;

  coordinates: {

    lat: string;

    lng: string;

    zoom: string;

  };

  sellerName: string;

  sellerEmail: string;

  sellerPhone: string;

  sellerEntity: string;

  sellerRole: string;

  noCommission: boolean;

  flexibleGuidePrice: boolean;

  accuracy: boolean;

  consentPrivacy: boolean;

};



const initialFormData: FormData = {

  title: "",

  market: "",

  region: "",

  location: "",

  assetType: "",

  tenure: "",

  size: "",

  guidePrice: "",

  reservePrice: "",

  auctionDate: "",

  auctionHouse: "",

  sellingParty: "",

  referenceCode: "",

  facts: {

    saleType: "",

    tenure: "",

    subtype: "",

    buildingClass: "",

    yearBuilt: "",

    price: "",

    currency: "USD",

    pricePerSf: "",

    noi: "",

    grossAnnualRent: "",

    tenancy: "",

    buildingHeight: "",

    far: "",

    lotSizeAc: "",

    buildingSf: "",

    occupancy: "",

  },

  description: "",

  keyHighlights: "",

  viewingDetails: "",

  conditionsOfSale: {

    jurisdiction: "",

    summaryPoints: "",

    depositPercent: "",

    depositDue: "",

    depositPaymentMethod: "",

    depositPayee: "",

    balanceDays: "",

    buyersPremium: "",

    documentLabel: "Full conditions of sale (PDF)",

  },

  legalPackAvailable: "",

  coordinates: {

    lat: "",

    lng: "",

    zoom: "14",

  },

  sellerName: "",

  sellerEmail: "",

  sellerPhone: "",

  sellerEntity: "",

  sellerRole: "",

  noCommission: false,

  flexibleGuidePrice: false,

  accuracy: false,

  consentPrivacy: false,

};



const ASSET_TYPES = ["Office", "Industrial", "Retail", "Hospitality", "Mixed-Use", "Land", "Alternative"];

const TENURE_TYPES = ["Freehold", "Leasehold", "Unknown"];

const MARKETS = ["Kenya", "UK"];

const SALE_TYPES = ["Investment", "Owner-Occupier", "Development", "Mixed"];

const BUILDING_CLASSES = ["A", "B", "C", "Not applicable"];

const TENANCY_TYPES = ["Single", "Multi", "Vacant"];

const CURRENCIES = ["USD", "GBP", "KES"];

const JURISDICTIONS = ["Kenya", "UK", "Other"];

const SELLER_ROLES = ["Owner / principal", "Director / authorised officer", "Relationship manager", "Family office representative", "Institutional asset manager", "Receiver / insolvency practitioner", "Solicitor / professional adviser", "Other authorised representative"];

const LEGAL_PACK_OPTIONS = ["Yes", "No"];



function parseNumber(value: string): number {

  return Number(value.replace(/,/g, ""));

}



function formatNumber(value: number | null): string {

  if (value === null || !Number.isFinite(value)) return "—";

  return value.toFixed(2);

}



interface InputProps {

  label: string;

  name: string;

  type?: string;

  step?: string;

  required?: boolean;

  error?: boolean;

  form: FormData;

  fieldErrors: Record<string, boolean>;

  handleChange: (name: string, value: string | boolean) => void;

}



function Input({ label, name, type = "text", step, required = true, error = false, form, fieldErrors, handleChange }: InputProps) {

  const keys = name.split(".");

  const value = keys.reduce((o: unknown, k) => (o as Record<string, unknown>)[k], form) as string | boolean;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {

    const target = e.target as HTMLInputElement;

    handleChange(name, target.type === "checkbox" ? target.checked : target.value);

  };



  return (

    <label className="block mb-6">

      <span className="block font-display text-[0.55rem] tracking-[0.22em] uppercase text-charcoal mb-1.5">

        {label} {required && <span className="text-gold" aria-hidden="true">*</span>}

      </span>

      <input

        type={type}

        step={step}

        value={value as string}

        onChange={onChange}

        className={`w-full px-4 py-3 bg-cream border border-hairline ${error ? "border-gold border-2" : "hover:border-charcoal/40"} focus:outline-none focus:border-gold transition-colors font-body text-[0.95rem] text-green`}

      />

    </label>

  );

}



interface TextareaProps {

  label: string;

  name: string;

  required?: boolean;

  error?: boolean;

  rows?: number;

  form: FormData;

  handleChange: (name: string, value: string | boolean) => void;

}



function Textarea({ label, name, required = true, error = false, rows = 4, form, handleChange }: TextareaProps) {

  const keys = name.split(".");

  const value = keys.reduce((o: unknown, k) => (o as Record<string, unknown>)[k], form) as string;

  return (

    <label className="block mb-6">

      <span className="block font-display text-[0.55rem] tracking-[0.22em] uppercase text-charcoal mb-1.5">

        {label} {required && <span className="text-gold" aria-hidden="true">*</span>}

      </span>

      <textarea

        value={value || ""}

        onChange={(e) => handleChange(name, e.target.value)}

        rows={rows}

        className={`w-full px-4 py-3 bg-cream border border-hairline ${error ? "border-gold border-2" : "hover:border-charcoal/40"} focus:outline-none focus:border-gold transition-colors font-body text-[0.95rem] text-green resize-y`}

      />

    </label>

  );

}



interface SelectProps {

  label: string;

  name: string;

  options: string[];

  required?: boolean;

  error?: boolean;

  placeholder?: string;

  form: FormData;

  handleChange: (name: string, value: string | boolean) => void;

}



function Select({ label, name, options, required = true, error = false, placeholder = "Select", form, handleChange }: SelectProps) {

  const keys = name.split(".");

  const value = keys.reduce((o: unknown, k) => (o as Record<string, unknown>)[k], form) as string;

  return (

    <label className="block mb-6">

      <span className="block font-display text-[0.55rem] tracking-[0.22em] uppercase text-charcoal mb-1.5">

        {label} {required && <span className="text-gold" aria-hidden="true">*</span>}

      </span>

      <div className={`border border-hairline ${error ? "border-gold border-2" : "hover:border-charcoal/40"} transition-colors`}>

        <select

          value={value || ""}

          onChange={(e) => handleChange(name, e.target.value)}

          className="w-full px-4 py-3 bg-cream border-0 focus:outline-none font-body text-[0.95rem] text-green"

        >

          <option value="" disabled>{placeholder}</option>

          {options.map((opt) => (

            <option key={opt} value={opt}>{opt}</option>

          ))}

        </select>

      </div>

    </label>

  );

}



interface CheckboxProps {

  label: string;

  name: string;

  required?: boolean;

  error?: boolean;

  form: FormData;

  handleChange: (name: string, value: string | boolean) => void;

}



function Checkbox({ label, name, required = true, error = false, form, handleChange }: CheckboxProps) {

  const keys = name.split(".");

  const value = keys.reduce((o: unknown, k) => (o as Record<string, unknown>)[k], form) as boolean;

  return (

    <label className={`flex items-start gap-3 mb-4 ${error ? "text-gold" : ""}`}>

      <input

        type="checkbox"

        checked={value}

        onChange={(e) => handleChange(name, e.target.checked)}

        className="mt-1 w-4 h-4 border-hairline text-green focus:ring-0 focus:border-gold rounded-none"

        aria-required={required}

      />

      <span className="font-body text-[0.95rem] leading-relaxed text-green">

        {label} {required && <span className="text-gold" aria-hidden="true">*</span>}

      </span>

    </label>

  );

}



interface FileInputProps {

  label: string;

  name: string;

  accept: string;

  multiple?: boolean;

  required?: boolean;

  error?: boolean;

  value: File | File[] | null;

  onChange: (files: FileList | null) => void;

  currentFiles?: File[];

}



function FileInput({ label, name, accept, multiple = false, required = true, error = false, value, onChange, currentFiles }: FileInputProps) {

  return (

    <label className="block mb-6">

      <span className="block font-display text-[0.55rem] tracking-[0.22em] uppercase text-charcoal mb-1.5">

        {label} {required && <span className="text-gold" aria-hidden="true">*</span>}

      </span>

      <div className={`border border-hairline ${error ? "border-gold border-2" : "hover:border-charcoal/40"} transition-colors p-4`}>

        <input

          type="file"

          accept={accept}

          multiple={multiple}

          onChange={(e) => onChange(e.target.files)}

          className="sr-only"

          id={name}

          aria-required={required}

        />

        <button

          type="button"

          onClick={() => document.getElementById(name)?.click()}

          className="btn btn-secondary w-full justify-start gap-3"

        >

          <span className="font-body text-[0.9rem] text-green">

            {currentFiles && currentFiles.length > 0

              ? `${currentFiles.length} file(s) selected`

              : "Choose file" + (multiple ? "s" : "")}

          </span>

        </button>

        {currentFiles && currentFiles.length > 0 && (

          <ul className="mt-3 space-y-1">

            {currentFiles.map((f, i) => (

              <li key={i} className="font-body text-[0.85rem] text-charcoal flex items-center gap-2">

                {f.name} ({(f.size / 1024).toFixed(1)} KB)

              </li>

            ))}

          </ul>

        )}

      </div>

    </label>

  );

}



export function SellingForm() {

  const [form, setForm] = useState<FormData>(initialFormData);

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const [error, setError] = useState<string>("");

  const [rejection, setRejection] = useState<{ reasons: SellingRejection[]; metrics: { grossYield: number | null; paybackYears: number | null } } | null>(null);

  const [reference, setReference] = useState<string>("");

  const [startedAt] = useState(Date.now());

  const [hpField, setHpField] = useState("");

  const [mainImage, setMainImage] = useState<File | null>(null);

  const [galleryImages, setGalleryImages] = useState<File[]>([]);

  const [legalPack, setLegalPack] = useState<File | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});



  const eligibility = useMemo(() => {

    const guidePrice = parseNumber(form.guidePrice);

    const grossAnnualRent = parseNumber(form.facts.grossAnnualRent);

    const noi = parseNumber(form.facts.noi);



    const input: SellingEligibilityInput = {

      assetType: form.assetType,

      tenancy: form.facts.tenancy,

      guidePrice,

      grossAnnualRent,

      noi,

      flexibleGuidePrice: form.flexibleGuidePrice,

      noCommission: form.noCommission,

    };



    return evaluateSellingEligibility(input);

  }, [form.assetType, form.facts.tenancy, form.guidePrice, form.facts.grossAnnualRent, form.facts.noi, form.flexibleGuidePrice, form.noCommission]);



  const handleChange = useCallback((name: string, value: string | boolean) => {

    setForm((prev) => {

      const keys = name.split(".");

      if (keys.length === 1) {

        return { ...prev, [name]: value };

      }

      if (keys.length === 2) {

        return {

          ...prev,

          [keys[0]]: { ...prev[keys[0]], [keys[1]]: value },

        };

      }

      return prev;

    });

    setFieldErrors((prev) => ({ ...prev, [name]: false }));

  }, []);



  const validateForm = (): boolean => {

    const errors: Record<string, boolean> = {};

    let isValid = true;



    const requiredFields = [

      "title", "market", "region", "location", "assetType", "tenure", "size", "guidePrice",

      "sellingParty", "facts.saleType", "facts.tenure", "facts.buildingClass", "facts.yearBuilt",

      "facts.price", "facts.currency", "facts.noi", "facts.grossAnnualRent", "facts.tenancy",

      "description", "conditionsOfSale.jurisdiction", "conditionsOfSale.summaryPoints",

      "conditionsOfSale.depositPercent", "conditionsOfSale.depositDue",

      "conditionsOfSale.depositPaymentMethod", "conditionsOfSale.depositPayee",

      "conditionsOfSale.balanceDays", "sellerName", "sellerEmail", "sellerPhone", "sellerRole",

      "legalPackAvailable",

    ];



    for (const field of requiredFields) {

      const keys = field.split(".");

      let value: unknown = form;

      for (const key of keys) {

        value = (value as Record<string, unknown>)[key];

      }

      if (value === "") {

        errors[field] = true;

        isValid = false;

      }

    }



    if (form.sellerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.sellerEmail)) {

      errors["sellerEmail"] = true;

      isValid = false;

    }



    if (form.sellerPhone && !/^[+0-9\-() ]{7,20}$/.test(form.sellerPhone)) {

      errors["sellerPhone"] = true;

      isValid = false;

    }



    const guidePrice = parseNumber(form.guidePrice);

    if (!Number.isFinite(guidePrice) || guidePrice <= 0) {

      errors["guidePrice"] = true;

      isValid = false;

    }



    const reservePrice = form.reservePrice ? parseNumber(form.reservePrice) : null;

    if (reservePrice !== null && (!Number.isFinite(reservePrice) || reservePrice <= 0 || reservePrice > guidePrice)) {

      errors["reservePrice"] = true;

      isValid = false;

    }



    const facts = form.facts;

    const numericFacts = ["price", "noi", "grossAnnualRent", "yearBuilt", "pricePerSf", "buildingHeight", "far", "lotSizeAc", "buildingSf", "occupancy"];

    for (const nf of numericFacts) {

      const val = parseNumber(facts[nf as keyof typeof facts]);

      if (!Number.isFinite(val) || val < 0) {

        errors[`facts.${nf}`] = true;

        isValid = false;

      }

    }



    if (facts.occupancy && (parseNumber(facts.occupancy) < 0 || parseNumber(facts.occupancy) > 100)) {

      errors["facts.occupancy"] = true;

      isValid = false;

    }



    const lat = parseNumber(form.coordinates.lat);

    const lng = parseNumber(form.coordinates.lng);

    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {

      errors["coordinates.lat"] = true;

      isValid = false;

    }

    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {

      errors["coordinates.lng"] = true;

      isValid = false;

    }



    if (!mainImage) {

      errors["main_image"] = true;

      isValid = false;

    }



    const summaryPoints = form.conditionsOfSale.summaryPoints.split("\n").filter((p) => p.trim());

    if (summaryPoints.length < 4 || summaryPoints.length > 12) {

      errors["conditionsOfSale.summaryPoints"] = true;

      isValid = false;

    }



    const highlights = form.keyHighlights.split("\n").filter((h) => h.trim());

    if (highlights.length > 5) {

      errors["keyHighlights"] = true;

      isValid = false;

    }



    if (!form.noCommission) { errors["noCommission"] = true; isValid = false; }

    if (!form.flexibleGuidePrice) { errors["flexibleGuidePrice"] = true; isValid = false; }

    if (!form.accuracy) { errors["accuracy"] = true; isValid = false; }

    if (!form.consentPrivacy) { errors["consentPrivacy"] = true; isValid = false; }

    if (!form.legalPackAvailable) { errors["legalPackAvailable"] = true; isValid = false; }



    setFieldErrors(errors);

    return isValid;

  };



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!validateForm()) {

      setError("Please complete all required fields correctly.");

      return;

    }



    setStatus("submitting");

    setError("");

    setRejection(null);



    const formData = new FormData();

    const payload = {

      ...form,

      guidePrice: parseNumber(form.guidePrice),

      reservePrice: form.reservePrice ? parseNumber(form.reservePrice) : null,

      facts: {

        ...form.facts,

        yearBuilt: parseNumber(form.facts.yearBuilt) || null,

        price: parseNumber(form.facts.price),

        pricePerSf: parseNumber(form.facts.pricePerSf) || null,

        noi: parseNumber(form.facts.noi),

        grossAnnualRent: parseNumber(form.facts.grossAnnualRent),

        buildingHeight: parseNumber(form.facts.buildingHeight) || null,

        far: parseNumber(form.facts.far) || null,

        lotSizeAc: parseNumber(form.facts.lotSizeAc) || null,

        buildingSf: parseNumber(form.facts.buildingSf) || null,

        occupancy: parseNumber(form.facts.occupancy) || null,

      },

      conditionsOfSale: {

        ...form.conditionsOfSale,

        depositPercent: parseNumber(form.conditionsOfSale.depositPercent),

        balanceDays: parseNumber(form.conditionsOfSale.balanceDays),

        summaryPoints: form.conditionsOfSale.summaryPoints.split("\n").filter((p) => p.trim()),

      },

      coordinates: {

        lat: parseNumber(form.coordinates.lat),

        lng: parseNumber(form.coordinates.lng),

        zoom: parseNumber(form.coordinates.zoom) || 14,

      },

      keyHighlights: form.keyHighlights.split("\n").filter((h) => h.trim()),

      hp_field: hpField,

      form_started_at: startedAt,

    };



    formData.append("data", JSON.stringify(payload));



    if (mainImage) formData.append("main_image", mainImage);

    galleryImages.forEach((img) => formData.append("gallery", img));

    if (legalPack) formData.append("legal_pack", legalPack);



    try {

      const res = await fetch("/api/selling", {

        method: "POST",

        body: formData,

      });



      const json = await res.json();



      if (res.status === 422 && json.rejected) {

        setRejection({

          reasons: json.reasons,

          metrics: json.metrics,

        });

        setError("This property does not currently meet the Murivest selling test. Adjust the details and submit again.");

        setStatus("error");

      } else if (res.ok && json.ok) {

        setReference(json.reference);

        setStatus("success");

      } else {

        setError(json.error || json.message || "Submission failed. Please try again.");

        setStatus("error");

      }

    } catch {

      setError("Network error. Please try again.");

      setStatus("error");

    }

  };



  if (status === "success") {

    return (

      <div className="border border-hairline bg-cream p-8 md:p-12 max-w-3xl mx-auto">

        <div className="text-center mb-8">

          <span className="font-brand text-3xl text-green">Submitted</span>

          <h2 className="font-serif text-2xl md:text-3xl font-light text-green mt-2">

            Your property has been presented to Murivest.

          </h2>

        </div>

        <div className="border-t border-hairline my-8" />

        <dl className="space-y-4 font-body text-[1rem] leading-relaxed text-green">

          <div className="flex justify-between">

            <dt className="font-display text-[0.6rem] tracking-[0.22em] uppercase text-charcoal">Reference</dt>

            <dd className="font-serif text-xl price">{reference}</dd>

          </div>

          <div className="flex justify-between">

            <dt className="font-display text-[0.6rem] tracking-[0.22em] uppercase text-charcoal">Gross yield</dt>

            <dd className="price">{formatNumber(eligibility.metrics.grossYield)}%</dd>

          </div>

          <div className="flex justify-between">

            <dt className="font-display text-[0.6rem] tracking-[0.22em] uppercase text-charcoal">Payback</dt>

            <dd className="price">{formatNumber(eligibility.metrics.paybackYears)} years</dd>

          </div>

        </dl>

        <div className="border-t border-hairline my-8" />

        <p className="font-body text-[1rem] leading-relaxed text-ink mb-6">

          A member of the Murivest Auctions team will review your submission and contact you at{' '}

          <span className="font-serif">{form.sellerEmail}</span> and confirm the appropriate next step. Submission does not constitute acceptance of a mandate.

        </p>

        <ArrowLink href="/contact" className="w-full md:w-auto">

          Discuss a mandate

        </ArrowLink>

      </div>

    );

  }



  return (

    <form onSubmit={handleSubmit} className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_19rem] xl:gap-10">

      <div className="min-w-0 space-y-5">

        {/* Section 1: Property */}

        <fieldset className="scroll-mt-28 border border-hairline bg-white p-5 shadow-[0_8px_30px_rgba(18,38,27,0.035)] md:p-8">

          <legend className="font-serif text-xl font-light text-green mb-6">01 · Asset overview</legend>

          <div className="grid md:grid-cols-2 gap-6">

            <Input label="Property name" name="title" required error={fieldErrors.title} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Select label="Market" name="market" options={MARKETS} required error={fieldErrors.market} form={form} handleChange={handleChange} />

            <Input label="Region / County" name="region" required error={fieldErrors.region} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Input label="Full address / location" name="location" required error={fieldErrors.location} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Select label="Asset type" name="assetType" options={ASSET_TYPES} required error={fieldErrors.assetType} form={form} handleChange={handleChange} />

            <Select label="Tenure" name="tenure" options={TENURE_TYPES} required error={fieldErrors.tenure} form={form} handleChange={handleChange} />

            <Input label="Size (e.g. 12,400 sq ft or 1.2 acres)" name="size" required error={fieldErrors.size} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Input label="Guide price" name="guidePrice" type="number" required error={fieldErrors.guidePrice} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Input label="Reserve price (optional)" name="reservePrice" type="number" required={false} error={fieldErrors.reservePrice} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Input label="Auction date (optional)" name="auctionDate" type="date" required={false} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Input label="Auction house (optional)" name="auctionHouse" required={false} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Select

              label="Selling party"

              name="sellingParty"

              options={["Bank / lender", "Receiver / insolvency practitioner", "Private owner", "Corporate owner", "Family office / investment vehicle", "Institutional investor", "Auctioneer", "Other"]}

              required

              error={fieldErrors.sellingParty}

              form={form}

              handleChange={handleChange}

            />

            <Input label="Reference code (optional)" name="referenceCode" required={false} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

          </div>

        </fieldset>



        {/* Section 2: Income & facts */}

        <fieldset className="scroll-mt-28 border border-hairline bg-white p-5 shadow-[0_8px_30px_rgba(18,38,27,0.035)] md:p-8">

          <legend className="font-serif text-xl font-light text-green mb-6">02 · Investment & operating profile</legend>

          <div className="grid md:grid-cols-2 gap-6">

            <Select label="Sale type" name="facts.saleType" options={SALE_TYPES} required error={fieldErrors["facts.saleType"]} form={form} handleChange={handleChange} />

            <Select label="Tenure" name="facts.tenure" options={TENURE_TYPES} required error={fieldErrors["facts.tenure"]} form={form} handleChange={handleChange} />

            <Input label="Subtype (e.g. Storefront Retail/Residential)" name="facts.subtype" required={false} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Select label="Building class" name="facts.buildingClass" options={BUILDING_CLASSES} required error={fieldErrors["facts.buildingClass"]} form={form} handleChange={handleChange} />

            <Input label="Year built" name="facts.yearBuilt" type="number" required error={fieldErrors["facts.yearBuilt"]} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Input label="Price / valuation" name="facts.price" type="number" required error={fieldErrors["facts.price"]} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Select label="Currency" name="facts.currency" options={CURRENCIES} required error={fieldErrors["facts.currency"]} form={form} handleChange={handleChange} />

            <Input label="Price per sq ft" name="facts.pricePerSf" type="number" required={false} error={fieldErrors["facts.pricePerSf"]} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Input label="Annual NOI" name="facts.noi" type="number" required error={fieldErrors["facts.noi"]} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Input label="Gross annual rent" name="facts.grossAnnualRent" type="number" required error={fieldErrors["facts.grossAnnualRent"]} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Select label="Tenancy" name="facts.tenancy" options={TENANCY_TYPES} required error={fieldErrors["facts.tenancy"]} form={form} handleChange={handleChange} />

            <Input label="Building height (stories)" name="facts.buildingHeight" type="number" required={false} error={fieldErrors["facts.buildingHeight"]} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Input label="Floor area ratio (FAR)" name="facts.far" type="number" required={false} error={fieldErrors["facts.far"]} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Input label="Lot size (acres)" name="facts.lotSizeAc" type="number" required={false} error={fieldErrors["facts.lotSizeAc"]} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Input label="Building area (sq ft)" name="facts.buildingSf" type="number" required={false} error={fieldErrors["facts.buildingSf"]} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Input label="Occupancy (%)" name="facts.occupancy" type="number" required={false} error={fieldErrors["facts.occupancy"]} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

          </div>

        </fieldset>



        {/* Section 3: Description & highlights */}

        <fieldset className="scroll-mt-28 border border-hairline bg-white p-5 shadow-[0_8px_30px_rgba(18,38,27,0.035)] md:p-8">

          <legend className="font-serif text-xl font-light text-green mb-6">03 · Asset narrative</legend>

          <Textarea label="Description" name="description" required error={fieldErrors.description} rows={6} form={form} handleChange={handleChange} />

          <Textarea label="Key highlights (one per line, max 5)" name="keyHighlights" required={false} error={fieldErrors.keyHighlights} rows={5} form={form} handleChange={handleChange} />

          <Textarea label="Viewing details" name="viewingDetails" required={false} rows={3} form={form} handleChange={handleChange} />

        </fieldset>



        {/* Section 4: Conditions of sale */}

        <fieldset className="scroll-mt-28 border border-hairline bg-white p-5 shadow-[0_8px_30px_rgba(18,38,27,0.035)] md:p-8">

          <legend className="font-serif text-xl font-light text-green mb-6">04 · Sale terms & legal position</legend>

          <div className="grid md:grid-cols-2 gap-6 mb-6">

            <Select

              label="Jurisdiction"

              name="conditionsOfSale.jurisdiction"

              options={JURISDICTIONS}

              required

              error={fieldErrors["conditionsOfSale.jurisdiction"]}

              form={form}

              handleChange={handleChange}

            />

            <Input label="Deposit (%)" name="conditionsOfSale.depositPercent" type="number" required error={fieldErrors["conditionsOfSale.depositPercent"]} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Input label="Deposit due" name="conditionsOfSale.depositDue" required error={fieldErrors["conditionsOfSale.depositDue"]} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Input label="Deposit payment method" name="conditionsOfSale.depositPaymentMethod" required error={fieldErrors["conditionsOfSale.depositPaymentMethod"]} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Input label="Deposit payee" name="conditionsOfSale.depositPayee" required error={fieldErrors["conditionsOfSale.depositPayee"]} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Input label="Balance due within (days)" name="conditionsOfSale.balanceDays" type="number" required error={fieldErrors["conditionsOfSale.balanceDays"]} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Input label="Buyer's premium" name="conditionsOfSale.buyersPremium" required={false} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Input label="Document label" name="conditionsOfSale.documentLabel" required={false} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

          </div>

          <Textarea

            label="Summary points (one per line, 4–12)"

            name="conditionsOfSale.summaryPoints"

            required

            error={fieldErrors["conditionsOfSale.summaryPoints"]}

            rows={8}

            form={form}

            handleChange={handleChange}

          />

          <div className="grid md:grid-cols-2 gap-6 mt-6">

            <Select

              label="Legal pack available"

              name="legalPackAvailable"

              options={LEGAL_PACK_OPTIONS}

              required

              error={fieldErrors.legalPackAvailable}

              form={form}

              handleChange={handleChange}

            />

            <FileInput

              label="Legal pack (PDF, optional)"

              name="legal_pack"

              accept="application/pdf"

              required={false}

              value={legalPack}

              onChange={(files) => files && files.length > 0 && setLegalPack(files[0])}

              currentFiles={legalPack ? [legalPack] : []}

            />

          </div>

        </fieldset>



        {/* Section 5: Location & media */}

        <fieldset className="scroll-mt-28 border border-hairline bg-white p-5 shadow-[0_8px_30px_rgba(18,38,27,0.035)] md:p-8">

          <legend className="font-serif text-xl font-light text-green mb-6">05 · Location & supporting material</legend>

          <div className="grid md:grid-cols-3 gap-6 mb-6">

            <Input label="Latitude" name="coordinates.lat" type="number" step="any" required error={fieldErrors["coordinates.lat"]} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Input label="Longitude" name="coordinates.lng" type="number" step="any" required error={fieldErrors["coordinates.lng"]} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Input label="Zoom (default 14)" name="coordinates.zoom" type="number" required={false} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

          </div>

          <FileInput

            label="Main image (required)"

            name="main_image"

            accept="image/png,image/jpeg,image/webp"

            required

            error={fieldErrors.main_image}

            value={mainImage}

            onChange={(files) => files && files.length > 0 && setMainImage(files[0])}

            currentFiles={mainImage ? [mainImage] : []}

          />

          <FileInput

            label="Gallery images (optional, max 8)"

            name="gallery"

            accept="image/png,image/jpeg,image/webp"

            multiple

            required={false}

            value={galleryImages}

            onChange={(files) => files && setGalleryImages(Array.from(files).slice(0, 8))}

            currentFiles={galleryImages}

          />

        </fieldset>



        {/* Section 6: Seller */}

        <fieldset className="scroll-mt-28 border border-hairline bg-white p-5 shadow-[0_8px_30px_rgba(18,38,27,0.035)] md:p-8">

          <legend className="font-serif text-xl font-light text-green mb-6">06 · Introducer & principal</legend>

          <div className="grid md:grid-cols-2 gap-6">

            <Input label="Full name" name="sellerName" required error={fieldErrors.sellerName} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Input label="Email" name="sellerEmail" type="email" required error={fieldErrors.sellerEmail} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Input label="Phone" name="sellerPhone" required error={fieldErrors.sellerPhone} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Input label="Entity (optional)" name="sellerEntity" required={false} form={form} fieldErrors={fieldErrors} handleChange={handleChange} />

            <Select

              label="Role"

              name="sellerRole"

              options={SELLER_ROLES}

              required

              error={fieldErrors.sellerRole}

              form={form}

              handleChange={handleChange}

            />

          </div>

        </fieldset>



        {/* Section 7: Declaration */}

        <fieldset className="border border-green/15 bg-green/[0.035] p-5 md:p-8">

          <legend className="font-serif text-xl font-light text-green mb-6">07 · Authority & declarations</legend>

          <Checkbox

            label="I confirm no commission is payable to Murivest."

            name="noCommission"

            required

            error={fieldErrors.noCommission}

            form={form}

            handleChange={handleChange}

          />

          <Checkbox

            label="I accept a flexible guide price recommended by Murivest."

            name="flexibleGuidePrice"

            required

            error={fieldErrors.flexibleGuidePrice}

            form={form}

            handleChange={handleChange}

          />

          <Checkbox

            label="I confirm the information is accurate and I am authorised to submit this property."

            name="accuracy"

            required

            error={fieldErrors.accuracy}

            form={form}

            handleChange={handleChange}

          />

          <Checkbox

            label="I accept the Privacy Policy."

            name="consentPrivacy"

            required

            error={fieldErrors.consentPrivacy}

            form={form}

            handleChange={handleChange}

          />

        </fieldset>



        {/* Submit */}

        <div className="border-t border-hairline pt-6">

          {error && (

            <div className="mb-4 p-4 border border-gold bg-cream text-gold font-body text-[0.95rem]">

              {error}

              {rejection && (

                <div className="mt-4 border-t border-gold pt-4">

                  <h4 className="font-display text-[0.55rem] tracking-[0.22em] uppercase text-gold mb-2">

                    Server rejection reasons

                  </h4>

                  <dl className="space-y-2 font-body text-[0.9rem] text-gold mb-3">

                    <div className="flex justify-between">

                      <dt className="text-charcoal">Gross yield</dt>

                      <dd className="price font-medium">{rejection.metrics.grossYield !== null ? `${rejection.metrics.grossYield.toFixed(2)}%` : "—"}</dd>

                    </div>

                    <div className="flex justify-between">

                      <dt className="text-charcoal">Payback</dt>

                      <dd className="price font-medium">{rejection.metrics.paybackYears !== null ? `${rejection.metrics.paybackYears.toFixed(2)} years` : "—"}</dd>

                    </div>

                  </dl>

                  <ul className="space-y-1 font-body text-[0.85rem] text-gold">

                    {rejection.reasons.map((r, i) => (

                      <li key={i} className="flex gap-2">

                        <span aria-hidden="true">—</span>

                        <span>{r.message}</span>

                      </li>

                    ))}

                  </ul>

                </div>

              )}

            </div>

          )}

          <button

            type="submit"

            disabled={status === "submitting"}

            className="btn btn-primary w-full md:w-auto"

          >

            {status === "submitting" ? "Submitting…" : "Submit for preliminary review"}

          </button>

          <input type="hidden" name="hp_field" value={hpField} onChange={(e) => setHpField(e.target.value)} />

          <input type="hidden" name="form_started_at" value={String(startedAt)} />

        </div>

      </div>



      {/* Eligibility Panel */}

      <aside className="order-first xl:order-none xl:sticky xl:top-24 xl:self-start">

        <div className={`border bg-white p-6 shadow-[0_12px_40px_rgba(18,38,27,0.055)] ${!eligibility.eligible ? "border-gold/50" : "border-hairline"}`}>

          <div className="flex items-center justify-between mb-4">

            <h3 className="font-serif text-lg font-light text-green">Eligibility</h3>

            <span

              className={`font-display text-[0.5rem] tracking-[0.22em] uppercase px-2 py-1 border ${

                eligibility.eligible

                  ? "text-green border-green bg-green/5"

                  : "text-gold border-gold bg-gold/5"

              }`}

            >

              {eligibility.eligible ? "Eligible" : "Not eligible"}

            </span>

          </div>



          <dl className="space-y-3 font-body text-[0.95rem] leading-relaxed">

            <div className="flex justify-between border-b border-hairline pb-3">

              <dt className="text-charcoal">Gross yield</dt>

              <dd className="price text-green font-medium">

                {eligibility.metrics.grossYield !== null

                  ? `${eligibility.metrics.grossYield.toFixed(2)}%`

                  : "—"}

              </dd>

            </div>

            <div className="flex justify-between border-b border-hairline pb-3">

              <dt className="text-charcoal">Payback</dt>

              <dd className="price text-green font-medium">

                {eligibility.metrics.paybackYears !== null

                  ? `${eligibility.metrics.paybackYears.toFixed(2)} years`

                  : "—"}

              </dd>

            </div>

            <div className="flex justify-between border-b border-hairline pb-3">

              <dt className="text-charcoal">No commission</dt>

              <dd className={`flex items-center gap-2 ${form.noCommission ? "text-green" : "text-gold"}`}>

                {form.noCommission ? "✓" : "✗"}

              </dd>

            </div>

            <div className="flex justify-between">

              <dt className="text-charcoal">Flexible guide</dt>

              <dd className={`flex items-center gap-2 ${form.flexibleGuidePrice ? "text-green" : "text-gold"}`}>

                {form.flexibleGuidePrice ? "✓" : "✗"}

              </dd>

            </div>

          </dl>



          {eligibility.reasons.length > 0 && (

            <div className="mt-6 pt-6 border-t border-hairline">

              <h4 className="font-display text-[0.55rem] tracking-[0.22em] uppercase text-gold mb-3">

                Failed criteria

              </h4>

              <ul className="space-y-2 font-body text-[0.9rem] text-gold">

                {eligibility.reasons.map((r, i) => (

                  <li key={i} className="flex gap-2">

                    <span aria-hidden="true">—</span>

                    <span>{r.message}</span>

                  </li>

                ))}

              </ul>

            </div>

          )}



          {!eligibility.eligible && (

            <p className="mt-6 pt-6 border-t border-hairline font-body text-[0.9rem] leading-relaxed text-charcoal">

              This property does not currently meet the Murivest selling test. You can still submit for review.

            </p>

          )}



          <div className="mt-6 pt-6 border-t border-hairline text-center">

            <span className="font-display text-[0.5rem] tracking-[0.22em] uppercase text-charcoal">

              Formulae

            </span>

            <p className="font-body text-[0.8rem] leading-relaxed text-charcoal mt-2 text-left">

              Gross yield = gross annual rent ÷ guide price × 100

            </p>

            <p className="font-body text-[0.8rem] leading-relaxed text-charcoal mt-1 text-left">

              Payback = guide price ÷ gross annual rent

            </p>

          </div>

        </div>

      </aside>

    </form>

  );

}
