import type { Lead } from "@/lib/crm-data";
import { DndPick } from "./dnd-pick";

export function LeadTools({ lead }: { lead: Lead }) {
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">DND</h2>
        <DndPick lead={lead} />
      </div>
    </section>
  );
}
