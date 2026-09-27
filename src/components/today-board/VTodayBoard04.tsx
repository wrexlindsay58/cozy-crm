import { markClass, TrendMark, Pace } from "./bits-01";
import { MktSources } from "./bits-02";
import { useTodayBoard } from "./useTodayBoard";
import { cn } from "@/lib/cn";
import { money } from "@/lib/crm-data";
import { Tip } from "@/components/tip";

export function VTodayBoard04({ bag }: { bag: ReturnType<typeof useTodayBoard> }) {
  const { collectedPct, mktX, t } = bag;
  return (
    <>
<section className="grid gap-px overflow-hidden rounded-md bg-line lg:grid-cols-3 lg:grid-rows-[auto_1fr_auto] lg:gap-x-px lg:gap-y-0">
            <div className="max-lg:flex max-lg:flex-col bg-card px-5 py-5 max-lg:gap-3 lg:row-span-3 lg:grid lg:grid-rows-subgrid">
              <p className="flex h-4 items-center gap-1.5 whitespace-nowrap text-[11px] font-bold tracking-wide text-muted uppercase">
                Money today
                <TrendMark trend={t.trends.cashIn} />
              </p>
              <div className="flex h-full min-h-0 flex-col justify-center gap-3">
                <div className="grid h-10 grid-cols-3 items-center gap-3">
                  <Tip label="Collected" on>
                    <p>
                      <span className="block text-[11px] font-bold leading-none text-muted uppercase">In</span>
                      <span className="mt-1 block text-[20px] font-bold leading-none tabular-nums max-md:text-[16px]">{money(t.cashIn)}</span>
                    </p>
                  </Tip>
                  <Tip label="Paid out" on>
                    <p>
                      <span className="block text-[11px] font-bold leading-none text-muted uppercase">Out</span>
                      <span className={cn("mt-1 block text-[20px] font-bold leading-none tabular-nums max-md:text-[16px]", markClass(t.marks.cashOut))}>{money(t.spent)}</span>
                    </p>
                  </Tip>
                  <Tip label="Still due" on>
                    <p>
                      <span className="block text-[11px] font-bold leading-none text-muted uppercase">Due</span>
                      <span className="mt-1 block text-[20px] font-bold leading-none tabular-nums max-md:text-[16px]">{money(t.expected)}</span>
                    </p>
                  </Tip>
                </div>
                <p className="flex h-4 items-baseline gap-6 whitespace-nowrap text-[12px] leading-4 tabular-nums text-muted">
                  <span>{money(t.cashIn - t.spent)} net</span>
                  <span>{collectedPct}% collected</span>
                </p>
              </div>
              <div className="pt-4">
                <Pace trend={t.trends.cashIn} />
              </div>
            </div>
            <div className="max-lg:flex max-lg:flex-col bg-card px-5 py-5 max-lg:gap-3 lg:row-span-3 lg:grid lg:grid-rows-subgrid">
              <p className="flex h-4 items-center gap-1.5 whitespace-nowrap text-[11px] font-bold tracking-wide text-muted uppercase">
                Marketing
                <TrendMark trend={t.trends.marketing} />
              </p>
              <div className="flex h-full min-h-0 flex-col justify-center gap-3">
                <div className="flex items-end justify-between gap-3">
                  <p className="h-4 whitespace-nowrap text-[12px] leading-4 tabular-nums text-muted">
                    {money(t.marketingSpend)} spend → {money(t.marketingSold)} sold
                  </p>
                  <Tip label="Sold per ad dollar" on className="shrink-0">
                    <p className={cn("type-metric whitespace-nowrap leading-none", markClass(t.marks.mkt))}>{mktX ? `${mktX}x` : "—"}</p>
                  </Tip>
                </div>
                <MktSources rows={t.mktBySource} />
              </div>
              <div className="pt-4">
                <Pace trend={t.trends.marketing} />
              </div>
            </div>
            <div className="max-lg:flex max-lg:flex-col bg-card px-5 py-5 max-lg:gap-3 lg:row-span-3 lg:grid lg:grid-rows-subgrid">
              <p className="flex h-4 items-center gap-1.5 whitespace-nowrap text-[11px] font-bold tracking-wide text-muted uppercase">
                Payroll
                <TrendMark trend={t.trends.payroll} />
              </p>
              <div className="flex h-full min-h-0 flex-col justify-center gap-3">
                <p className="type-metric min-w-0 whitespace-nowrap">{money(t.payroll)}</p>
                <Tip label="% of sales" on className="flex w-full">
                  <p className="h-4 whitespace-nowrap text-[12px] leading-4 tabular-nums text-muted">{t.sold ? `${Math.round((t.payroll / t.sold) * 100)}% of sales` : "—"}</p>
                </Tip>
              </div>
              <div className="pt-4">
                <Pace trend={t.trends.payroll} />
              </div>
            </div>
          </section>
    </>
  );
}
