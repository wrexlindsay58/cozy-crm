import type { Activity } from "@/lib/crm-data";
import { timeOf, groupByDay } from "./part-01";

export function HistoryList({ history, flush }: { history: Activity[]; flush?: boolean }) {
  const groups = groupByDay(history);
  const body =
    history.length === 0 ? (
      <p className="text-sm text-muted">Nothing logged yet.</p>
    ) : (
      <div className="space-y-4">
        {groups.map((g) => (
          <section key={g.day}>
            <h3 className="mb-2 text-[11px] font-bold tracking-wide text-muted uppercase">{g.day}</h3>
            <ol className="relative ml-2 border-l-2 border-line">
              {g.rows.map((a) => (
                <li key={`${a.at}-${a.what}`} className="relative pb-4 pl-5 last:pb-0">
                  <span className="absolute top-1.5 -left-[5px] size-2.5 rounded-full bg-navy" />
                  <p className="text-[11px] font-semibold text-muted">
                    {timeOf(a.at)} · {a.who}
                  </p>
                  <p className="mt-0.5 text-sm">{a.what}</p>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    );
  if (flush) return body;
  return (
    <section className="mt-4 rounded-md border border-line bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">History</h2>
      {body}
    </section>
  );
}
