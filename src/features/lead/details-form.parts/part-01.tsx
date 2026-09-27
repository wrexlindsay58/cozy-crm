import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { LeadDraft } from "@/features/ops/store";
import { namesIn, useStaff } from "@/features/staff/store";
import { inferInterests, interestsLabel } from "../interests";
import { cn } from "@/lib/cn";
import { DetailsFormView9 } from "./part-02";

const labelClass = "type-label";

export const inputClass = "mt-1.5 h-11 w-full rounded-md border border-line bg-card px-3 text-base md:text-sm outline-none focus:border-navy";

export const selectClass = `${inputClass} appearance-none pr-10`;

export function DetailsForm({
  initial,
  submitLabel,
  onSubmit,
  readOnly = false,
}: {
  initial?: Partial<LeadDraft>;
  submitLabel: string;
  onSubmit: (draft: LeadDraft) => void;
  readOnly?: boolean;
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
      className="grid gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (readOnly) return;
        onSubmit(draft);
      }}
    >
      <DetailsFormView2 bag={{ readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox }} />
      <button type="submit" className={cn("h-12 rounded-md bg-navy text-sm font-semibold text-card", readOnly && "hidden")}>
        {submitLabel}
      </button>
    </form>
  );
}

export function Pick({
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
      <span className="type-label">{label}</span>
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

function DetailsFormView2(props: { bag: { readOnly: any; draft: any; set: any; secondOpen: any; setSecondOpen: any; setters: any; closers: any; sources: any; intOpen: any; setIntBox: any; setIntOpen: any; picked: any; interestText: any; intBox: any } }) {
  const { readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox } = props.bag;
  return (
    <DetailsFormView3 bag={{ readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox }} />
  );
}

function DetailsFormView3(props: { bag: { readOnly: any; draft: any; set: any; secondOpen: any; setSecondOpen: any; setters: any; closers: any; sources: any; intOpen: any; setIntBox: any; setIntOpen: any; picked: any; interestText: any; intBox: any } }) {
  const { readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox } = props.bag;
  return (
    <DetailsFormView4 bag={{ readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox }} />
  );
}

function DetailsFormView4(props: { bag: { readOnly: any; draft: any; set: any; secondOpen: any; setSecondOpen: any; setters: any; closers: any; sources: any; intOpen: any; setIntBox: any; setIntOpen: any; picked: any; interestText: any; intBox: any } }) {
  const { readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox } = props.bag;
  return (
    <DetailsFormView5 bag={{ readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox }} />
  );
}

function DetailsFormView5(props: { bag: { readOnly: any; draft: any; set: any; secondOpen: any; setSecondOpen: any; setters: any; closers: any; sources: any; intOpen: any; setIntBox: any; setIntOpen: any; picked: any; interestText: any; intBox: any } }) {
  const { readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox } = props.bag;
  return (
    <DetailsFormView6 bag={{ readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox }} />
  );
}

function DetailsFormView6(props: { bag: { readOnly: any; draft: any; set: any; secondOpen: any; setSecondOpen: any; setters: any; closers: any; sources: any; intOpen: any; setIntBox: any; setIntOpen: any; picked: any; interestText: any; intBox: any } }) {
  const { readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox } = props.bag;
  return (
    <DetailsFormView7 bag={{ readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox }} />
  );
}

function DetailsFormView7(props: { bag: { readOnly: any; draft: any; set: any; secondOpen: any; setSecondOpen: any; setters: any; closers: any; sources: any; intOpen: any; setIntBox: any; setIntOpen: any; picked: any; interestText: any; intBox: any } }) {
  const { readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox } = props.bag;
  return (
    <DetailsFormView8 bag={{ readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox }} />
  );
}

function DetailsFormView8(props: { bag: { readOnly: any; draft: any; set: any; secondOpen: any; setSecondOpen: any; setters: any; closers: any; sources: any; intOpen: any; setIntBox: any; setIntOpen: any; picked: any; interestText: any; intBox: any } }) {
  const { readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox } = props.bag;
  return (
    <DetailsFormView9 bag={{ readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox }} />
  );
}
