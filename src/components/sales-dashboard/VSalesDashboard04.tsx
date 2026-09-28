import { numClass, Pip, Delta } from "./bits-01";
import { useSalesDashboard3 } from "./useSalesDashboard3";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/cn";

export function VSalesDashboard04({ bag }: { bag: ReturnType<typeof useSalesDashboard3> }) {
  const { kpis, leftover, open, picked, setOpen, setPicked, sources, t } = bag;
  return (
    <>
<section className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-line lg:grid-cols-4">
        {kpis.map((k) => (
          <button
            key={k.key}
            type="button"
            onClick={() => { setOpen(k.key); setPicked(`kpi-${k.key}`); }}
            className={cn("bg-card p-4 text-left", picked === `kpi-${k.key}` && "shadow-[inset_3px_0_0_0_var(--color-navy)]")}
          >
            <b className={cn("block text-[28px] font-bold tabular-nums tracking-tight", numClass(k.n, k.prior))}>{k.n.toLocaleString()}</b>
            <span className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-muted">
              {k.l}
              <Pip now={k.n} yest={k.prior} />
            </span>
            <span className="mt-1 block text-[12px] text-muted">
              <Delta now={k.n} was={k.prior} /> vs {t.vs}
            </span>
          </button>
        ))}
      </section>

      {open === "appointments" ? (
        <section className="rounded-md bg-card p-5">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h2 className="text-[13px] font-bold">Appointments</h2>
            <Link to="/appointments" className="text-[13px] font-semibold text-navy">
              Open
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: t.unmarked, l: "Unmarked", stop: true },
              { n: t.nosit, l: "No run" },
              { n: t.missed, l: "Missed" },
              { n: t.oneleg, l: "One legger" },
              { n: t.runs, l: "Ran" },
              { n: leftover, l: "Still set" },
              { n: t.deals, l: "Sold" },
              { n: t.cancelledN, l: "Cancelled" },
            ].map((item) => (
              <div key={item.l} className="rounded-sm bg-page px-3 py-2">
                <b className={cn("block text-[20px] font-bold tabular-nums", item.stop && item.n ? "text-stop" : "")}>{item.n}</b>
                <span className="text-[11px] font-semibold text-muted">{item.l}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {open === "leads" ? (
        <section className="rounded-md bg-card p-5">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h2 className="text-[13px] font-bold">Leads</h2>
            <Link to="/leads" className="text-[13px] font-semibold text-navy">
              Open
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {sources.map((s) => (
              <div key={s.name} className="rounded-sm bg-page px-3 py-2">
                <b className="block text-[20px] font-bold tabular-nums">{s.leads}</b>
                <span className="text-[11px] font-semibold text-muted">{s.name}</span>
              </div>
            ))}
            <div className="rounded-sm bg-page px-3 py-2">
              <b className={cn("block text-[20px] font-bold tabular-nums", t.leadSplit[1]?.n ? "text-watch" : "")}>{t.leadSplit[1]?.n ?? 0}</b>
              <span className="text-[11px] font-semibold text-muted">Not called</span>
            </div>
          </div>
        </section>
      ) : null}

      {open === "opportunities" ? (
        <section className="rounded-md bg-card p-5">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h2 className="text-[13px] font-bold">Runs</h2>
            <Link to="/opportunities" className="text-[13px] font-semibold text-navy">
              Open
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: t.runs, l: "Ran" },
              { n: t.deals, l: "Sold" },
              { n: Math.max(t.runs - t.deals, 0), l: "No deal" },
              { n: t.oneleg, l: "One legger" },
            ].map((item) => (
              <div key={item.l} className="rounded-sm bg-page px-3 py-2">
                <b className="block text-[20px] font-bold tabular-nums">{item.n}</b>
                <span className="text-[11px] font-semibold text-muted">{item.l}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
