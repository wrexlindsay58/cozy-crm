import { addChangeOrder, addInvoice, addPurchaseOrder, issueWo, payInvoice, receivePo, type JobFile } from "./store";

export function Documents({ job, focus }: { job: JobFile; focus?: "co" | "invoice" | null }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <section className="rounded-md border border-line bg-card p-4">
        <h2 className="mb-2 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Change orders</h2>
        {focus === "co" ? <button type="button" className="mb-2 h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => addChangeOrder(job.jobId, "Extra duct run", 850, 220)}>Add demo CO</button> : null}
        <ul className="space-y-1 text-sm">{job.changeOrders.map((c) => <li key={c.id}>{c.id} · {c.why} · {c.status}</li>)}</ul>
      </section>
      <section className="rounded-md border border-line bg-card p-4">
        <h2 className="mb-2 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">POs / invoices / WOs</h2>
        {focus === "invoice" ? <button type="button" className="mb-2 h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => addInvoice(job.jobId, "Progress", 4000)}>Send progress</button> : null}
        <ul className="space-y-1 text-sm">
          {job.pos.map((p) => <li key={p.id}><button type="button" className="font-semibold" onClick={() => receivePo(job.jobId, p.id)}>{p.id}</button> · {p.vendor} · {p.status}</li>)}
          {job.invoices.map((i) => <li key={i.id}><button type="button" className="font-semibold" onClick={() => payInvoice(job.jobId, i.id)}>{i.id}</button> · {i.kind} · {i.status}</li>)}
        </ul>
        <button type="button" onClick={() => { addPurchaseOrder(job.jobId, "Carrier", "Material", 500, false); issueWo(job.jobId); }} className="mt-2 h-9 rounded-md border border-line px-3 text-xs font-semibold">Issue WO</button>
      </section>
    </div>
  );
}
