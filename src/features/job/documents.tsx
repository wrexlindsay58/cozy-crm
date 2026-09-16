import { addChangeOrder, addInvoice, addPurchaseOrder, issueWo, payInvoice, receivePo, type JobFile } from "./store";
import { money } from "@/lib/crm-data";

export function Documents({ job, focus }: { job: JobFile; focus?: "co" | "invoice" | null }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <section className="rounded-md border border-line bg-card p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Change orders</h2>
          <button type="button" className="h-9 rounded-md bg-navy px-3 text-xs font-semibold text-card" onClick={() => addChangeOrder(job.jobId, "Extra duct run", 850, 220)}>
            Add CO
          </button>
        </div>
        {job.changeOrders.length === 0 ? <p className="text-sm text-muted">No extras yet.</p> : null}
        <ul className="space-y-1 text-sm">
          {job.changeOrders.map((c) => (
            <li key={c.id} className="flex justify-between gap-2">
              <span>{c.why}</span>
              <span className="tabular-nums">{money(c.amount)} · {c.status}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-md border border-line bg-card p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">POs · invoices · WOs</h2>
          <div className="flex gap-1">
            <button type="button" className="h-9 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => addPurchaseOrder(job.jobId, "Carrier", "Material", 500, false)}>
              PO
            </button>
            <button type="button" className="h-9 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => addInvoice(job.jobId, focus === "invoice" ? "Progress" : "Progress", 4000)}>
              Invoice
            </button>
            <button type="button" className="h-9 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => issueWo(job.jobId)}>
              WO
            </button>
          </div>
        </div>
        <ul className="space-y-1 text-sm">
          {job.pos.map((p) => (
            <li key={p.id} className="flex justify-between gap-2">
              <button type="button" className="font-semibold" onClick={() => receivePo(job.jobId, p.id)}>
                {p.id} · {p.what}
              </button>
              <span>{p.status} · {money(p.amount)}</span>
            </li>
          ))}
          {job.invoices.map((i) => (
            <li key={i.id} className="flex justify-between gap-2">
              <button type="button" className="font-semibold" onClick={() => payInvoice(job.jobId, i.id)}>
                {i.id} · {i.kind}
              </button>
              <span>{i.status} · {money(i.amount)}</span>
            </li>
          ))}
          {job.workOrders.map((w) => (
            <li key={w.id} className="text-muted">
              {w.id} · {w.status} · {w.day} · {w.crew}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
