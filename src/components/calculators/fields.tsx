"use client";

/* Shared calculator form primitives — brand form rules (§5.8):
   no boxes, bottom rule only, labels above inputs. */

import { cn } from "@/lib/utils";

export function FieldLabel({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[0.6rem] tracking-[0.28em] uppercase text-charcoal mb-3 font-body"
    >
      {children}
    </label>
  );
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  suffix,
  min,
  max,
  step,
  placeholder,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent border-0 border-b border-sand focus:border-green outline-none py-3 pr-12 font-body text-base text-green placeholder:text-charcoal/50 transition-colors"
        />
        {suffix ? (
          <span className="absolute right-0 bottom-3 text-[0.7rem] tracking-[0.15em] uppercase text-charcoal font-body">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-transparent border-0 border-b border-sand focus:border-green outline-none py-3 font-body text-base text-green transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function OutputRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3 border-b border-hairline">
      <dt className="text-[0.6rem] tracking-[0.25em] uppercase text-charcoal font-body">
        {label}
      </dt>
      <dd
        className={cn(
          "font-body text-right",
          emphasis
            ? "font-serif text-2xl text-green"
            : "text-[0.95rem] text-green"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export function parseNumber(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
