import { addWorkflow, setLeadDnc, stopWorkflow, toggleLeadTag } from "@/features/ops/store";
import type { Lead } from "@/lib/crm-data";
import { cn } from "@/lib/cn";

const TAGS = ["HOA", "Rebate", "Renter", "Spanish", "Veteran", "Callback", "Air seal"];
const WORKFLOWS = ["New lead drip", "No-sit follow-up", "Ran, no decision", "Review ask"];

export function LeadTools({ lead }: { lead: Lead }) {
  const tags = lead.tags ?? [];
  const flows = lead.workflows ?? [];
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Tags</h2>
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
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">Do not contact</p>
        <button
          type="button"
          onClick={() => setLeadDnc(lead.id, !lead.dnc)}
          className={cn("h-10 rounded-md px-3 text-sm font-semibold", lead.dnc ? "bg-stop text-card" : "border border-line")}
        >
          {lead.dnc ? "DNC on" : "DNC off"}
        </button>
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
