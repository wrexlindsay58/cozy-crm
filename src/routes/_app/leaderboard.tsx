import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { money, reps } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/leaderboard")({
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const closers = [...reps].filter((r) => r.sold > 0).sort((a, b) => b.rev - a.rev);
  const setters = [...reps].filter((r) => (r.set ?? 0) > 0).sort((a, b) => (b.set ?? 0) - (a.set ?? 0));

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-4 pb-10 md:p-5">
      <PageHeader kicker="Performance" title="Leaderboard" count="YTD" />
      <section className="rounded-xl border border-line bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold">Closers</h2>
        <ol className="space-y-2">
          {closers.map((r, i) => (
            <li key={r.name} className="grid grid-cols-[1.5rem_1fr_auto_auto] items-center gap-3 text-sm">
              <span className="text-xs font-bold text-muted">{i + 1}</span>
              <div>
                <p className="font-semibold">{r.name}</p>
                <p className="text-xs text-muted">{r.office}</p>
              </div>
              <span className="tabular-nums text-muted">{r.sold} sold · {r.close}%</span>
              <b className="tabular-nums">{money(r.rev)}</b>
            </li>
          ))}
        </ol>
      </section>
      <section className="rounded-xl border border-line bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold">Setters</h2>
        <ol className="space-y-2">
          {setters.map((r, i) => (
            <li key={r.name} className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-3 text-sm">
              <span className="text-xs font-bold text-muted">{i + 1}</span>
              <div>
                <p className="font-semibold">{r.name}</p>
                <p className="text-xs text-muted">{r.office}</p>
              </div>
              <b>{r.set} set</b>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
