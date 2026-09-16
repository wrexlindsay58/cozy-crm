import { money } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { canSeeCost, useStaff } from "@/features/staff/store";
import {
  addChangeOrder,
  addInvoice,
  payInvoice,
  sendFinalInvoice,
  setInvoiceStatus,
  signCo,
  signFinanceCo,
  tally,
  type JobFile,
} from "./store";

const PAY = ["Draft", "Sent", "Partial", "Paid", "Past due", "NSF", "Card declined", "Void", "Refunded"] as const;

export function MoneyBlock({ job }: { job: JobFile }) {
  useStaff();
  const t = tally(job);
  const sync = job.installRev === job.financeRev;

  return (
    <div className="space-y-4">
      {canSeeCost() ? (
        <section className="rounded-md border border-line bg-card p-5">
          <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">P&L</h2>
          <ol className="divide-y divide-line text-sm">
            {[
              ["Contract", t.revenue],
              ["Labor actual", t.labor],
              ["Materials", t.mats],
              ["Quoted materials", t.quotedMats],
              ["Actual cost", t.cost],
              ["Margin", t.margin],
              ["Left to collect", t.collect],
            ].map(([lab, val]) => (
              <li key={String(lab)} className="flex justify-between py-2">
                <span>{lab}</span>
                <span className={cn("font-extrabold tabular-nums", lab === "Margin" && (val as number) < 0 && "text-alert")}>{money(val as number)}</span>
              </li>
            ))}
          </ol>
          {t.overUnder !== 0 ? (
            <p className={cn("mt-3 text-sm font-semibold", t.overUnder > 0 ? "text-alert" : "text-up")}>
              {t.overUnder > 0 ? `Overbilled ${money(t.overUnder)}` : `Underbilled ${money(-t.overUnder)}`}
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted">Billed matches contract.</p>
          )}
        </section>
      ) : (
        <p className="rounded-md border border-line bg-card p-5 text-sm text-muted">Cost hidden. Contract {money(t.revenue)}.</p>
      )}

      <section className="rounded-md border border-line bg-card p-5">
        <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">GoodLeap</h2>
        <dl className="grid gap-3 sm:grid-cols-3 text-sm">
          <div>
            <dt className="text-[11px] font-bold tracking-wide text-muted uppercase">Amount</dt>
            <dd className="mt-0.5 font-semibold tabular-nums">{money(job.loan.amount)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold tracking-wide text-muted uppercase">Dealer fee</dt>
            <dd className="mt-0.5 font-semibold tabular-nums">{money(job.loan.dealerFee)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold tracking-wide text-muted uppercase">Term / rate</dt>
            <dd className="mt-0.5 font-semibold">{job.loan.term} mo · {job.loan.rate}%</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold tracking-wide text-muted uppercase">Status</dt>
            <dd className="mt-0.5 font-semibold">{job.loan.status}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[11px] font-bold tracking-wide text-muted uppercase">Notes</dt>
            <dd className="mt-0.5">{job.loan.notes || "—"}</dd>
          </div>
        </dl>
        <p className="mt-3 text-[12px] text-muted">From GoodLeap. We don’t type these.</p>
      </section>

      <section className="rounded-md border border-line bg-card p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Agreements</h2>
            <p className={cn("mt-0.5 text-sm", sync ? "text-up" : "text-alert")}>{sync ? "Install and finance match" : `Out of sync · install r${job.installRev} / finance r${job.financeRev}`}</p>
          </div>
          {!sync ? (
            <button type="button" className="h-9 rounded-md bg-navy px-3 text-xs font-semibold text-card" onClick={() => signFinanceCo(job.jobId)}>
              Sign finance CO
            </button>
          ) : null}
        </div>
        <button type="button" className="h-9 rounded-md border border-line px-3 text-xs font-semibold" onClick={() => addChangeOrder(job.jobId, "Extra duct run", 850, 220)}>
          Change order
        </button>
        <ul className="mt-3 space-y-2 text-sm">
          {job.changeOrders.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2">
              <span>
                {c.why} · {money(c.amount)}
              </span>
              {c.signed ? (
                <span className="text-[12px] text-up">Install signed</span>
              ) : (
                <button type="button" className="text-xs font-semibold text-navy" onClick={() => signCo(job.jobId, c.id)}>
                  Sign install
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-md border border-line bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Invoices · {money(t.collect)} left</h2>
          <div className="flex gap-1">
            <button type="button" className="h-9 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => addInvoice(job.jobId, "Progress", 4000)}>
              Invoice
            </button>
            <button type="button" className="h-9 rounded-md bg-navy px-2 text-xs font-semibold text-card" onClick={() => sendFinalInvoice(job.jobId)}>
              Final
            </button>
          </div>
        </div>
        <ul className="space-y-2">
          {job.invoices.map((i) => (
            <li key={i.id} className="rounded-md border border-line p-3 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold">{i.kind}</span>
                <span className="tabular-nums">
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
                <button type="button" className="mt-2 text-xs font-semibold text-navy" onClick={() => payInvoice(job.jobId, i.id, job.loan.vendor)}>
                  Record payment
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
