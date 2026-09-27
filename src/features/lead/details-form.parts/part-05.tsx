import { ChevronDown } from "lucide-react";
import { OFFICES } from "@/features/staff/store";
import { inputClass, selectClass, Pick } from "./part-01";
import { DetailsFormView } from "./part-02";

export function DetailsFormView60(props: { bag: { readOnly: any; draft: any; set: any; secondOpen: any; setSecondOpen: any; setters: any; closers: any; sources: any; intOpen: any; setIntBox: any; setIntOpen: any; picked: any; interestText: any; intBox: any } }) {
  const { readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox } = props.bag;
  return (
    <fieldset disabled={readOnly} className="grid gap-5 border-0 p-0">
      <label className="block">
        <span className="type-label">Name</span>
        <input required autoComplete="name" value={draft.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
      </label>
      <label className="block">
        <span className="type-label">Phone</span>
        <input required type="tel" inputMode="tel" autoComplete="tel" value={draft.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
      </label>
      <label className="block">
        <span className="type-label">Email</span>
        <input type="email" autoComplete="email" value={draft.email} onChange={(e) => set("email", e.target.value)} className={inputClass} />
      </label>

      {secondOpen ? (
        <fieldset className="grid gap-4 rounded-md border border-line bg-page/40 p-4">
          <legend className="px-1 type-group">Second homeowner</legend>
          <label className="block">
            <span className="type-label">Name</span>
            <input value={draft.secondaryName} onChange={(e) => set("secondaryName", e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="type-label">Phone</span>
            <input type="tel" inputMode="tel" value={draft.secondaryPhone} onChange={(e) => set("secondaryPhone", e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="type-label">Email</span>
            <input type="email" value={draft.secondaryEmail} onChange={(e) => set("secondaryEmail", e.target.value)} className={inputClass} />
          </label>
        </fieldset>
      ) : (
        <button type="button" className="h-11 rounded-md border border-navy text-sm font-semibold text-navy hover:bg-info-bg" onClick={() => setSecondOpen(true)}>
          Add homeowner
        </button>
      )}

      <p className="border-t border-line pt-5 type-group">Address</p>
      <label className="block">
        <span className="type-label">Street</span>
        <input value={draft.address} onChange={(e) => set("address", e.target.value)} className={inputClass} />
      </label>
      <label className="block">
        <span className="type-label">City</span>
        <input value={draft.city} onChange={(e) => set("city", e.target.value)} className={inputClass} />
      </label>

      <p className="border-t border-line pt-5 type-group">How they came in</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Pick label="Office" value={draft.office ?? ""} onChange={(v) => set("office", v)} options={OFFICES} />
        <Pick label="Setter" value={draft.setter ?? ""} onChange={(v) => set("setter", v)} options={setters} />
      </div>
      <Pick label="Closer" value={draft.closer ?? ""} onChange={(v) => set("closer", v)} options={closers} />

      <label className="relative block">
        <span className="type-label">Lead source</span>
        <select value={draft.source} onChange={(e) => set("source", e.target.value)} className={selectClass}>
          {sources.map((s: any) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 bottom-3.5 size-4 text-muted" />
      </label>
      {draft.source === "Referral" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="type-label">Referrer name</span>
            <input value={draft.referrerName} onChange={(e) => set("referrerName", e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="type-label">Referrer phone</span>
            <input type="tel" inputMode="tel" value={draft.referrerPhone} onChange={(e) => set("referrerPhone", e.target.value)} className={inputClass} />
          </label>
        </div>
      ) : null}

      <DetailsFormView bag={{ intOpen, setIntBox, setIntOpen, picked, interestText, intBox, set, draft }} />

      <p className="border-t border-line pt-5 type-group">Why they're looking</p>
      <label className="block">
        <span className="type-label">Customer issues</span>
        <textarea
          value={draft.pain ?? ""}
          onChange={(e) => set("pain", e.target.value)}
          rows={3}
          placeholder="Hot rooms, high bill, ice dams, AC short-cycling…"
          className="mt-1 w-full rounded-md border border-line bg-card px-3 py-2 text-base md:text-sm outline-none focus:border-navy"
        />
      </label>

      <label className="block">
        <span className="type-label">Homeowner notes</span>
        <textarea value={draft.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-line bg-card px-3 py-2 text-base md:text-sm outline-none focus:border-navy" />
      </label>
      </fieldset>
  );
}
