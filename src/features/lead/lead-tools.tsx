import type { Lead } from "@/lib/crm-data";
import { DndPick } from "./dnd-pick";
import { MarksBar } from "./marks-bar";

export function LeadTools({ lead }: { lead: Lead }) {
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">DND</h2>
        <DndPick lead={lead} />
      </div>
      <h2 className="mt-4 text-[11px] font-bold tracking-wide text-muted uppercase">Tags and workflows</h2>
      <div className="mt-2">
        <MarksBar lead={lead} />
      </div>
    </section>
  );
}
