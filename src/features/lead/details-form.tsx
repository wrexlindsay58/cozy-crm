import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { LeadDraft } from "@/features/ops/store";
import { namesIn, OFFICES, useStaff } from "@/features/staff/store";
import { Float } from "@/components/float";
import { INTEREST_OPTIONS, inferInterests, interestsLabel, toggleInterest } from "./interests";
import { cn } from "@/lib/cn";

const inputClass = "mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-base md:text-sm outline-none focus:border-navy";
const selectClass = `${inputClass} appearance-none pr-10`;

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
  const setters = namesIn("Setter", "Owner");
  const closers = namesIn("Closer", "Owner");
  const [draft, setDraft] = useState<LeadDraft>({
    name: initial?.name ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    address: initial?.address ?? "",
    city: initial?.city ?? "",
    source: initial?.source ?? "Canvass",
    notes: initial?.notes ?? "",
    office: initial?.office ?? "Phoenix",
    setter: initial?.setter ?? setters[0] ?? "",
    closer: initial?.closer ?? closers[0] ?? "",
    interests: initial?.interests ?? inferInterests(initial?.product ?? ""),
    otherInterest: initial?.otherInterest ?? "",
    secondaryName: initial?.secondaryName ?? "",
    secondaryPhone: initial?.secondaryPhone ?? "",
    secondaryEmail: initial?.secondaryEmail ?? "",
    referrerName: initial?.referrerName ?? "",
    referrerPhone: initial?.referrerPhone ?? "",
    pain: initial?.pain ?? "",
    hotRooms: initial?.hotRooms ?? "",
    coldRooms: initial?.coldRooms ?? "",
  });
  const [secondOpen, setSecondOpen] = useState(Boolean(initial?.secondaryName));
  const [intOpen, setIntOpen] = useState(false);
  const [intBox, setIntBox] = useState<DOMRect | null>(null);
  function set<K extends keyof LeadDraft>(key: K, value: LeadDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  const picked = draft.interests ?? [];
  const interestText = picked.length ? interestsLabel(picked, draft.otherInterest) || picked.join(", ") : "Pick interests";
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
        <button type="button" className="h-11 rounded-md border border-navy text-sm font-semibold text-navy hover:bg-info-bg" onClick={() => setSecondOpen(true)}>
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

      <div className="grid gap-3 sm:grid-cols-2">
        <Pick label="Office" value={draft.office ?? ""} onChange={(v) => set("office", v)} options={OFFICES} />
        <Pick label="Setter" value={draft.setter ?? ""} onChange={(v) => set("setter", v)} options={setters} />
      </div>
      <Pick label="Closer" value={draft.closer ?? ""} onChange={(v) => set("closer", v)} options={closers} />

      <label className="relative block">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Lead source</span>
        <select value={draft.source} onChange={(e) => set("source", e.target.value)} className={selectClass}>
          {sources.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 bottom-3.5 size-4 text-muted" />
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

      <div>
        <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Main interests</p>
        <div className="relative mt-1">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={intOpen}
            onClick={(e) => {
              setIntBox(e.currentTarget.getBoundingClientRect());
              setIntOpen((v) => !v);
            }}
            className="flex h-11 w-full items-center rounded-md border border-line bg-card px-3 pr-10 text-left text-sm outline-none focus:border-navy"
          >
            <span className={cn("min-w-0 truncate", picked.length ? "text-ink" : "text-muted")}>{interestText}</span>
          </button>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" />
        </div>
        {intOpen && intBox ? (
          <Float anchor={intBox} prefer="bottom" onClose={() => setIntOpen(false)}>
            {INTEREST_OPTIONS.map((opt) => {
              const on = picked.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  role="option"
                  aria-selected={on}
                  className="flex w-full min-w-56 items-center gap-2 px-3 py-2 text-left text-sm hover:bg-page"
                  onClick={() => set("interests", toggleInterest(picked, opt))}
                >
                  <span className={cn("inline-flex size-4 shrink-0 items-center justify-center rounded-sm border", on ? "border-navy bg-navy text-card" : "border-line")}>
                    {on ? <Check className="size-3" strokeWidth={3} /> : null}
                  </span>
                  {opt}
                </button>
              );
            })}
          </Float>
        ) : null}
        {picked.includes("Other") ? (
          <label className="mt-3 block">
            <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Other</span>
            <input value={draft.otherInterest} onChange={(e) => set("otherInterest", e.target.value)} className={inputClass} />
          </label>
        ) : null}
      </div>

      <label className="block">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Why they're looking</span>
        <textarea
          value={draft.pain ?? ""}
          onChange={(e) => set("pain", e.target.value)}
          rows={3}
          placeholder="Hot rooms, high bill, ice dams, AC short-cycling…"
          className="mt-1 w-full rounded-md border border-line bg-card px-3 py-2 text-base md:text-sm outline-none focus:border-navy"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Hot rooms they named</span>
          <input value={draft.hotRooms ?? ""} onChange={(e) => set("hotRooms", e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Cold rooms they named</span>
          <input value={draft.coldRooms ?? ""} onChange={(e) => set("coldRooms", e.target.value)} className={inputClass} />
        </label>
      </div>

      <label className="block">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Homeowner notes</span>
        <textarea value={draft.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-line bg-card px-3 py-2 text-base md:text-sm outline-none focus:border-navy" />
      </label>
      <button type="submit" className="h-12 rounded-md bg-navy text-sm font-semibold text-card">
        {submitLabel}
      </button>
    </form>
  );
}

function Pick({
  label,
  value,
  onChange,
  options,
  blank,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  blank?: string;
}) {
  return (
    <label className="relative block">
      <span className="text-[11px] font-bold tracking-wide text-muted uppercase">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        {blank ? <option value="">{blank}</option> : null}
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 bottom-3.5 size-4 text-muted" />
    </label>
  );
}