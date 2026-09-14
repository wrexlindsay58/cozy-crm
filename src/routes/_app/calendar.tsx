import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatusPill } from "@/components/ui-bits";
import { appointments } from "@/lib/crm-data";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/_app/calendar")({
  component: CalendarPage,
});

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const START = 2; // Sep 2026 starts Tuesday
const LENGTH = 30;

function CalendarPage() {
  const [day, setDay] = useState(13);
  const cells = Array.from({ length: START + LENGTH }, (_, i) => {
    const d = i < START ? 0 : i - START + 1;
    return d;
  });
  while (cells.length % 7) cells.push(0);
  const onDay = appointments.filter((a) => a.day === day);

  return (
    <main className="mx-auto max-w-7xl p-4 pb-10 md:p-5">
      <PageHeader kicker="Ops" title="Calendar" count="September 2026" />
      <div className="grid gap-3 lg:grid-cols-[1.4fr_.9fr]">
        <section className="rounded-xl border border-line bg-card p-3 shadow-sm md:p-4">
          <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-bold tracking-wide text-muted uppercase">
            {DAYS.map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <div key={`e-${i}`} className="min-h-16" />;
              const marks = appointments.filter((a) => a.day === d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDay(d)}
                  className={cn(
                    "min-h-16 rounded-lg border p-1.5 text-left",
                    d === day ? "border-navy bg-navy text-card" : "border-line bg-page hover:border-navy/40",
                    d === 13 && d !== day && "ring-1 ring-navy/30",
                  )}
                >
                  <span className="text-xs font-bold">{d}</span>
                  <div className="mt-1 space-y-0.5">
                    {marks.slice(0, 2).map((m) => (
                      <p
                        key={m.id}
                        className={cn(
                          "truncate text-[10px] font-medium",
                          d === day ? "text-card/80" : "text-muted",
                        )}
                      >
                        {m.time} {m.name.split(" ")[0]}
                      </p>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
        <section className="rounded-xl border border-line bg-card p-4 shadow-sm">
          <h2 className="text-sm font-bold">Sep {day}</h2>
          <ul className="mt-3 space-y-2">
            {onDay.map((a) => (
              <li key={a.id} className="rounded-lg border border-line bg-page p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link to="/leads/$leadId" params={{ leadId: a.leadId }} className="font-semibold hover:text-navy">
                      {a.name}
                    </Link>
                    <p className="text-xs text-muted">
                      {a.time} · {a.city} · {a.closer}
                    </p>
                    <p className="mt-1 text-xs text-muted">{a.product}</p>
                  </div>
                  <StatusPill label={a.status} tone={a.tone} />
                </div>
              </li>
            ))}
            {onDay.length === 0 ? <li className="text-sm text-muted">Nothing on the book.</li> : null}
          </ul>
        </section>
      </div>
    </main>
  );
}
