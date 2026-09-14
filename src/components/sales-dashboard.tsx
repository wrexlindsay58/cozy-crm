import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Calendar,
  ChevronRight,
  FileText,
  Lightbulb,
  Lock,
  Users,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  drills,
  funnel,
  kpis,
  months,
  offices,
  products,
  ranges,
  rates,
} from "@/lib/sales-data";

const ICONS = [BarChart3, Users, Calendar, Lightbulb, FileText, Lock];
const KPI_PATH: Record<string, string> = {
  activities: "/tickets",
  leads: "/leads",
  appointments: "/calendar",
  opportunities: "/opportunities",
  projects: "/projects",
  accounts: "/accounts",
};

export function SalesDashboard() {
  const [range, setRange] = useState("Year");
  const [open, setOpen] = useState("appointments");
  const drill = drills[open];

  return (
    <main className="mx-auto max-w-7xl space-y-3 p-4 pb-10 md:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <select className="h-9 rounded-lg border border-line bg-card px-2 text-sm">
          <option>All dealers</option>
        </select>
        <select className="h-9 rounded-lg border border-line bg-card px-2 text-sm">
          <option>All members</option>
        </select>
        <div className="ml-auto flex flex-wrap rounded-lg border border-line bg-card p-0.5">
          {ranges.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide",
                range === r ? "bg-navy text-card" : "text-muted",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_240px_240px]">
        <article className="rounded-xl border border-line bg-card p-4 shadow-sm">
          <p className="text-[11px] font-bold tracking-widest text-muted uppercase">
            Sales revenue
          </p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight tabular-nums">
            $3,847,220
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-up-bg px-2 py-0.5 text-[11px] font-bold text-up">
              +18% vs last year
            </span>
            <span className="rounded-full bg-page px-2 py-0.5 text-[11px] font-semibold text-muted">
              Cash $3.62M
            </span>
            <span className="rounded-full bg-page px-2 py-0.5 text-[11px] font-semibold text-muted">
              Cancel $94.4k
            </span>
          </div>
          <div className="mt-4 flex h-24 items-end gap-1.5">
            {months.map((m) => (
              <div key={m.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <i
                  className={cn(
                    "block w-full max-w-7 rounded-t-sm",
                    m.peak ? "bg-data" : "bg-data-dim",
                  )}
                  style={{ height: `${m.h}%` }}
                />
                <span className="text-[9px] font-bold text-faint">{m.label}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-xl border border-line bg-card p-4 shadow-sm">
          <p className="text-[11px] font-bold tracking-widest text-muted uppercase">
            Avg. ticket
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight">$20,684</p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            186 closed projects YTD. Attic + air seal packages with HVAC
            changeouts pull the average up.
          </p>
        </article>
        <article className="rounded-xl border border-line bg-card p-4 shadow-sm">
          <p className="text-[11px] font-bold tracking-widest text-muted uppercase">
            Close rate on runs
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight">38%</p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            710 runs → 270 sold. Summer heat is carrying June–August.
          </p>
        </article>
      </section>

      <section className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k, i) => {
          const Icon = ICONS[i];
          return (
            <button
              key={k.key}
              type="button"
              onClick={() => setOpen(k.key)}
              className={cn(
                "rounded-xl border bg-card p-3.5 text-left shadow-sm",
                open === k.key ? "border-navy ring-1 ring-navy" : "border-line",
              )}
            >
              <span className="mb-2 grid size-7 place-items-center rounded-lg bg-navy text-card">
                <Icon className="size-3.5" />
              </span>
              <b className="block text-2xl font-extrabold tracking-tight tabular-nums">
                {k.n}
              </b>
              <span className="text-xs font-semibold text-muted">{k.l}</span>
            </button>
          );
        })}
      </section>

      {drill ? (
        <section className="rounded-xl border border-line bg-card p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">{drill.title} — drill-down</h2>
              <p className="text-xs text-muted">{drill.note}</p>
            </div>
            <Link to={KPI_PATH[open] as never} className="text-xs font-semibold text-navy">
              Open {drill.title.toLowerCase()} →
            </Link>
          </div>
          <div
            className={cn(
              "grid gap-2",
              drill.grid === "g3" ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4",
            )}
          >
            {drill.items.map((item) => (
              <div
                key={item.l}
                className={cn(
                  "rounded-lg border border-line bg-page px-3 py-2.5",
                  item.z && "opacity-50",
                  item.a && "border-navy bg-card",
                )}
              >
                <b className="block text-lg font-extrabold tabular-nums">{item.n}</b>
                <span className="text-[11px] font-semibold text-muted">{item.l}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-xl border border-line bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold">
            Product performance <span className="ml-2 text-xs font-semibold text-muted">Revenue</span>
          </h3>
          <div className="space-y-2.5">
            {products.map((p) => (
              <div key={p.name} className="grid grid-cols-[1fr_minmax(0,1fr)_4rem] items-center gap-2 text-xs">
                <span>{p.name}</span>
                <div className="h-4 overflow-hidden rounded bg-line">
                  <i className="block h-full bg-data" style={{ width: `${p.pct}%` }} />
                </div>
                <span className="text-right font-bold tabular-nums">{p.amt}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-xl border border-line bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold">Revenue by office</h3>
          <div className="space-y-2.5">
            {offices.map((o) => (
              <div key={o.name} className="grid grid-cols-[6rem_minmax(0,1fr)_4rem] items-center gap-2 text-xs">
                <span>{o.name}</span>
                <div className="h-2.5 overflow-hidden rounded-full bg-line">
                  <i className="block h-full bg-navy" style={{ width: `${o.pct}%` }} />
                </div>
                <span className="text-right font-bold tabular-nums">{o.amt}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-3 lg:grid-cols-[1.3fr_.85fr_.85fr]">
        <article className="rounded-xl border border-line bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold">Conversion path</h3>
          <div className="flex items-center">
            {funnel.map((n, i) => (
              <div key={n.l} className="flex flex-1 items-center">
                <div className="flex-1 text-center">
                  <b className="block text-xl font-extrabold tracking-tight">{n.n}</b>
                  <span className="text-[11px] font-semibold text-muted">{n.l}</span>
                  <small className="mt-0.5 block text-[10px] text-faint">{n.r}</small>
                </div>
                {i < funnel.length - 1 ? (
                  <ChevronRight className="size-4 shrink-0 text-faint" />
                ) : null}
              </div>
            ))}
          </div>
          <p className="mt-3 rounded-lg bg-page px-3 py-2 text-xs text-muted">
            <strong className="text-ink">Leak:</strong> 216 set appointments never
            ran. 41 unmarked still sitting in the book.
          </p>
        </article>
        <article className="rounded-xl border border-line bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold">Rates</h3>
          <div className="space-y-3">
            {rates.map((r) => (
              <div key={r.l} className="grid grid-cols-[3.5rem_1fr_2.5rem] items-center gap-2 text-xs">
                <span>{r.l}</span>
                <div className="h-2.5 overflow-hidden rounded-full bg-line">
                  <i className="block h-full bg-navy" style={{ width: `${r.pct}%` }} />
                </div>
                <em className="text-right not-italic font-bold">{r.v}</em>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-xl border border-line bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold">Sample size</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] font-semibold text-muted">Leads / close</div>
              <b className="text-2xl font-extrabold">6.8</b>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-muted">Sales cycle</div>
              <b className="text-2xl font-extrabold">11 days</b>
            </div>
          </div>
          <p className="mt-3 rounded-lg bg-page px-3 py-2 text-xs text-muted">
            n = 270 sold. Cycle is lead-created to signed contract.
          </p>
        </article>
      </section>
      <p className="pt-2 text-center text-[11px] text-faint">Cozy © 2025 – 2026</p>
    </main>
  );
}
