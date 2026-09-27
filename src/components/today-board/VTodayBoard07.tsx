import { TrendMark } from "./bits-01";
import { Stars } from "./bits-05";
import { useTodayBoard } from "./useTodayBoard";
import { Tip } from "@/components/tip";

export function VTodayBoard07({ bag }: { bag: ReturnType<typeof useTodayBoard> }) {
  const { t } = bag;
  return (
    <>
<section className="grid gap-px overflow-hidden rounded-md bg-line lg:grid-cols-3">
            <div className="bg-card px-5 py-4">
              <p className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-bold tracking-wide text-muted uppercase">
                Reviews
                <TrendMark trend={t.trends.reviews} />
              </p>
              <Tip label="Today's score" on>
                <p className="mt-1 flex items-center gap-2">
                  <span className="type-metric min-w-0">{t.field.reviewScore}</span>
                  <Stars n={5} tone="gold" />
                </p>
              </Tip>
              <ul className="mt-3 space-y-2.5">
                {t.reviews.slice(0, 3).map((r: any) => (
                  <li key={r.id} className="flex items-start gap-2">
                    <Stars n={r.stars} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{r.name}</span>
                      <span className="line-clamp-1 text-[12px] text-muted">{r.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card px-5 py-4">
              <p className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-bold tracking-wide text-muted uppercase">
                Referrals
                <TrendMark trend={t.trends.referrals} />
              </p>
              <Tip label="Referrals in today" on>
                <p className="mt-1 type-metric min-w-0">{t.field.referrals}</p>
              </Tip>
              <ul className="mt-3 space-y-2.5">
                {t.referrals.map((r: any) => (
                  <li key={r.id} className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{r.to}</span>
                      <span className="text-[12px] text-muted">from {r.from}</span>
                    </span>
                    <span className="shrink-0 whitespace-nowrap text-[11px] font-bold tracking-wide text-muted uppercase">{r.status}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card px-5 py-4">
              <p className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-bold tracking-wide text-muted uppercase">
                Surveys
                <TrendMark trend={t.trends.surveys} />
              </p>
              <Tip label="Surveys in today" on>
                <p className="mt-1 type-metric min-w-0">{t.field.surveys}</p>
              </Tip>
              <ul className="mt-3 space-y-2.5">
                {t.surveys.map((r: any) => (
                  <li key={r.id} className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{r.name}</span>
                      <span className="line-clamp-1 text-[12px] text-muted">{r.note}</span>
                    </span>
                    <span className="shrink-0 text-[13px] font-bold tabular-nums">{r.score}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
    </>
  );
}
