import { useState } from "react";
import { Initials } from "@/features/record-shell/people-row";
import { Float } from "@/components/float";
import { Tip } from "@/components/tip";
import { cn } from "@/lib/cn";

export function ViewDesc({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  return (
    <>
      <button
        type="button"
        className={cn(
          "inline-flex h-11 shrink-0 items-center rounded-md px-2 text-[13px] font-semibold text-navy underline decoration-navy/50 underline-offset-[3px]",
          "hover:bg-page hover:decoration-navy",
          open && "bg-page decoration-navy",
        )}
        onClick={(e) => {
          setAnchor(e.currentTarget.getBoundingClientRect());
          setOpen((v) => !v);
        }}
      >
        View description
      </button>
      {open && anchor ? (
        <Float anchor={anchor} prefer="bottom" onClose={() => setOpen(false)}>
          <p className="max-w-[24rem] min-w-[16rem] px-3 py-2.5 text-[13px] font-medium leading-6">{text}</p>
        </Float>
      ) : null}
    </>
  );
}

export function PersonMark({ label, name }: { label: string; name: string }) {
  if (!name) return null;
  return (
    <div className="shrink-0">
      <p className="text-[10px] font-bold tracking-wide text-muted uppercase">{label}</p>
      <Tip label={name} on>
        <span className="mt-0.5 inline-flex shrink-0" aria-label={`${label} ${name}`}>
          <Initials name={name} />
        </span>
      </Tip>
    </div>
  );
}

export function ActionPeople({ owner, assigned, following }: { owner: string; assigned: string; following: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap items-start gap-x-6 gap-y-2">
      <PersonMark label="Owner" name={owner} />
      <PersonMark label="Assigned" name={assigned} />
      <div className="ml-auto min-w-0">
        <p className="text-right text-[10px] font-bold tracking-wide text-muted uppercase">Followers</p>
        <div className="mt-0.5 flex min-w-0 items-center justify-end gap-1.5">
          {following.length === 0 ? <p className="text-sm text-muted">None</p> : null}
          {following.map((name) => (
            <Tip key={name} label={name} on>
              <span className="shrink-0" aria-label={name}>
                <Initials name={name} />
              </span>
            </Tip>
          ))}
        </div>
      </div>
    </div>
  );
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

export function dueMs(due?: string) {
  if (!due) return Number.POSITIVE_INFINITY;
  const m = due.match(/([A-Za-z]{3})\s+(\d{1,2})/);
  if (!m) return Number.POSITIVE_INFINITY;
  const month = MONTHS[m[1]];
  if (month == null) return Number.POSITIVE_INFINITY;
  return new Date(new Date().getFullYear(), month, Number(m[2])).getTime();
}
