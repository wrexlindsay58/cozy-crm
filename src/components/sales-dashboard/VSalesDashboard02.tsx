import { numClass, Pip, Delta } from "./bits-01";
import { PopPie } from "./bits-02";
import { Spark, TargetBar } from "./bits-03";
import { useSalesDashboard3 } from "./useSalesDashboard3";
import { cn } from "@/lib/cn";
import { money } from "@/lib/crm-data";

export function VSalesDashboard02({ bag }: { bag: ReturnType<typeof useSalesDashboard3> }) {
  const { closeHover, closeParts, disc, moneyBars, nsa, picked, priorNsa, setCloseHover, setOpen, setPicked, t } = bag;
  return (
    <>
<section className="grid gap-px overflow-hidden rounded-md bg-line sm:grid-cols-2 lg:grid-cols-4">
        <button type="button" onClick={() => { setOpen("sold"); setPicked("hero-sold"); }} className={cn("flex h-full flex-col bg-card p-5 text-left", picked === "hero-sold" && "shadow-[inset_3px_0_0_0_var(--color-navy)]")}>
          <p className="flex h-4 items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
            Sold
            <Pip now={t.sold} yest={t.priorSold} />
          </p>
          <p className={cn("type-hero mt-1 min-w-0", numClass(t.sold, t.priorSold, t.goalSold))}>{money(t.sold)}</p>
          <p className="mt-2 flex h-5 items-center gap-2">
            <Delta now={t.sold} was={t.priorSold} />
            <span className="text-[12px] text-muted">vs {t.vs}</span>
          </p>
          <p className="mt-1 h-4 text-[12px] text-muted">
            {t.deals} deals · disc {disc.pct}%
          </p>
          <Spark data={t.bars} moneyBars={moneyBars} />
        </button>

        <button
          type="button"
          onClick={() => { setOpen("appointments"); setPicked("hero-close"); }}
          className={cn("flex h-full flex-col bg-card p-5 text-left", picked === "hero-close" && "shadow-[inset_3px_0_0_0_var(--color-navy)]")}
        >
          <p className="flex h-4 items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
            Close
            <Pip now={t.close} yest={t.priorClose} />
          </p>
          <p className={cn("type-hero mt-1 min-w-0", numClass(t.close, t.priorClose, t.goalClose))}>{t.close}%</p>
          <p className="mt-2 flex h-5 items-center gap-2">
            <Delta now={t.close} was={t.priorClose} />
            <span className="text-[12px] text-muted">vs {t.vs}</span>
          </p>
          <p className="mt-1 h-4 text-[12px] text-muted">
            {t.deals} sold of {t.runs} ran
          </p>
          <div className="chart-stack mt-auto flex h-16 items-center gap-3">
            <div className="chart-frame relative size-16 shrink-0">
              <div className="absolute top-1/2 left-1/2 size-24 -translate-x-1/2 -translate-y-[calc(50%-6px)]">
                <PopPie data={closeParts} dataKey="amount" inner={18} outer={28} active={closeHover} onActive={setCloseHover} />
              </div>
            </div>
            <ul className="min-w-0 flex-1 translate-y-[6px] space-y-0.5 text-[11px]">
              {closeParts.map((s, i) => (
                <li
                  key={s.name}
                  className={cn("-mx-1 flex items-center justify-between gap-2 rounded-sm px-1", closeHover === i && "bg-page")}
                  onMouseEnter={() => setCloseHover(i)}
                  onMouseLeave={() => setCloseHover(undefined)}
                >
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <i className="size-1.5 shrink-0 rounded-sm" style={{ background: s.fill }} />
                    <span className="truncate">{s.name}</span>
                  </span>
                  <span className="font-semibold tabular-nums">{s.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        </button>

        <div className="flex h-full flex-col bg-card p-5">
          <p className="flex h-4 items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
            NRA
            <Pip now={nsa} yest={priorNsa} />
          </p>
          <p className={cn("type-hero mt-1 min-w-0", numClass(nsa, priorNsa, 4000))}>{money(nsa)}</p>
          <p className="mt-2 flex h-5 items-center gap-2">
            <Delta now={nsa} was={priorNsa} />
            <span className="text-[12px] text-muted">vs {t.vs}</span>
          </p>
          <p className="mt-1 h-4 text-[12px] text-muted">Net revenue per appointment</p>
          <TargetBar now={nsa} target={4000} />
        </div>

        <div className="flex h-full flex-col bg-card p-5">
          <p className="flex h-4 items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
            Avg ticket
            <Pip now={t.avg} yest={t.priorAvg} />
          </p>
          <p className={cn("type-hero mt-1 min-w-0", numClass(t.avg, t.priorAvg, 15000))}>{money(t.avg)}</p>
          <p className="mt-2 flex h-5 items-center gap-2">
            <Delta now={t.avg} was={t.priorAvg} />
            <span className="text-[12px] text-muted">vs {t.vs}</span>
          </p>
          <p className="mt-1 h-4 text-[12px] text-muted">{disc.pct}% sold discount</p>
          <TargetBar now={t.avg} target={15000} />
        </div>
      </section>
    </>
  );
}
