import { Check, ChevronDown } from "lucide-react";
import { Float } from "@/components/float";
import { INTEREST_OPTIONS, toggleInterest } from "../interests";
import { cn } from "@/lib/cn";
import { inputClass } from "./part-01";
import { DetailsFormView22 } from "./part-03";

export function DetailsFormView(props: { bag: { intOpen: any; setIntBox: any; setIntOpen: any; picked: any; interestText: any; intBox: any; set: any; draft: any } }) {
  const { intOpen, setIntBox, setIntOpen, picked, interestText, intBox, set, draft } = props.bag;
  return (
    <div>
        <p className="type-label">Main interests</p>
        <div className="relative mt-1">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={intOpen}
            onClick={(e) => {
              setIntBox(e.currentTarget.getBoundingClientRect());
              setIntOpen((v: any) => !v);
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
            <span className="type-label">Other</span>
            <input value={draft.otherInterest} onChange={(e) => set("otherInterest", e.target.value)} className={inputClass} />
          </label>
        ) : null}
      </div>
  );
}

export function DetailsFormView9(props: { bag: { readOnly: any; draft: any; set: any; secondOpen: any; setSecondOpen: any; setters: any; closers: any; sources: any; intOpen: any; setIntBox: any; setIntOpen: any; picked: any; interestText: any; intBox: any } }) {
  const { readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox } = props.bag;
  return (
    <DetailsFormView10 bag={{ readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox }} />
  );
}

function DetailsFormView10(props: { bag: { readOnly: any; draft: any; set: any; secondOpen: any; setSecondOpen: any; setters: any; closers: any; sources: any; intOpen: any; setIntBox: any; setIntOpen: any; picked: any; interestText: any; intBox: any } }) {
  const { readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox } = props.bag;
  return (
    <DetailsFormView11 bag={{ readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox }} />
  );
}

function DetailsFormView11(props: { bag: { readOnly: any; draft: any; set: any; secondOpen: any; setSecondOpen: any; setters: any; closers: any; sources: any; intOpen: any; setIntBox: any; setIntOpen: any; picked: any; interestText: any; intBox: any } }) {
  const { readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox } = props.bag;
  return (
    <DetailsFormView12 bag={{ readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox }} />
  );
}

function DetailsFormView12(props: { bag: { readOnly: any; draft: any; set: any; secondOpen: any; setSecondOpen: any; setters: any; closers: any; sources: any; intOpen: any; setIntBox: any; setIntOpen: any; picked: any; interestText: any; intBox: any } }) {
  const { readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox } = props.bag;
  return (
    <DetailsFormView13 bag={{ readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox }} />
  );
}

function DetailsFormView13(props: { bag: { readOnly: any; draft: any; set: any; secondOpen: any; setSecondOpen: any; setters: any; closers: any; sources: any; intOpen: any; setIntBox: any; setIntOpen: any; picked: any; interestText: any; intBox: any } }) {
  const { readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox } = props.bag;
  return (
    <DetailsFormView14 bag={{ readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox }} />
  );
}

function DetailsFormView14(props: { bag: { readOnly: any; draft: any; set: any; secondOpen: any; setSecondOpen: any; setters: any; closers: any; sources: any; intOpen: any; setIntBox: any; setIntOpen: any; picked: any; interestText: any; intBox: any } }) {
  const { readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox } = props.bag;
  return (
    <DetailsFormView15 bag={{ readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox }} />
  );
}

function DetailsFormView15(props: { bag: { readOnly: any; draft: any; set: any; secondOpen: any; setSecondOpen: any; setters: any; closers: any; sources: any; intOpen: any; setIntBox: any; setIntOpen: any; picked: any; interestText: any; intBox: any } }) {
  const { readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox } = props.bag;
  return (
    <DetailsFormView16 bag={{ readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox }} />
  );
}

function DetailsFormView16(props: { bag: { readOnly: any; draft: any; set: any; secondOpen: any; setSecondOpen: any; setters: any; closers: any; sources: any; intOpen: any; setIntBox: any; setIntOpen: any; picked: any; interestText: any; intBox: any } }) {
  const { readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox } = props.bag;
  return (
    <DetailsFormView17 bag={{ readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox }} />
  );
}

function DetailsFormView17(props: { bag: { readOnly: any; draft: any; set: any; secondOpen: any; setSecondOpen: any; setters: any; closers: any; sources: any; intOpen: any; setIntBox: any; setIntOpen: any; picked: any; interestText: any; intBox: any } }) {
  const { readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox } = props.bag;
  return (
    <DetailsFormView18 bag={{ readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox }} />
  );
}

function DetailsFormView18(props: { bag: { readOnly: any; draft: any; set: any; secondOpen: any; setSecondOpen: any; setters: any; closers: any; sources: any; intOpen: any; setIntBox: any; setIntOpen: any; picked: any; interestText: any; intBox: any } }) {
  const { readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox } = props.bag;
  return (
    <DetailsFormView19 bag={{ readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox }} />
  );
}

function DetailsFormView19(props: { bag: { readOnly: any; draft: any; set: any; secondOpen: any; setSecondOpen: any; setters: any; closers: any; sources: any; intOpen: any; setIntBox: any; setIntOpen: any; picked: any; interestText: any; intBox: any } }) {
  const { readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox } = props.bag;
  return (
    <DetailsFormView20 bag={{ readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox }} />
  );
}

function DetailsFormView20(props: { bag: { readOnly: any; draft: any; set: any; secondOpen: any; setSecondOpen: any; setters: any; closers: any; sources: any; intOpen: any; setIntBox: any; setIntOpen: any; picked: any; interestText: any; intBox: any } }) {
  const { readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox } = props.bag;
  return (
    <DetailsFormView21 bag={{ readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox }} />
  );
}

function DetailsFormView21(props: { bag: { readOnly: any; draft: any; set: any; secondOpen: any; setSecondOpen: any; setters: any; closers: any; sources: any; intOpen: any; setIntBox: any; setIntOpen: any; picked: any; interestText: any; intBox: any } }) {
  const { readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox } = props.bag;
  return (
    <DetailsFormView22 bag={{ readOnly, draft, set, secondOpen, setSecondOpen, setters, closers, sources, intOpen, setIntBox, setIntOpen, picked, interestText, intBox }} />
  );
}
