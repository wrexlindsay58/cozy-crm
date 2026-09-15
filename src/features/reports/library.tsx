import { Link } from "@tanstack/react-router";
import { SaturdayBoard } from "./board";
import { BUILT_IN, pinReport, useSavedReports } from "./store";

export function ReportLibrary() {
  const saved = useSavedReports();
  const pinned = saved.filter((r) => r.pinned);
  return (
    <div className="space-y-3">
      <SaturdayBoard />
      <div className="flex justify-end">
        <Link to="/reports/new" className="inline-flex h-11 items-center rounded-md bg-navy px-3 text-sm font-semibold text-card">New report</Link>
      </div>
      {pinned.length > 0 ? (
        <section className="rounded-md border border-line bg-card p-4">
          <h2 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Pinned</h2>
          <ul className="space-y-2 text-sm">
            {pinned.map((r) => (
              <li key={r.id}>
                <Link to="/reports/$reportId" params={{ reportId: r.id }} className="font-semibold hover:text-navy">{r.name}</Link>
                <span className="text-muted"> · {r.source} · {r.office}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="rounded-md border border-line bg-card p-4">
        <h2 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Library</h2>
        <ul className="divide-y divide-line">
          {BUILT_IN.map((r) => (
            <li key={r.id}>
              <Link to="/reports/$reportId" params={{ reportId: r.id }} className="flex items-baseline justify-between gap-3 py-2">
                <span>
                  <span className="font-semibold">{r.title}</span>
                  <span className="block text-sm text-muted">{r.note}</span>
                </span>
                <span className="text-xs font-bold tracking-wide text-muted uppercase">{r.group}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
