import { X } from "lucide-react";
import { Float } from "@/components/float";
import { addWorkflow, createTag, createWorkflow, stopWorkflow, toggleLeadTag } from "@/features/ops/store";
import { cn } from "@/lib/cn";

export function MarksBarView(props: { bag: { anchor: any; setOpen: any; tagPool: any; tags: any; lead: any; tagDraft: any; setTagDraft: any; flows: any; flowPool: any; flowDraft: any; setFlowDraft: any } }) {
  const { anchor, setOpen, tagPool, tags, lead, tagDraft, setTagDraft, flows, flowPool, flowDraft, setFlowDraft } = props.bag;
  return (
    <Float anchor={anchor} prefer="bottom" onClose={() => setOpen(false)}>
          <div className="w-64 p-2">
            <p className="px-1 pb-1 text-[11px] font-bold tracking-wide text-muted uppercase">Tags</p>
            <div className="flex flex-wrap gap-1">
              {tagPool.map((t: any) => {
                const on = tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleLeadTag(lead.id, t)}
                    className={cn("h-7 rounded-md px-2 text-[11px] font-semibold", on ? "bg-navy text-card" : "border border-line")}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <form
              className="mt-2 flex gap-1"
              onSubmit={(e) => {
                e.preventDefault();
                createTag(lead.id, tagDraft);
                setTagDraft("");
              }}
            >
              <input value={tagDraft} onChange={(e) => setTagDraft(e.target.value)} placeholder="New tag" className="h-9 min-w-0 flex-1 rounded-md border border-line px-2 text-sm outline-none focus:border-navy" />
              <button type="submit" className="h-9 rounded-md bg-navy px-2 text-[11px] font-semibold text-card">Add</button>
            </form>
            <p className="mt-3 px-1 pb-1 text-[11px] font-bold tracking-wide text-muted uppercase">Workflows</p>
            {flows.length ? (
              <ul className="mb-1 space-y-1">
                {flows.map((w: any) => (
                  <li key={w} className="flex items-center justify-between gap-2 px-1 text-sm">
                    <span className="truncate">{w}</span>
                    <button type="button" className="grid size-7 place-items-center text-muted" aria-label={`Stop ${w}`} onClick={() => stopWorkflow(lead.id, w)}>
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-1 text-[11px] text-muted">None running.</p>
            )}
            {flowPool.filter((w: any) => !flows.includes(w)).map((w: any) => (
              <button key={w} type="button" className="h-9 w-full rounded-md px-2 text-left text-sm hover:bg-page" onClick={() => addWorkflow(lead.id, w)}>
                Start {w}
              </button>
            ))}
            <form
              className="mt-1 flex gap-1"
              onSubmit={(e) => {
                e.preventDefault();
                createWorkflow(lead.id, flowDraft);
                setFlowDraft("");
              }}
            >
              <input value={flowDraft} onChange={(e) => setFlowDraft(e.target.value)} placeholder="New workflow" className="h-9 min-w-0 flex-1 rounded-md border border-line px-2 text-sm outline-none focus:border-navy" />
              <button type="submit" className="h-9 rounded-md bg-navy px-2 text-[11px] font-semibold text-card">Start</button>
            </form>
          </div>
        </Float>
  );
}
