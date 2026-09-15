import { useState } from "react";
import { addWorkflow, dndOn, stopWorkflow, toggleLeadDnd, toggleLeadTag } from "@/features/ops/store";
import type { DndChannel, Lead } from "@/lib/crm-data";
import { cn } from "@/lib/cn";

const TAGS = ["HOA", "Rebate", "Renter", "Spanish", "Veteran", "Callback", "Air seal"];
const WORKFLOWS = ["New lead drip", "No-sit follow-up", "Ran, no decision", "Review ask"];
const DND_ROWS: { id: DndChannel | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "text", label: "Text" },
  { id: "call", label: "Call" },
  { id: "email", label: "Email" },
];

function dndLabel(lead: Lead) {
  const d = lead.dnd ?? [];
  if (d.length === 0) return "DND off";
  if (d.length === 3) return "DND all";
  const names = d.map((c) => (c === "text" ? "text" : c === "call" ? "call" : "email"));
  return `DND ${names.join(", ")}`;
}

export function LeadTools({ lead }: { lead: Lead }) {
  const tags = lead.tags ?? [];
  const flows = lead.workflows ?? [];
  const [dndOpen, setDndOpen] = useState(false);
  const allOn = (lead.dnd ?? []).length === 3;
  const hot = (lead.dnd ?? []).length > 0;

  return (
    <section className="rounded-md border border-line bg-card p-4">
      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">DND</h2>
        <button
          type="button"
          className={cn("h-11 min-w-36 rounded-md px-3 text-sm font-semibold", hot ? "bg-stop text-card" : "border border-line")}
          aria-expanded={dndOpen}
          onClick={() => setDndOpen((v) => !v)}
        >
          {dndLabel(lead)}
        </button>
        {dndOpen ? (
          <div className="absolute top-12 right-0 z-20 min-w-44 rounded-md border border-line bg-card py-1 shadow-sm">
            {DND_ROWS.map((row) => {
              const on = row.id === "all" ? allOn : dndOn(lead, row.id);
              return (
                <button
                  key={row.id}
                  type="button"
                  className="flex h-11 w-full items-center justify-between px-3 text-sm hover:bg-page"
                  onClick={() => toggleLeadDnd(lead.id, row.id)}
                >
                  <span>DND {row.label}</span>
                  <span className={cn("text-[11px] font-bold", on ? "text-navy" : "text-muted")}>{on ? "On" : "Off"}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <h2 className="mt-4 text-[11px] font-bold tracking-wide text-muted uppercase">Tags</h2>
      <div className="mt-2 flex flex-wrap gap-2">
        {TAGS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => toggleLeadTag(lead.id, t)}
            className={cn("h-10 rounded-md px-3 text-sm font-semibold", tags.includes(t) ? "bg-navy text-card" : "border border-line")}
          >
            {t}
          </button>
        ))}
      </div>

      <h2 className="mt-4 text-[11px] font-bold tracking-wide text-muted uppercase">Workflows</h2>
      <ul className="mt-2 space-y-1">
        {flows.map((w) => (
          <li key={w} className="flex items-center justify-between gap-2 text-sm">
            <span>{w}</span>
            <button type="button" className="h-10 px-2 text-sm font-semibold text-muted" onClick={() => stopWorkflow(lead.id, w)}>
              Stop
            </button>
          </li>
        ))}
      </ul>
      <select
        className="mt-2 h-11 w-full rounded-md border border-line bg-card px-3 text-sm"
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) addWorkflow(lead.id, e.target.value);
          e.target.value = "";
        }}
      >
        <option value="">Add to workflow</option>
        {WORKFLOWS.filter((w) => !flows.includes(w)).map((w) => (
          <option key={w}>{w}</option>
        ))}
      </select>
    </section>
  );
}
