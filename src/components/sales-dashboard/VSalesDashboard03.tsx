import { numClass, Pip, Delta } from "./bits-01";
import { useSalesDashboard3 } from "./useSalesDashboard3";
import { cn } from "@/lib/cn";
import { money } from "@/lib/crm-data";
import { Tip } from "@/components/tip";

export function VSalesDashboard03({ bag }: { bag: ReturnType<typeof useSalesDashboard3> }) {
  const { commPct, disc, mem, paidComm, priorCommPct, priorPaid, priorReady, readyPay, t } = bag;
  return (
    <>
<section className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-line lg:grid-cols-3">
        <div className="bg-card px-4 py-3 max-md:order-2">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
            Memberships
            <Pip now={mem.members} yest={mem.priorMembers} />
          </p>
          <p className={cn("mt-1 text-[28px] font-bold tabular-nums", numClass(mem.members, mem.priorMembers))}>{mem.members.toLocaleString()}</p>
          <p className="mt-1 text-[12px] text-muted">
            <Delta now={mem.members} was={mem.priorMembers} /> vs {t.vs}
          </p>
        </div>
        <div className="bg-card px-4 py-3 max-md:order-1 max-md:col-span-2">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
            Membership sold
            <Pip now={mem.total} yest={mem.priorTotal} />
          </p>
          <p className={cn("mt-1 text-[28px] font-bold tabular-nums max-md:text-[32px] max-md:leading-[42px]", numClass(mem.total, mem.priorTotal))}>{money(mem.total)}</p>
          <p className="mt-1 text-[12px] text-muted">
            <Delta now={mem.total} was={mem.priorTotal} /> vs {t.vs}
          </p>
        </div>
        <div className="col-span-2 bg-card px-4 py-3 max-md:order-3 max-md:col-span-1 lg:col-span-1">
          <Tip label="Memberships sold with a job, divided by jobs" on>
            <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
              Job attachment
              <Pip now={mem.rate} yest={mem.priorRate} />
            </p>
          </Tip>
          <p className={cn("mt-1 text-[28px] font-bold tabular-nums", numClass(mem.rate, mem.priorRate))}>{mem.rate}%</p>
          <p className="mt-1 text-[12px] text-muted">
            {mem.attached.toLocaleString()} of {mem.jobs.toLocaleString()} jobs
          </p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-line lg:grid-cols-5">
        <div className="bg-card px-4 py-3 max-md:order-5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
            True discount
            <Pip now={disc.truePct} yest={disc.priorTrue} invert />
          </p>
          <p className={cn("mt-1 text-[28px] font-bold tabular-nums", numClass(disc.truePct, disc.priorTrue, undefined, true))}>{disc.truePct}%</p>
          <p className="mt-1 text-[12px] text-muted">
            <Delta now={disc.truePct} was={disc.priorTrue} invert /> vs {t.vs}
          </p>
        </div>
        <div className="bg-card px-4 py-3 max-md:order-4">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
            Sold discount
            <Pip now={disc.pct} yest={disc.prior} invert />
          </p>
          <p className={cn("mt-1 text-[28px] font-bold tabular-nums", numClass(disc.pct, disc.prior, undefined, true))}>{disc.pct}%</p>
          <p className="mt-1 text-[12px] text-muted">
            <Delta now={disc.pct} was={disc.prior} invert /> vs {t.vs}
          </p>
        </div>
        <div className="bg-card px-4 py-3 max-md:order-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
            <Tip label="Average commission" on>
              <span>Avg. Commission %</span>
            </Tip>
            <Pip now={commPct} yest={priorCommPct} />
          </p>
          <p className={cn("mt-1 text-[28px] font-bold tabular-nums", numClass(commPct, priorCommPct))}>{commPct}%</p>
          <p className="mt-1 text-[12px] text-muted">
            <Delta now={commPct} was={priorCommPct} /> vs {t.vs}
          </p>
        </div>
        <div className="bg-card px-4 py-3 max-md:order-2">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
            <Tip label="Commission earned and ready to pay. Not paid out yet." on>
              <span>Ready to pay</span>
            </Tip>
            <Pip now={readyPay} yest={priorReady} />
          </p>
          <p className={cn("mt-1 text-[28px] font-bold tabular-nums", numClass(readyPay, priorReady))}>{money(readyPay)}</p>
          <p className="mt-1 text-[12px] text-muted">
            <Delta now={readyPay} was={priorReady} /> vs {t.vs}
          </p>
        </div>
        <div className="bg-card px-4 py-3 max-md:order-1 max-md:col-span-2">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
            Commissions Paid
            <Pip now={paidComm} yest={priorPaid} />
          </p>
          <p className={cn("mt-1 text-[28px] font-bold tabular-nums max-md:text-[32px] max-md:leading-[42px]", numClass(paidComm, priorPaid))}>{money(paidComm)}</p>
          <p className="mt-1 text-[12px] text-muted">
            <Delta now={paidComm} was={priorPaid} /> vs {t.vs}
          </p>
        </div>
      </section>
    </>
  );
}
