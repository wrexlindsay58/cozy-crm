import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/cn";
import { PageTitle } from "@/components/ui-bits";
import { drills, funnel, kpis, months, offices, products, ranges } from "@/lib/sales-data";

const KPI_PATH: Record<string, string> = {
  leads: "/leads",
  appointments: "/appointments",
  opportunities: "/opportunities",
  projects: "/projects",
};

export function SalesDashboard() {
  const [range, setRange] = useState("Year");
  const [open, setOpen] = useState("appointments");
  const [showMore, setShowMore] = useState(false);
  const drill = drills[open];

  return (
    <main className="h-full min-w-0 space-y-4 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
      <PageTitle
        title="Sales"
        actions={
          <div className="flex flex-wrap rounded-sm bg-card p-0.5">
            {ranges.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={cn("h-8 rounded-sm px-3 text-[13px] font-semibold", range === r ? "bg-navy text-card" : "text-muted")}
              >
                {r}
              </button>
            ))}
          </div>
        }
      />
      <p className="-mt-2 mb-4 text-[13px] text-muted">Year money. Range, mix, funnel. Not this morning’s book.</p>

      <section className="grid gap-2 sm:grid-cols-3">
        <article className="rounded-sm bg-card p-4">
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">YTD</p>
          <p className="text-[36px] font-bold tabular-nums tracking-tight">$3,847,220</p>
          <p className="mt-1 text-[13px] tabular-nums text-muted">+18%</p>
        </article>
        <article className="rounded-sm bg-card p-4">
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Week</p>
          <p className="text-[36px] font-bold tabular-nums tracking-tight">$412,400</p>
        </article>
        <article className="rounded-sm bg-stop-bg p-4">
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Cancel</p>
          <p className="text-[36px] font-bold tabular-nums tracking-tight text-stop">$94,400</p>
        </article>
      </section>

      <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <button
            key={k.key}
            type="button"
            onClick={() => {
              setOpen(k.key);
              setShowMore(false);
            }}
            className={cn("rounded-sm p-4 text-left", open === k.key ? "border-l-4 border-l-navy bg-info-bg" : "bg-card")}
          >
            <b className="block text-[28px] font-bold tabular-nums tracking-tight">{k.n}</b>
            <span className="text-[13px] font-semibold text-muted">{k.l}</span>
          </button>
        ))}
      </section>

      {drill ? (
        <section className="rounded-sm bg-card p-4">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[13px] font-bold">{drill.title}</h2>
            <Link to={KPI_PATH[open] as never} className="text-[13px] font-semibold text-navy">
              Open
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {drill.items.map((item) => (
              <div
                key={item.l}
                className={cn(
                  "rounded-sm px-3 py-2",
                  item.stop || item.l === "Unmarked" || item.l === "No sit" || item.l === "Missed" || item.l === "One legger"
                    ? "bg-stop-bg"
                    : "bg-page",
                )}
              >
                <b className={cn("block text-[20px] font-bold tabular-nums", (item.stop || item.l === "Unmarked") && "text-stop")}>
                  {item.n}
                </b>
                <span className="text-[11px] font-semibold text-muted">{item.l}</span>
              </div>
            ))}
          </div>
          {drill.more ? (
            <div className="mt-3">
              <button type="button" className="text-[13px] font-semibold text-navy" onClick={() => setShowMore((v) => !v)}>
                {showMore ? "Hide" : "More"}
              </button>
              {showMore ? (
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {drill.more.map((item) => (
                    <div key={item.l} className="rounded-sm bg-page px-3 py-2">
                      <b className="block text-[20px] font-bold tabular-nums">{item.n}</b>
                      <span className="text-[11px] font-semibold text-muted">{item.l}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-sm bg-card p-4">
          <h3 className="mb-3 text-[13px] font-bold">Product</h3>
          <div className="space-y-2">
            {products.map((p) => (
              <div key={p.name} className="grid grid-cols-[1fr_minmax(0,1fr)_4.5rem] items-center gap-2 text-[13px]">
                <span>{p.name}</span>
                <div className="h-2 overflow-hidden rounded-sm bg-page">
                  <i className="block h-full bg-navy" style={{ width: `${p.pct}%` }} />
                </div>
                <span className="text-right font-bold tabular-nums">{p.amt}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-sm bg-card p-4">
          <h3 className="mb-3 text-[13px] font-bold">Office</h3>
          <div className="space-y-2">
            {offices.map((o) => (
              <div key={o.name} className="grid grid-cols-[6.5rem_minmax(0,1fr)_4.5rem] items-center gap-2 text-[13px]">
                <span>{o.name}</span>
                <div className="h-2 overflow-hidden rounded-sm bg-page">
                  <i className="block h-full bg-navy" style={{ width: `${o.pct}%` }} />
                </div>
                <span className="text-right font-bold tabular-nums">{o.amt}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-sm bg-card p-4">
        <h3 className="mb-3 text-[13px] font-bold">Path</h3>
        <div className="grid grid-cols-5 gap-2">
          {funnel.map((n) => (
            <div key={n.l} className="rounded-sm bg-page px-2 py-2 text-center">
              <b className="block text-[20px] font-bold tabular-nums">{n.n}</b>
              <span className="text-[11px] font-semibold text-muted">{n.l}</span>
              <span className="mt-1 block text-[11px] text-muted">{n.r}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 rounded-sm bg-stop-bg px-3 py-2 text-[13px]">216 set never ran. 41 unmarked.</p>
      </section>

      <section className="rounded-sm bg-card p-4">
        <h3 className="mb-3 text-[13px] font-bold">Month</h3>
        <div className="flex h-24 items-end gap-1">
          {months.map((m) => (
            <div key={m.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <i className="block w-full max-w-7 bg-navy" style={{ height: `${m.h}%` }} />
              <span className="text-[11px] font-bold text-muted">{m.label}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
