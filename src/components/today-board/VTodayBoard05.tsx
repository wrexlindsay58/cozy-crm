import { markClass, Pip, TrendMark } from "./bits-01";
import { GoalLine } from "./bits-02";
import { useTodayBoard } from "./useTodayBoard";
import { cn } from "@/lib/cn";
import { money } from "@/lib/crm-data";
import { Tip } from "@/components/tip";

export function VTodayBoard05({ bag }: { bag: ReturnType<typeof useTodayBoard> }) {
  const { flowMax, t } = bag;
  return (
    <>
<section className="rounded-md bg-card px-5 py-4">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <Tip label="Today vs yesterday" on>
                <p className="whitespace-nowrap text-[11px] font-bold tracking-wide text-muted uppercase">Daily flow</p>
              </Tip>
              <ul className="flex gap-4 text-[12px]">
                <li className="inline-flex items-center gap-1.5">
                  <i className="size-2.5 rounded-sm bg-navy" /> Today
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <i className="size-2.5 rounded-sm bg-line-strong" /> Yesterday
                </li>
              </ul>
            </div>
            <div className="flex items-end gap-2">
              {t.flow.map((s: any) => {
                const nowH = s.now ? Math.max(12, (s.now / flowMax) * 100) : 0;
                const yestH = s.yest ? Math.max(12, (s.yest / flowMax) * 100) : 0;
                const flip = s.key === "cancel";
                const pip = { now: flip ? s.yest : s.now, yest: flip ? s.now : s.yest };
                const word = s.label === "Appts." ? "Appts." : s.label.toLowerCase();
                return (
                  <div key={s.key} className="flex min-w-0 flex-1 flex-col items-center">
                    <div className="flex h-28 w-full max-w-[5.625rem] items-end justify-center gap-1.5 max-md:gap-1">
                      <Tip label={`Yesterday ${s.yest}`} on className="flex h-full w-[42%] cursor-pointer items-end">
                        <span className="block w-full rounded-sm bg-line-strong" style={{ height: `${yestH}%` }} />
                      </Tip>
                      <Tip label={`Today ${s.now}`} on className="flex h-full w-[42%] cursor-pointer items-end">
                        <span className="block w-full rounded-sm bg-navy" style={{ height: `${nowH}%` }} />
                      </Tip>
                    </div>
                    <p className="mt-2 flex items-center gap-1 max-md:flex-col max-md:gap-0.5">
                      <Pip now={pip.now} yest={pip.yest} />
                      <span className="whitespace-nowrap text-[11px] font-bold tracking-wide text-muted uppercase max-md:text-[10px] max-md:tracking-normal">{s.label}</span>
                    </p>
                    <p className="mt-0.5 text-center text-[11px] whitespace-nowrap tabular-nums text-muted max-md:text-[10px]">
                      <span className="max-md:hidden">{s.now} {word}</span>
                      <span className="hidden max-md:inline">{s.now}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-md bg-card px-5 py-5">
            <p className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-bold tracking-wide text-muted uppercase">
              Demand / capacity
              <TrendMark trend={t.trends.demand} />
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-x-5 gap-y-1">
              <Tip label="Jobs on the book vs crews. Goal 10% more demand than capacity." on>
                <p className={cn("type-hero min-w-0", markClass(t.marks.demand))}>{t.field.demandPct}%</p>
              </Tip>
              <p className="pb-1 text-[13px] tabular-nums text-muted">
                {t.field.demand} demand · {t.field.capacity} capacity
              </p>
            </div>
            <GoalLine now={t.field.demandPct} goal={t.trends.demand.goal} hint={`Now ${t.field.demandPct}% · goal ${t.trends.demand.goal}%`} />
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <li>
                <Tip label="Contract value still on today's production book" on>
                  <p>
                    <span className="block whitespace-nowrap text-[11px] font-bold tracking-wide text-muted uppercase">On the book</span>
                    <span className="text-[22px] font-bold tabular-nums">{money(t.field.bookValue)}</span>
                  </p>
                </Tip>
              </li>
              <li>
                <Tip label="Jobs held. They count as demand but eat no capacity until released." on>
                  <p>
                    <span className="block whitespace-nowrap text-[11px] font-bold tracking-wide text-muted uppercase">Holds</span>
                    <span className="text-[22px] font-bold tabular-nums">{t.field.holds}</span>
                  </p>
                </Tip>
              </li>
              <li>
                <Tip label="Installs that should have finished by this hour" on>
                  <p>
                    <span className="block whitespace-nowrap text-[11px] font-bold tracking-wide text-muted uppercase">Late</span>
                    <span className="text-[22px] font-bold tabular-nums">{t.field.late}</span>
                  </p>
                </Tip>
              </li>
              <li>
                <Tip label="Crews with no job today. Unused capacity." on>
                  <p>
                    <span className="block whitespace-nowrap text-[11px] font-bold tracking-wide text-muted uppercase">Idle crews</span>
                    <span className="text-[22px] font-bold tabular-nums">{t.field.crewsIdle}</span>
                  </p>
                </Tip>
              </li>
            </ul>
          </section>
    </>
  );
}
