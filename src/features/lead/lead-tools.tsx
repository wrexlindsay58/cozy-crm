import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { addWorkflow, createTag, createWorkflow, stopWorkflow, toggleLeadTag, useOps } from "@/features/ops/store";
import type { Lead } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { DndPick } from "./dnd-pick";

export function LeadTools({ lead }: { lead: Lead }) {
  const tags = lead.tags ?? [];
  const flows = lead.workflows ?? [];
  const { tagPool, flowPool } = useOps();
  const [tagDraft, setTagDraft] = useState("");
  const [flowDraft, setFlowDraft] = useState("");

  return (
    <section className="rounded-md border border-line bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">DND</h2>
        <DndPick lead={lead} />
      </div>

      <h2 className="mt-4 text-[11px] font-bold tracking-wide text-muted uppercase">Tags</h2>
      <div className="mt-2 flex flex-wrap gap-2">
        {tagPool.map((t) => (
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
      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          createTag(lead.id, tagDraft);
          setTagDraft("");
        }}
      >
        <input
          value={tagDraft}
          onChange={(e) => setTagDraft(e.target.value)}
          placeholder="New tag"
          className="h-11 min-w-0 flex-1 rounded-md border border-line px-3 text-sm outline-none focus:border-navy"
        />
        <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">
          Add tag
        </button>
      </form>

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
      <div className="relative mt-2">
        <select
          className="h-11 w-full appearance-none rounded-md border border-line bg-card px-3 pr-10 text-sm"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) addWorkflow(lead.id, e.target.value);
            e.target.value = "";
          }}
        >
          <option value="">Add to workflow</option>
          {flowPool.filter((w) => !flows.includes(w)).map((w) => (
            <option key={w}>{w}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" />
      </div>
      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          createWorkflow(lead.id, flowDraft);
          setFlowDraft("");
        }}
      >
        <input
          value={flowDraft}
          onChange={(e) => setFlowDraft(e.target.value)}
          placeholder="New workflow"
          className="h-11 min-w-0 flex-1 rounded-md border border-line px-3 text-sm outline-none focus:border-navy"
        />
        <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">
          Start
        </button>
      </form>
    </section>
  );
}
