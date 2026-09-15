import { useState } from "react";
import type { LeadDraft } from "@/features/ops/store";
import { useStaff } from "@/features/staff/store";
import { INTEREST_OPTIONS, inferInterests, toggleInterest } from "./interests";
import { cn } from "@/lib/cn";

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
  const { sources } = useStaff();
  const [draft, setDraft] = useState<LeadDraft>({
    name: initial?.name ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    address: initial?.address ?? "",
    city: initial?.city ?? "",
    source: initial?.source ?? "Canvass",
    notes: initial?.notes ?? "",
    interests: initial?.interests ?? inferInterests(initial?.product ?? ""),
    otherInterest: initial?.otherInterest ?? "",
    secondaryName: initial?.secondaryName ?? "",
    secondaryPhone: initial?.secondaryPhone ?? "",
    secondaryEmail: initial?.secondaryEmail ?? "",
    referrerName: initial?.referrerName ?? "",
    referrerPhone: initial?.referrerPhone ?? "",
  });
  const [secondOpen, setSecondOpen] = useState(Boolean(initial?.secondaryName));
  function set<K extends keyof LeadDraft>(key: K, value: LeadDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(draft);
      }}
    >
      <label className="block">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Name</span>
        <input required autoComplete="name" value={draft.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
      </label>
      <label className="block">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Phone</span>
        <input required type="tel" inputMode="tel" autoComplete="tel" value={draft.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
      </label>
      <label className="block">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Email</span>
        <input type="email" autoComplete="email" value={draft.email} onChange={(e) => set("email", e.target.value)} className={inputClass} />
      </label>

      {secondOpen ? (
        <fieldset className="grid gap-3 rounded-md border border-line p-3">
          <legend className="px-1 text-[11px] font-bold tracking-wide text-muted uppercase">Second homeowner</legend>
          <label className="block">
            <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Name</span>
            <input value={draft.secondaryName} onChange={(e) => set("secondaryName", e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Phone</span>
            <input type="tel" inputMode="tel" value={draft.secondaryPhone} onChange={(e) => set("secondaryPhone", e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Email</span>
            <input type="email" value={draft.secondaryEmail} onChange={(e) => set("secondaryEmail", e.target.value)} className={inputClass} />
          </label>
        </fieldset>
      ) : (
        <button type="button" className="h-11 rounded-md border border-line text-sm font-semibold" onClick={() => setSecondOpen(true)}>
          Add homeowner
        </button>
      )}

      <label className="block">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Address</span>
        <input value={draft.address} onChange={(e) => set("address", e.target.value)} className={inputClass} />
      </label>
      <label className="block">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">City</span>
        <input value={draft.city} onChange={(e) => set("city", e.target.value)} className={inputClass} />
      </label>
      <label className="block">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Lead source</span>
        <select value={draft.source} onChange={(e) => set("source", e.target.value)} className={inputClass}>
          {sources.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      {draft.source === "Referral" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Referrer name</span>
            <input value={draft.referrerName} onChange={(e) => set("referrerName", e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Referrer phone</span>
            <input type="tel" inputMode="tel" value={draft.referrerPhone} onChange={(e) => set("referrerPhone", e.target.value)} className={inputClass} />
          </label>
        </div>
      ) : null}

      <fieldset>
        <legend className="text-[11px] font-bold tracking-wide text-muted uppercase">Main interests</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((opt) => {
            const on = (draft.interests ?? []).includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => set("interests", toggleInterest(draft.interests ?? [], opt))}
                className={cn("h-11 rounded-md px-3 text-sm font-semibold", on ? "bg-navy text-card" : "border border-line")}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {(draft.interests ?? []).includes("Other") ? (
          <label className="mt-3 block">
            <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Other</span>
            <input value={draft.otherInterest} onChange={(e) => set("otherInterest", e.target.value)} className={inputClass} />
          </label>
        ) : null}
      </fieldset>

      <label className="block">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Notes</span>
        <textarea value={draft.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-line bg-card px-3 py-2 text-base md:text-sm outline-none focus:border-navy" />
      </label>
      <button type="submit" className="h-12 rounded-md bg-navy text-sm font-semibold text-card">
        {submitLabel}
      </button>
    </form>
  );
}
