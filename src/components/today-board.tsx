import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/cn";
import { money, projects, tickets } from "@/lib/crm-data";
import { ExceptionRow, PageTitle, wash } from "@/components/ui-bits";
import { cashOut, crews, incidents, notCalled, snapshot as s, tonightRuns } from "@/lib/snapshot";

export function TodayBoard() {
  const openTickets = tickets.filter((t) => t.status !== "Complete" && t.status !== "Cancel");
  const jobsSoon = projects.filter((p) => p.status === "Scheduled").slice(0, 3);
  const cashWatch = s.cashOutToday > s.cashInToday;

  return (
    <main className="h-full min-w-0 overflow-x-hidden overflow-y-auto p-4">
      <PageTitle title="Today" count={`${incidents.length + notCalled.length} late`} />
      <p className="mb-4 text-[13px] text-muted">Late names. Tonight’s book. Cash that moves. Year money is Sales.</p>

      <section id="late" className="mb-4 rounded-sm bg-card">
        <h2 className="px-4 pt-4 text-[13px] font-bold">
          Late <span className="ml-1 font-semibold text-stop">{incidents.length + notCalled.length}</span>
        </h2>
        <ul className="mt-2">
          {incidents.map((i) => (
            <li key={i.id}>
              <Link to={i.to} params={i.params as never} className={cn("flex items-start gap-3 px-4", wash(i.flag))}>
                <i className={cn("mt-2 h-8 w-1 shrink-0", i.flag === "stop" ? "bg-stop" : "bg-watch")} />
                <span className="min-w-0 flex-1 py-2">
                  <span className="block text-[13px] font-semibold">{i.title}</span>
                  <span className="block text-[11px] text-muted">{i.detail}</span>
                </span>
              </Link>
            </li>
          ))}
          {notCalled.map((l) => (
            <li key={l.id}>
              <ExceptionRow name={l.name} fact={`Not called · ${l.age} · ${l.source}`} flag="watch" href={`/leads/${l.id}`} />
            </li>
          ))}
        </ul>
      </section>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-sm bg-card p-4">
          <h2 className="mb-2 text-[13px] font-bold">Tonight</h2>
          <ul className="divide-y divide-line">
            {tonightRuns.map((r) => (
              <li key={r.id} className="grid grid-cols-[4.5rem_1fr] items-baseline gap-3 py-2 text-[13px]">
                <span className="font-semibold tabular-nums">{r.time}</span>
                <span className="min-w-0">
                  {r.leadId ? (
                    <Link to="/leads/$leadId" params={{ leadId: r.leadId }} className="font-semibold hover:text-navy">
                      {r.name}
                    </Link>
                  ) : (
                    <span className="font-semibold">{r.name}</span>
                  )}
                  <span className="mt-1 block text-[11px] text-muted">
                    {r.city} · {r.closer}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-sm bg-card p-4">
          <h2 className="mb-2 text-[13px] font-bold">On the street</h2>
          <ul className="mb-3 divide-y divide-line text-[13px]">
            {jobsSoon.map((p) => (
              <li key={p.id} className="flex justify-between gap-3 py-2">
                <Link to="/projects/$projectId" params={{ projectId: p.id }} className="font-semibold hover:text-navy">
                  {p.name}
                </Link>
                <span className="shrink-0 text-muted">{p.install}</span>
              </li>
            ))}
          </ul>
          <h3 className="mb-2 text-[11px] font-bold tracking-wide text-muted uppercase">Crews</h3>
          <ul className="grid grid-cols-3 gap-2">
            {crews.map((c) => (
              <li key={c.name} className="rounded-sm bg-page px-3 py-2">
                <p className="text-[13px] font-semibold">{c.name}</p>
                <p className="text-[11px] text-muted">{c.job === "Off" ? "At shop" : c.job}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-sm bg-line lg:grid-cols-4">
        <div className="bg-card p-4">
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Sold today</p>
          <p className="text-[20px] font-bold tabular-nums">{money(s.salesToday)}</p>
          <p className="mt-1 text-[11px] text-muted">Yesterday {money(s.salesYesterday)}</p>
        </div>
        <div className="bg-card p-4">
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Cash in</p>
          <p className="text-[20px] font-bold tabular-nums">{money(s.cashInToday)}</p>
        </div>
        <div className={cn("p-4", cashWatch ? "bg-stop-bg" : "bg-card")}>
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Cash out</p>
          <p className={cn("text-[20px] font-bold tabular-nums", cashWatch && "text-stop")}>{money(s.cashOutToday)}</p>
          <p className="mt-1 text-[11px] text-muted">{cashOut.map((r) => r.name).join(" · ")}</p>
        </div>
        <div className="bg-card p-4">
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Open tickets</p>
          <p className="text-[20px] font-bold tabular-nums">{openTickets.length}</p>
          <Link to="/tickets" className="mt-1 block text-[11px] font-semibold text-navy">
            Oldest {openTickets[0]?.age}
          </Link>
        </div>
      </section>

      <p className="text-[13px] text-muted">
        Week sold {money(s.salesWeek)}.{" "}
        <Link to="/scoreboard" className="font-semibold text-navy">
          Year, mix, and funnel live on Sales.
        </Link>
      </p>
    </main>
  );
}
