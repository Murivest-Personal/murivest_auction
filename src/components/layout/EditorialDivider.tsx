/** Editorial divider between major sections (brand guide §5.12). */
export function EditorialDivider() {
  return (
    <div className="border-y border-sand py-10 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
      <span className="font-serif italic text-base text-ink">
        Murivest Group Ltd. — Nairobi · London
      </span>
      <span className="font-display text-[0.55rem] tracking-[0.3em] uppercase text-gold">
        Engagements by Mandate Only
      </span>
      <span className="font-serif italic text-base text-ink">
        East Africa · United Kingdom · International
      </span>
    </div>
  );
}
