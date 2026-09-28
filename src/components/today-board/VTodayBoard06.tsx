import { markClass } from "./bits-01";
import { MiniDonut } from "./bits-03";
import { CountShare, Story, FillMeter } from "./bits-04";
import { RankList } from "./bits-05";
import { useTodayBoard } from "./useTodayBoard";
import { Tip } from "@/components/tip";

export function VTodayBoard06({ bag }: { bag: ReturnType<typeof useTodayBoard> }) {
  const { t } = bag;
  return (
    <>
<section className="grid gap-px overflow-hidden rounded-md bg-line sm:grid-cols-2 lg:grid-cols-4">
            <Story title="Installs" value={`${t.field.installsDone} done`} hint="Done · live · pending" rows={t.field.installSplit} />
            <Story title="Runs" value={`${t.field.runsLeft} left`} hint="Left · sitting now · already ran" rows={t.field.runNowSplit} />
            <div className="flex min-w-0 flex-col bg-card px-5 py-4">
              <p className="whitespace-nowrap text-[11px] font-bold tracking-wide text-muted uppercase">Crews</p>
              <div className="mt-3">
                <Tip label="Crews with a job today" on>
                  <p className="type-metric min-w-0">
                    {t.field.crewsOut}/{t.field.crewsN}
                  </p>
                </Tip>
                <p className="mt-2 text-[12px] text-muted">{t.field.crewsIdle} idle</p>
              </div>
              <FillMeter now={t.field.crewsOut} max={t.field.crewsN} hint="Share of crews out" />
            </div>
            <div className="flex min-w-0 flex-col bg-card px-5 py-4">
              <p className="whitespace-nowrap text-[11px] font-bold tracking-wide text-muted uppercase">Reps</p>
              <div className="mt-3">
                <Tip label="Closers with a run today" on>
                  <p className="type-metric min-w-0">
                    {t.field.repsOut}/{t.field.repsN}
                  </p>
                </Tip>
                <p className="mt-2 text-[12px] text-muted">{t.field.repsIdle} idle</p>
              </div>
              <FillMeter now={t.field.repsOut} max={t.field.repsN} hint="Share of reps out" />
            </div>
          </section>

          <section className="grid gap-px overflow-hidden rounded-md bg-line lg:grid-cols-2">
            <div className="bg-card px-5 py-4">
              <p className="whitespace-nowrap text-[11px] font-bold tracking-wide text-muted uppercase">Quality</p>
              <div className="mt-3 flex min-w-0 items-center gap-4">
                <MiniDonut rows={t.field.qcSplit} />
                <div className="min-w-0 flex-1">
                  <Tip label="Pass · fail · fixed · pending" on>
                    <p className="type-metric min-w-0">{t.field.qcDone} passed</p>
                  </Tip>
                  <ul className="mt-2 space-y-1">
                    {t.field.qcSplit.map((r: any) => (
                      <li key={r.label} className="flex items-baseline justify-between gap-2 text-[12px]">
                        <span className="inline-flex min-w-0 items-center gap-1.5 text-muted">
                          <i className="size-1.5 shrink-0 rounded-full" style={{ background: r.tone }} />
                          {r.label}
                        </span>
                        <CountShare n={r.n} total={t.field.qcSplit.reduce((s: any, row: any) => s + row.n, 0)} tone={r.mark ? markClass(r.mark) : ""} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-card px-5 py-4">
              <p className="whitespace-nowrap text-[11px] font-bold tracking-wide text-muted uppercase">Resolution</p>
              <div className="mt-3 flex min-w-0 items-center gap-4">
                <MiniDonut rows={t.actionCats} />
                <div className="min-w-0 flex-1">
                  <Tip label="Open tickets and tasks" on>
                    <p className="type-metric min-w-0">{t.field.tixOpen} open</p>
                  </Tip>
                  <ul className="mt-2 space-y-1">
                    {t.actionCats.map((r: any) => (
                      <li key={r.label} className="flex items-baseline justify-between gap-2 text-[12px]">
                        <span className="inline-flex min-w-0 items-center gap-1.5 text-muted">
                          <i className="size-1.5 shrink-0 rounded-full" style={{ background: r.tone }} />
                          {r.label}
                        </span>
                        <CountShare n={r.n} total={t.actionCats.reduce((s: any, row: any) => s + row.n, 0)} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-px overflow-hidden rounded-md bg-line lg:grid-cols-2">
            <div className="bg-card px-5 py-4">
              <p className="whitespace-nowrap text-[11px] font-bold tracking-wide text-muted uppercase">Top</p>
              <RankList rows={t.top} />
            </div>
            <div className="bg-card px-5 py-4">
              <p className="whitespace-nowrap text-[11px] font-bold tracking-wide text-muted uppercase">Bottom</p>
              <RankList rows={t.bottom} />
            </div>
          </section>
    </>
  );
}
