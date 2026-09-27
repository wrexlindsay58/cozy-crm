import { Extra } from "./bits-04";
import { useState } from "react";
import { ChevronDown, ListFilter, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { LEAD_STATUSES } from "@/lib/lead-status";
import { Float } from "@/components/float";
import { Tip } from "@/components/tip";

export function ExtraPick({ value, onChange }: { value: Extra; onChange: (v: Extra) => void }) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const hot = value.dnd || value.booked || value.actions || Boolean(value.status);
  const rows: { key: keyof Extra; label: string; on: boolean }[] = [
    { key: "dnd", label: "DND on", on: value.dnd },
    { key: "booked", label: "Has a book", on: value.booked },
    { key: "actions", label: "Open actions", on: value.actions },
  ];
  return (
    <>
      <Tip label="Filters" on side="bottom" className="min-w-0 flex-1">
        <button
          type="button"
          aria-label="Filters"
          aria-expanded={open}
          onClick={(e) => {
            setAnchor(e.currentTarget.getBoundingClientRect());
            setOpen((v) => !v);
          }}
          className={cn("inline-flex h-8 w-full min-w-0 items-center justify-center gap-1 rounded-md px-1", hot ? "bg-navy text-card" : "text-muted hover:bg-page")}
        >
          <ListFilter className="size-3.5 shrink-0" />
          <span className="hidden min-w-0 truncate text-[11px] font-semibold @min-[30rem]:inline">More</span>
          <ChevronDown className="size-3 shrink-0 opacity-70" />
        </button>
      </Tip>
      {open && anchor ? (
        <Float anchor={anchor} prefer="bottom" onClose={() => setOpen(false)}>
          {rows.map((row) => (
            <button
              key={row.key}
              type="button"
              className="flex h-10 w-full min-w-48 items-center justify-between gap-2 px-3 text-sm hover:bg-page"
              onClick={() => onChange({ ...value, [row.key]: !value[row.key] })}
            >
              <span>{row.label}</span>
              <span className={cn("text-[11px] font-bold", row.on ? "text-navy" : "text-muted")}>{row.on ? "On" : "Off"}</span>
            </button>
          ))}
          <p className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-wide text-muted uppercase">Status</p>
          <button
            type="button"
            className="flex h-10 w-full items-center justify-between px-3 text-sm hover:bg-page"
            onClick={() => onChange({ ...value, status: "" })}
          >
            Any
            {!value.status ? <span className="text-[11px] font-bold text-navy">On</span> : null}
          </button>
          {LEAD_STATUSES.map((s) => (
            <button
              key={s.label}
              type="button"
              className="flex h-10 w-full items-center justify-between px-3 text-sm hover:bg-page"
              onClick={() => onChange({ ...value, status: value.status === s.label ? "" : s.label })}
            >
              {s.label}
              {value.status === s.label ? <span className="text-[11px] font-bold text-navy">On</span> : null}
            </button>
          ))}
        </Float>
      ) : null}
    </>
  );
}

export function IconChip({
  label,
  face,
  icon: Icon,
  on,
  onClick,
  filled,
}: {
  label: string;
  face?: string;
  icon: typeof Star;
  on: boolean;
  onClick: () => void;
  filled?: boolean;
}) {
  return (
    <Tip label={label} on side="bottom" className="min-w-0 flex-1">
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className={cn("inline-flex h-8 w-full min-w-0 items-center justify-center gap-1 rounded-md px-1", on ? "bg-navy text-card" : "text-muted hover:bg-page")}
      >
        <Icon className={cn("size-3.5 shrink-0", filled && "fill-current")} />
        <span className="hidden min-w-0 truncate text-[11px] font-semibold @min-[30rem]:inline">{face ?? label}</span>
      </button>
    </Tip>
  );
}
