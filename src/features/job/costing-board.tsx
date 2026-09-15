import { money } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { canSeeCost, useStaff } from "@/features/staff/store";
import { poReceived, poWatch, tally, type JobFile } from "./store";

export function CostingBoard({ job }: { job: JobFile }) {
  useStaff();
  const t = tally(job);
  if (!canSeeCost()) {
    return (
      <section className="rounded-md border border-line bg-card p-4">
        <h2 className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Costing</h2>
        <p className="mt-2 text-sm text-muted">Cost hidden for this role. Sold {money(job.sold)}.</p>
      </section>
    );
  }
  const watch = poWatch(job);
  const rows: { label: string; value: number; hint?: string; wash?: "stop" | "watch" | "go" }[] = [
    { label: "Sold", value: job.sold },
    { label: "Approved COs", value: t.revenue - job.sold },
    { label: "Labor", value: -job.labor },
    { label: "Commission", value: -job.commission },
    { label: "PO received", value: -poReceived(job) },
    { label: "Extras", value: -job.extras },
    { label: "Margin", value: t.margin, wash: t.margin < 0 ? "stop" : "go" },
    { label: "Invoiced − paid", value: t.balance, hint: "AR, not cost" },
  ];
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Costing</h2>
        <p className="text-xs text-muted">revenue {money(t.revenue)} − cost {money(t.cost)}</p>
      </div>
      <ol className="divide-y divide-line">
        {rows.map((r) => (
          <li key={r.label} className="flex items-baseline justify-between gap-3 py-2">
            <span className="text-sm font-medium">{r.label}{r.hint ? <span className="ml-2 text-xs font-normal text-muted">{r.hint}</span> : null}</span>
            <span className={cn("text-sm font-extrabold tabular-nums", r.wash === "stop" && "rounded-sm bg-alert/15 px-1.5 text-alert", r.wash === "go" && "text-up")}>{money(r.value)}</span>
          </li>
        ))}
      </ol>
      {watch > 0 ? <p className="mt-3 rounded-md bg-alert/10 px-3 py-2 text-sm text-alert">Open POs {money(watch)}. Watch only. Not cost until received.</p> : null}
    </section>
  );
}
