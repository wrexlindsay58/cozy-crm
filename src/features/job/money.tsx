import { money } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { canSeeCost, useStaff } from "@/features/staff/store";
import {
  addChangeOrder,
  addInvoice,
  addPurchaseOrder,
  payInvoice,
  patchLoan,
  receivePo,
  sendFinalInvoice,
  setInvoiceStatus,
  signCo,
  tally,
  type JobFile,
} from "./store";

const LOAN = ["None", "Received", "Docs needed", "Cancelled", "NTP", "Complete", "Funded"] as const;
const PAY = ["Draft", "Sent", "Partial", "Paid", "Past due", "NSF", "Card declined", "Void", "Refunded"] as const;

export function MoneyBlock({ job }: { job: JobFile }) {
  useStaff();
  const t = tally(job);
  const due = t.balance;

  return (
    <div className="space-y-3">
      {canSeeCost() ? (
        <section className="rounded-md border border-line bg-card p-4">
          <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Costing</h2>
          <ol className="divide-y divide-line">
            {[
              ["Sold", t.revenue],
              ["Quoted cost", t.quoted],
              ["Actual cost", t.cost],
              ["Quoted margin", t.quotedMargin],
              ["Actual margin", t.margin],
              ["AR", t.balance],
            ].map(([lab, val]) => (
              <li key={String(lab)} className="flex justify-between gap-3 py-2 text-sm">
                <span>{lab}</span>
                <span className={cn("font-extrabold tabular-nums", lab.toString().includes("margin") && (val as number) < 0 && "text-alert")}>{money(val as number)}</span>
              </li>
            ))}
          </ol>
          {t.watch > 0 ? <p className="mt-3 rounded-md bg-alert/10 px-3 py-2 text-sm text-alert">Open POs {money(t.watch)}. Not cost until received.</p> : null}
        </section>
      ) : (
        <p className="rounded-md border border-line bg-card p-4 text-sm text-muted">Cost hidden. Sold {money(job.sold)}.</p>
      )}

      <section className="rounded-md border border-line bg-card p-4">
        <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">GoodLeap / pay</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <select value={job.loan.vendor} onChange={(e) => patchLoan(job.jobId, { vendor: e.target.value as typeof job.loan.vendor })} className="h-10 rounded-md border border-line px-2 text-sm">
            {["GoodLeap", "Cash", "Card"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <input value={job.loan.amount || ""} inputMode="numeric" onChange={(e) => patchLoan(job.jobId, { amount: Number(e.target.value) || 0 })} placeholder="Loan $" className="h-10 rounded-md border border-line px-3 text-sm" />
          <input value={job.loan.dealerFee || ""} inputMode="numeric" onChange={(e) => patchLoan(job.jobId, { dealerFee: Number(e.target.value) || 0 })} placeholder="Dealer fee" className="h-10 rounded-md border border-line px-3 text-sm" />
          <input value={job.loan.term || ""} inputMode="numeric" onChange={(e) => patchLoan(job.jobId, { term: Number(e.target.value) || 0 })} placeholder="Term months" className="h-10 rounded-md border border-line px-3 text-sm" />
          <input value={job.loan.rate || ""} inputMode="decimal" onChange={(e) => patchLoan(job.jobId, { rate: Number(e.target.value) || 0 })} placeholder="Rate %" className="h-10 rounded-md border border-line px-3 text-sm" />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {LOAN.map((s) => (
            <button key={s} type="button" onClick={() => patchLoan(job.jobId, { status: s })} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", job.loan.status === s ? "bg-navy text-card" : "border border-line")}>
              {s}
            </button>
          ))}
        </div>
        <textarea value={job.loan.notes} onChange={(e) => patchLoan(job.jobId, { notes: e.target.value })} rows={2} placeholder="Stipulations, borrower, notes from GoodLeap." className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm" />
        {job.loan.status === "Funded" ? <p className="mt-2 text-sm font-semibold text-up">Funded {money(job.loan.fundedAmount || job.loan.amount)}</p> : null}
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-md border border-line bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">POs</h2>
            <button type="button" className="h-9 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => addPurchaseOrder(job.jobId, "Vendor", "Material", 500, false)}>
              Add PO
            </button>
          </div>
          <ul className="space-y-2 text-sm">
            {job.pos.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2">
                <button type="button" className="font-semibold" onClick={() => receivePo(job.jobId, p.id)}>
                  {p.id} · {p.what}
                </button>
                <span className="text-muted">
                  {p.status} · {money(p.amount)}
                  {p.file ? (
                    <a href={p.file.url} className="ml-2 text-navy underline">
                      {p.file.name}
                    </a>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-md border border-line bg-card p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Invoices · {money(due)} left</h2>
            <div className="flex gap-1">
              <button type="button" className="h-9 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => addInvoice(job.jobId, "Progress", 4000)}>
                Invoice
              </button>
              <button type="button" className="h-9 rounded-md bg-navy px-2 text-xs font-semibold text-card" onClick={() => sendFinalInvoice(job.jobId)}>
                Final invoice
              </button>
            </div>
          </div>
          <ul className="space-y-2 text-sm">
            {job.invoices.map((i) => (
              <li key={i.id} className="rounded-md border border-line p-2">
                <div className="flex justify-between gap-2">
                  <span className="font-semibold">
                    {i.id} · {i.kind}
                  </span>
                  <span>
                    {money(i.paid)} / {money(i.amount)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {PAY.map((s) => (
                    <button key={s} type="button" onClick={() => setInvoiceStatus(job.jobId, i.id, s)} className={cn("h-7 rounded-md px-2 text-[10px] font-semibold", i.status === s ? "bg-navy text-card" : "border border-line")}>
                      {s}
                    </button>
                  ))}
                </div>
                {i.status !== "Paid" ? (
                  <button type="button" className="mt-2 text-xs font-semibold text-navy" onClick={() => payInvoice(job.jobId, i.id, job.loan.vendor === "GoodLeap" ? "GoodLeap" : "Card")}>
                    Record payment
                  </button>
                ) : null}
                {i.file ? (
                  <a href={i.file.url} className="mt-1 block text-xs font-semibold text-navy underline">
                    {i.file.name}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-md border border-line bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Change orders</h2>
          <button type="button" className="h-9 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => addChangeOrder(job.jobId, "Extra duct run", 850, 220)}>
            Add CO
          </button>
        </div>
        <ul className="space-y-1 text-sm">
          {job.changeOrders.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2">
              <span>
                {c.why} · {money(c.amount)}
              </span>
              {c.signed ? (
                <span className="text-[12px] text-up">Signed</span>
              ) : (
                <button type="button" className="text-xs font-semibold text-navy" onClick={() => signCo(job.jobId, c.id)}>
                  Customer sign
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
