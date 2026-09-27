import { useState } from "react";
import { Plus, Tag, Workflow } from "lucide-react";
import { Tip } from "@/components/tip";
import { addWorkflow, createTag, createWorkflow, stopWorkflow, toggleLeadTag, useOps } from "@/features/ops/store";
import type { Lead } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { MarksBarView } from "./part-02";

export function MarksBar({ lead, compact }: { lead: Lead; compact?: boolean }) {
  const tags = lead.tags ?? [];
  const flows = lead.workflows ?? [];
  const { tagPool, flowPool } = useOps();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const [flowDraft, setFlowDraft] = useState("");
  const shownTags = compact ? tags.slice(0, 2) : tags;
  const shownFlows = compact ? flows.slice(0, 1) : flows;
  const extra = tags.length - shownTags.length + flows.length - shownFlows.length;

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1">
      {shownTags.map((t) => (
        <button
          key={t}
          type="button"
          className="inline-flex h-7 max-w-[7rem] items-center gap-1 rounded-md bg-navy px-2 text-[11px] font-semibold text-card"
          onClick={() => toggleLeadTag(lead.id, t)}
          title="Remove tag"
        >
          <Tag className="size-3 shrink-0" />
          <span className="truncate">{t}</span>
        </button>
      ))}
      {shownFlows.map((w) => (
        <button
          key={w}
          type="button"
          className="inline-flex h-7 max-w-[8rem] items-center gap-1 rounded-md bg-info-bg px-2 text-[11px] font-semibold text-navy"
          onClick={() => stopWorkflow(lead.id, w)}
          title="Stop workflow"
        >
          <Workflow className="size-3 shrink-0" />
          <span className="truncate">{w}</span>
        </button>
      ))}
      {extra > 0 ? <span className="text-[11px] font-bold text-muted">+{extra}</span> : null}
      <Tip label="Tags and workflows" on side="bottom">
        <button
          type="button"
          aria-label="Tags and workflows"
          className="grid size-7 shrink-0 place-items-center rounded-md border border-line text-muted hover:text-navy"
          onClick={(e) => {
            setAnchor(e.currentTarget.getBoundingClientRect());
            setOpen((v) => !v);
          }}
        >
          <Plus className="size-3.5" />
        </button>
      </Tip>
      {open && anchor ? (
        <MarksBarView bag={{ anchor, setOpen, tagPool, tags, lead, tagDraft, setTagDraft, flows, flowPool, flowDraft, setFlowDraft }} />
      ) : null}
    </div>
  );
}

export function MarksPanel({ lead }: { lead: Lead }) {
  const tags = lead.tags ?? [];
  const flows = lead.workflows ?? [];
  const { tagPool, flowPool } = useOps();
  const [tagDraft, setTagDraft] = useState("");
  const [flowDraft, setFlowDraft] = useState("");

  return (
    <div className="h-full space-y-5 overflow-auto p-3">
      <section>
        <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Tags</h2>
        <p className="mt-1 text-[11px] text-muted">On the house. Tap to add or pull off.</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tagPool.map((t) => {
            const on = tags.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleLeadTag(lead.id, t)}
                className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", on ? "bg-navy text-card" : "border border-line")}
              >
                {t}
              </button>
            );
          })}
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            createTag(lead.id, tagDraft);
            setTagDraft("");
          }}
        >
          <input value={tagDraft} onChange={(e) => setTagDraft(e.target.value)} placeholder="New tag" className="h-11 min-w-0 flex-1 rounded-md border border-line px-3 text-sm outline-none focus:border-navy" />
          <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">Add</button>
        </form>
      </section>

      <section>
        <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Workflows</h2>
        <p className="mt-1 text-[11px] text-muted">Running on this house. Stop one or start another.</p>
        {flows.length ? (
          <ul className="mt-2 space-y-1">
            {flows.map((w) => (
              <li key={w} className="flex items-center justify-between gap-2 rounded-md border border-line px-3 py-2 text-sm">
                <span className="flex items-center gap-2">
                  <Workflow className="size-3.5 text-navy" />
                  {w}
                </span>
                <button type="button" className="h-9 px-2 text-sm font-semibold text-muted" onClick={() => stopWorkflow(lead.id, w)}>
                  Stop
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">None running.</p>
        )}
        <div className="mt-2 flex flex-col gap-1">
          {flowPool.filter((w) => !flows.includes(w)).map((w) => (
            <button key={w} type="button" className="h-10 rounded-md border border-line px-3 text-left text-sm hover:border-navy" onClick={() => addWorkflow(lead.id, w)}>
              Start {w}
            </button>
          ))}
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            createWorkflow(lead.id, flowDraft);
            setFlowDraft("");
          }}
        >
          <input value={flowDraft} onChange={(e) => setFlowDraft(e.target.value)} placeholder="New workflow" className="h-11 min-w-0 flex-1 rounded-md border border-line px-3 text-sm outline-none focus:border-navy" />
          <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">Start</button>
        </form>
      </section>
    </div>
  );
}
