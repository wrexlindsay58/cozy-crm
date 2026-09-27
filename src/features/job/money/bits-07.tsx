import { PAY, pct } from "./bits-01";
import { useState } from "react";
import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { money } from "@/lib/crm-data";
import type { Tone } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { Float } from "@/components/float";
import { stageWash } from "@/lib/lead-status";

export function Line({
  label,
  value,
  of,
  tone,
  alert,
}: {
  label: string;
  value: number;
  of: number;
  tone?: "cost";
  alert?: boolean;
}) {
  const red = tone === "cost" || alert;
  return (
    <div className="flex min-w-0 items-baseline gap-2 py-1 text-[13px]">
      <span className={cn("min-w-0 flex-1 truncate", red && "text-alert")}>{label}</span>
      <span className={cn("w-10 shrink-0 text-right text-[11px] font-semibold", red ? "text-alert/70" : "text-muted")}>{pct(value, of)}</span>
      <span className={cn("min-w-[5.5rem] shrink-0 text-right font-semibold tabular-nums", red ? "text-alert" : "text-ink")}>{money(value)}</span>
    </div>
  );
}

export function payTone(s: string): Tone {
  if (s === "Paid") return "up";
  if (s === "Past due" || s === "NSF" || s === "Card declined") return "alert";
  if (s === "Void" || s === "Refunded" || s === "Draft") return "muted";
  return "navy";
}

export function PayPill({ value, onChange }: { value: (typeof PAY)[number]; onChange: (s: (typeof PAY)[number]) => void }) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Invoice status"
        onClick={(e) => {
          setAnchor(e.currentTarget.getBoundingClientRect());
          setOpen((v) => !v);
        }}
        className={cn("inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-[11px] font-bold tracking-wide uppercase", stageWash(payTone(value)))}
      >
        {value}
        <ChevronDown className="size-3" />
      </button>
      {open && anchor ? (
        <Float anchor={anchor} prefer="bottom" onClose={() => setOpen(false)}>
          {PAY.map((s) => (
            <button
              key={s}
              type="button"
              className={cn("block w-full min-w-44 px-3 py-2 text-left text-sm hover:bg-page", s === value && "font-semibold")}
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
            >
              <span className={cn("mr-2 inline-block size-2 rounded-full", stageWash(payTone(s)))} />
              {s}
            </button>
          ))}
        </Float>
      ) : null}
    </div>
  );
}

export function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold tracking-wide text-muted uppercase">{k}</dt>
      <dd className="mt-0.5 font-semibold tabular-nums">{v}</dd>
    </div>
  );
}

export function SelectPick({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={cn("relative block", className)}>
      <select {...props} className="h-10 w-full appearance-none rounded-md border border-line bg-card py-0 pr-9 pl-2 text-sm outline-none focus:border-navy">
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted" />
    </span>
  );
}
