import { createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/ui-bits";
import { money, reps } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/leaderboard")({
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const closers = [...reps].filter((r) => r.sold > 0).sort((a, b) => b.rev - a.rev);
  const setters = [...reps].filter((r) => (r.set ?? 0) > 0).sort((a, b) => (b.set ?? 0) - (a.set ?? 0));

  return (
    <Page className="space-y-4">
      <PageTitle title="Leaderboard" />
      <section className="rounded-sm bg-card p-4">
        <h2 className="mb-3 text-[13px] font-bold">Closers</h2>
        <ol className="space-y-2">
          {closers.map((r, i) => (
            <li key={r.name} className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2 text-[13px] md:grid-cols-[1.5rem_1fr_auto_auto] md:gap-3">
              <span className="text-[13px] font-bold text-muted">{i + 1}</span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{r.name}</p>
                <p className="text-[11px] text-muted">{r.office}</p>
              </div>
              <div className="flex flex-col items-end gap-0.5 md:contents">
                <span className="tabular-nums text-muted">
                  {r.sold} sold · {r.close}%
                </span>
                <b className="tabular-nums">{money(r.rev)}</b>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="rounded-sm bg-card p-4">
        <h2 className="mb-3 text-[13px] font-bold">Setters</h2>
        <ol className="space-y-2">
          {setters.map((r, i) => (
            <li key={r.name} className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-3 text-[13px]">
              <span className="text-[13px] font-bold text-muted">{i + 1}</span>
              <div>
                <p className="font-semibold">{r.name}</p>
                <p className="text-[11px] text-muted">{r.office}</p>
              </div>
              <b>{r.set} set</b>
            </li>
          ))}
        </ol>
      </section>
    </Page>
  );
}
