import { useState } from "react";
import type { LeadDraft } from "@/features/ops/store";

const inputClass = "mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-base md:text-sm outline-none focus:border-navy";

export function DetailsForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<LeadDraft>;
  submitLabel: string;
  onSubmit: (draft: LeadDraft) => void;
}) {
  const [draft, setDraft] = useState<LeadDraft>({
    name: initial?.name ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    address: initial?.address ?? "",
    city: initial?.city ?? "",
    source: initial?.source ?? "Canvass",
    product: initial?.product ?? "",
    notes: initial?.notes ?? "",
  });
  function set<K extends keyof LeadDraft>(key: K, value: LeadDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  return (
    <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); onSubmit(draft); }}>
      <label className="block">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Name</span>
        <input required autoComplete="name" value={draft.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
      </label>
      <label className="block">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Phone</span>
        <input required type="tel" inputMode="tel" autoComplete="tel" value={draft.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
      </label>
      <label className="block">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Address</span>
        <input value={draft.address} onChange={(e) => set("address", e.target.value)} className={inputClass} />
      </label>
      <label className="block">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">City</span>
        <input value={draft.city} onChange={(e) => set("city", e.target.value)} className={inputClass} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Source</span>
          <input value={draft.source} onChange={(e) => set("source", e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Product</span>
          <input value={draft.product} onChange={(e) => set("product", e.target.value)} className={inputClass} />
        </label>
      </div>
      <label className="block">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Notes</span>
        <textarea value={draft.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-line bg-card px-3 py-2 text-base md:text-sm outline-none focus:border-navy" />
      </label>
      <button type="submit" className="h-12 rounded-md bg-navy text-sm font-semibold text-card">{submitLabel}</button>
    </form>
  );
}
