import { cn } from "@/lib/cn";
import { money } from "@/lib/crm-data";
import { PageTitle } from "@/components/ui-bits";
import { BookPick } from "@/features/book/pick";
import { setBookDay, shiftBookDay, useBookDay } from "@/features/book/day";
import { TODAY, addDays, toIso } from "@/features/book/time";
import { useBook } from "@/features/book/store";
import { useRoster } from "@/features/book/roster";
import { useOps } from "@/features/ops/store";
import { buildToday } from "@/features/today/live";
import { useMemo, useState } from "react";

function clockHour(cursor: Date) {
  const a = toIso(cursor).slice(0, 10);
  const b = toIso(TODAY).slice(0, 10);
  if (a === b) return 18;
  if (a < b) return 22;
  return 6;
}

function initials(name: string) {
  const p = name.replace(/^Crew \d+ — /, "").split(" ").filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || name.slice(0, 2).toUpperCase();
}

function Meter({ label, fact, score }: { label: string; fact: string; score: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  const tone = score < 40 ? "var(--color-stop)" : score < 65 ? "var(--color-watch)" : "var(--color-navy)";
  return (
    <div className="flex items-center gap-4 px-5 py-5">
      <svg width="92" height="92" viewBox="0 0 92 92" aria-hidden className="shrink-0">
        <circle cx="46" cy="46" r={r} fill="none" stroke="var(--color-page)" strokeWidth="9" />
        <circle
          cx="46"
          cy="46"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 46 46)"
        />
        <text x="46" y="52" textAnchor="middle" fill="currentColor" style={{ font: "700 18px IBM Plex Sans, ui-sans-serif, sans-serif" }}>
          {score}
        </text>
      </svg>
      <div className="min-w-0">
        <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{label}</p>
        <p className="mt-0.5 text-[18px] leading-tight font-bold">{fact}</p>
      </div>
    </div>
  );
}

export function TodayBoard() {
  const events = useBook();
  const roster = useRoster();
  const { leads } = useOps();
  const cursor = useBookDay();
  const [office, setOffice] = useState<"all" | "PHX" | "DFW">("all");
  const dayKey = toIso(cursor).slice(0, 10);
  const yestKey = toIso(addDays(cursor, -1)).slice(0, 10);
  const hour = clockHour(cursor);
  const t = useMemo(
    () => buildToday({ events, leads, roster, dayKey, yestKey, hour, office }),
    [events, leads, roster, dayKey, yestKey, hour, office],
  );
  const maxBar = Math.max(t.sold, t.yesterday, 1);
  const mixMax = Math.max(...t.mix.map((m) => m.n), 1);
  const stripMax = Math.max(...t.strip.map((s) => s.n), 1);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-page">
      <header className="flex min-h-14 shrink-0 flex-wrap items-center gap-2 border-b border-line bg-card px-4">
        <PageTitle
          title="Today"
          flush
          actions={
            <BookPick
              value={office}
              onChange={setOffice}
              items={[
                { id: "all", label: "All markets" },
                { id: "PHX", label: "Phoenix" },
                { id: "DFW", label: "Dallas" },
              ]}
            />
          }
        />
      </header>

      <div className="flex shrink-0 items-center gap-2 border-b border-line bg-card px-4 py-2">
        <button type="button" className="h-8 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => shiftBookDay(-1)}>
          Prev
        </button>
        <button type="button" className="h-8 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => setBookDay(new Date(TODAY))}>
          Today
        </button>
        <button type="button" className="h-8 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => shiftBookDay(1)}>
          Next
        </button>
        <p className="text-sm font-semibold">{cursor.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
      </div>

      <p className="shrink-0 border-b border-line bg-card px-4 py-1.5 text-center text-[13px] tabular-nums">
        <span className="font-bold">{t.soldN}</span>
        <span className="text-muted"> sold</span>
        <span className="text-muted"> · </span>
        <span className="font-bold">{money(t.onBook)}</span>
        <span className="text-muted"> on the book</span>
        {t.behindN ? (
          <>
            <span className="text-muted"> · </span>
            <span className="font-bold text-stop">{t.behindN}</span>
            <span className="text-muted"> behind</span>
          </>
        ) : null}
        <span className="text-muted"> · </span>
        <span className="font-bold">{t.sitsLeft.length}</span>
        <span className="text-muted"> sits left</span>
      </p>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="space-y-3 bg-page p-3">
        <section className="overflow-hidden rounded-md bg-card">
          <div className="grid grid-cols-2 divide-x divide-y divide-line lg:grid-cols-4 lg:divide-y-0">
            {t.meters.map((m) => (
              <Meter key={m.label} {...m} />
            ))}
          </div>
        </section>

        <section className="rounded-md bg-card px-5 py-4">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Day</p>
            <p className="text-[12px] text-muted">Now {t.hour}:00</p>
          </div>
          <div className="relative flex h-24 items-end gap-1">
            {t.strip.map((s) => (
              <div key={s.h} className="relative flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
                {s.h === t.hour ? <i className="absolute inset-x-0 -top-1 bottom-4 border-l-2 border-navy" /> : null}
                <div
                  className={cn(
                    "w-full max-w-5 rounded-sm",
                    s.h === t.hour ? "bg-navy" : s.prod ? "bg-navy-2" : s.sales ? "bg-navy/80" : "bg-page",
                  )}
                  style={{ height: `${12 + (s.n / stripMax) * 56}px` }}
                  title={`${s.h}:00 · ${s.n}`}
                />
                <span className={cn("text-[10px] tabular-nums", s.h === t.hour ? "font-bold text-navy" : "text-faint")}>{s.h}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-line lg:grid-cols-4">
          <MoneyCell label="On the book" value={t.onBook} note={`${t.sitsLeft.length} sits left`} />
          <MoneyCell label="Sold" value={t.sold} note={`${t.soldN} deals · Yesterday ${money(t.yesterday)}`} bar={t.sold / maxBar} prior={t.yesterday / maxBar} />
          <MoneyCell label="In" value={t.cashIn} note="Deposits and funded" />
          <MoneyCell label="Out" value={t.spent} hot={t.spent > t.cashIn} note={t.cashOut.map((r) => r.name).join(" · ")} />
        </section>
        </div>

        <div className="grid lg:grid-cols-2">
          <ListBlock title="Late" count={t.fire.length}>
            {t.fire.length === 0 ? <p className="px-4 py-3 text-[13px] text-muted">Board is clean.</p> : null}
            <ul>
              {t.fire.map((f) => (
                <li key={f.id} className="border-b border-line last:border-b-0">
                  <a href={f.href} className="flex items-start gap-2 border-l-4 border-l-transparent px-3 py-2.5 hover:bg-page">
                    <i className={cn("mt-2 size-2 shrink-0 rounded-full", f.stop ? "bg-stop" : "bg-watch")} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{f.title}</span>
                      <span className="block text-[11px] text-muted">{f.detail}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </ListBlock>
          <ListBlock title="Sits" count={t.sitsLeft.length}>
            {t.sitsLeft.length === 0 ? <p className="px-4 py-3 text-[13px] text-muted">No sits left.</p> : null}
            <ul>
              {t.sitsLeft.map((s) => (
                <li key={s.id} className="border-b border-line last:border-b-0">
                  <a href={s.href} className="grid grid-cols-[4.5rem_1fr_auto] items-baseline gap-2 px-4 py-2.5 hover:bg-page">
                    <span className="text-sm font-semibold tabular-nums">{s.time}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{s.name}</span>
                      <span className="block truncate text-[11px] text-muted">
                        {s.city} · {s.who} · {s.status}
                      </span>
                    </span>
                    {s.amount ? <span className="text-[11px] font-semibold tabular-nums text-muted">{money(s.amount)}</span> : null}
                  </a>
                </li>
              ))}
            </ul>
          </ListBlock>
        </div>

        <div className="grid lg:grid-cols-2">
          <ListBlock title="Street" count={t.street.length}>
            {t.street.length === 0 ? <p className="px-4 py-3 text-[13px] text-muted">No crews out.</p> : null}
            <ul>
              {t.street.map((s) => (
                <li key={s.id} className="border-b border-line last:border-b-0">
                  <a href={s.href} className="grid grid-cols-[4.5rem_1fr] items-baseline gap-2 px-4 py-2.5 hover:bg-page">
                    <span className="text-sm font-semibold tabular-nums">{s.time}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{s.name}</span>
                      <span className="block truncate text-[11px] text-muted">
                        {s.who} · {s.city} · {s.status}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </ListBlock>
          <ListBlock title="People" count={t.people.length}>
            <ul>
              {t.people.map((p) => (
                <li key={p.id} className="border-b border-line last:border-b-0">
                  <a href={p.href} className="flex items-start gap-2 border-l-4 border-l-transparent px-3 py-2.5 hover:bg-page">
                    <span className="relative grid size-9 shrink-0 place-items-center rounded-md bg-navy text-[10px] font-bold text-card">
                      {initials(p.name)}
                      {p.late ? <i className="absolute -top-1 -right-1 size-2.5 rounded-full border-2 border-card bg-stop" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-semibold">{p.name}</span>
                        <span className={cn("text-[11px] font-semibold", p.late ? "text-stop" : "text-muted")}>{p.fact}</span>
                      </span>
                      <span className="text-[11px] text-muted">{p.role}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </ListBlock>
        </div>

        <section className="border-t border-line bg-card px-4 py-4">
          <p className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Mix</p>
          <ul className="space-y-2">
            {t.mix.map((m) => (
              <li key={m.label} className="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-3 text-[13px]">
                <span className="font-semibold">{m.label}</span>
                <span className="h-2 overflow-hidden rounded-sm bg-page">
                  <i className="block h-full bg-navy" style={{ width: `${(m.n / mixMax) * 100}%` }} />
                </span>
                <span className="text-right font-semibold tabular-nums">{m.n}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid border-t border-line lg:grid-cols-2">
          <ListBlock title="Reviews" count={t.reviews.length}>
            <ul>
              {t.reviews.map((r) => (
                <li key={r.id} className="border-b border-line px-4 py-2.5 last:border-b-0">
                  <p className="text-sm font-semibold">
                    {r.stars} star{r.stars === 1 ? "" : "s"} · {r.name}
                  </p>
                  <p className="text-[11px] text-muted">{r.text}</p>
                </li>
              ))}
            </ul>
          </ListBlock>
          <ListBlock title="Tickets" count={t.tickets.length}>
            <ul>
              {t.tickets.map((k) => (
                <li key={k.id} className="border-b border-line last:border-b-0">
                  <a href="/tickets" className="flex justify-between gap-2 px-4 py-2.5 hover:bg-page">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{k.title}</span>
                      <span className="text-[11px] text-muted">
                        {k.owner} · {k.age}
                      </span>
                    </span>
                    <span className={cn("shrink-0 text-[11px] font-semibold", k.priority === "High" ? "text-stop" : "text-muted")}>{k.priority}</span>
                  </a>
                </li>
              ))}
            </ul>
          </ListBlock>
        </div>
      </div>
    </div>
  );
}

function MoneyCell({ label, value, note, hot, bar, prior }: { label: string; value: number; note?: string; hot?: boolean; bar?: number; prior?: number }) {
  return (
    <div className={cn("bg-card px-5 py-5", hot && "bg-stop-bg")}>
      <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{label}</p>
      <p className={cn("mt-1 text-[28px] leading-none font-bold tabular-nums", hot && "text-stop")}>{money(value)}</p>
      {bar != null ? (
        <div className="mt-3 space-y-1.5">
          <span className="flex items-center gap-2">
            <span className="w-10 text-[10px] font-bold text-muted uppercase">Today</span>
            <span className="h-2 flex-1 overflow-hidden rounded-sm bg-page">
              <i className="block h-full bg-navy" style={{ width: `${Math.max(8, bar * 100)}%` }} />
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-10 text-[10px] font-bold text-muted uppercase">Yest</span>
            <span className="h-2 flex-1 overflow-hidden rounded-sm bg-page">
              <i className="block h-full bg-navy-2" style={{ width: `${Math.max(8, (prior ?? 0) * 100)}%` }} />
            </span>
          </span>
        </div>
      ) : null}
      {note ? <p className="mt-2 text-[12px] text-muted">{note}</p> : null}
    </div>
  );
}

function ListBlock({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="border-b border-line bg-card lg:border-r lg:last:border-r-0">
      <h2 className="border-b border-line px-4 py-2.5 text-[13px] font-bold">
        {title} <span className="ml-1 font-semibold text-muted">{count}</span>
      </h2>
      {children}
    </section>
  );
}
