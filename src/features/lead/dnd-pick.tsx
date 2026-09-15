import { useState } from "react";
import { Float } from "@/components/float";
import { dndOn, toggleLeadDnd } from "@/features/ops/store";
import type { DndChannel, Lead } from "@/lib/crm-data";
import { cn } from "@/lib/cn";

const DND_ROWS: { id: DndChannel | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "text", label: "Text" },
  { id: "call", label: "Call" },
  { id: "email", label: "Email" },
];

export function dndLabel(lead: { dnd?: DndChannel[] }) {
  const d = lead.dnd ?? [];
  if (d.length === 0) return "DND off";
  if (d.length === 3) return "DND all";
  return `DND ${d.join(", ")}`;
}

export function DndPick({
  lead,
  compact,
}: {
  lead: Lead;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const allOn = (lead.dnd ?? []).length === 3;
  const hot = (lead.dnd ?? []).length > 0;

  return (
    <>
      <button
        type="button"
        aria-label="DND"
        aria-expanded={open}
        onClick={(e) => {
          setAnchor(e.currentTarget.getBoundingClientRect());
          setOpen((v) => !v);
        }}
        className={
          compact
            ? cn(
                "inline-flex h-7 shrink-0 items-center rounded-md px-2 text-[11px] font-bold tracking-wide uppercase",
                hot ? "bg-alert-bg text-alert" : "bg-page text-muted",
              )
            : cn("h-11 min-w-36 rounded-md px-3 text-sm font-semibold", hot ? "bg-stop text-card" : "border border-line")
        }
      >
        {dndLabel(lead)}
      </button>
      {open && anchor ? (
        <Float anchor={anchor} prefer="bottom" onClose={() => setOpen(false)}>
          {DND_ROWS.map((row) => {
            const on = row.id === "all" ? allOn : dndOn(lead, row.id);
            return (
              <button
                key={row.id}
                type="button"
                className="flex h-11 w-full min-w-44 items-center justify-between px-3 text-sm hover:bg-page"
                onClick={() => toggleLeadDnd(lead.id, row.id)}
              >
                <span>DND {row.label}</span>
                <span className={cn("text-[11px] font-bold", on ? "text-navy" : "text-muted")}>{on ? "On" : "Off"}</span>
              </button>
            );
          })}
        </Float>
      ) : null}
    </>
  );
}
