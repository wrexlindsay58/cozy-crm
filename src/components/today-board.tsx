import { cn } from "@/lib/cn";
import { money } from "@/lib/crm-data";
import { PageTitle } from "@/components/ui-bits";
import { BookPick } from "@/features/book/pick";
import { TODAY, addDays, toIso } from "@/features/book/time";
import { useBook } from "@/features/book/store";
import { useRoster } from "@/features/book/roster";
import { useOps } from "@/features/ops/store";
import { buildToday, type Mark, type Split, type Trend } from "@/features/today/live";
import { useMemo, useState } from "react";

function markClass(m?: Mark) {
  if (m === "go") return "text-go";
  if (m === "watch") return "text-watch";
  if (m === "stop") return "text-stop";
  return "";
}

function pipMark(now: number, yest: number): Mark | undefined {
  if (now === yest) return undefined;
  if (now > yest) return "go";
  if (now <= yest * 0.8) return "stop";
  return "watch";
}

function Pip({ now, yest }: { now: number; yest: number }) {
  const mark = pipMark(now, yest);
  const fill = mark === "go" ? "var(--color-go)" : mark === "stop" ? "var(--color-stop)" : mark === "watch" ? "var(--color-watch)" : "var(--color-idle)";
  const label = now === yest ? "Even with this hour yesterday" : now > yest ? "Ahead of this hour yesterday" : "Behind this hour yesterday";
  if (now === yest) {
    return <i className="inline-block size-1.5 rounded-full bg-idle" title={label} />;
  }
  return (
    <svg viewBox="0 0 10 10" className="size-2.5 shrink-0" aria-label={label}>
      {now > yest ? <path d="M5 1.5 9 8.5H1Z" fill={fill} /> : <path d="M5 8.5 9 1.5H1Z" fill={fill} />}
    </svg>
  );
}

function Track({ now, yest, goal, money: isMoney }: Trend) {
  const fmt = (n: number) => (isMoney ? money(n) : String(n));
  if (!goal) {
    return <p className="mt-2 text-[11px] tabular-nums text-muted">Yest {fmt(yest)} at this hour</p>;
  }
  const cap = Math.max(goal, now, yest, 1);
  return (
    <div className="mt-2">
      <div className="relative h-2 rounded-sm bg-page">
        <i className="absolute inset-y-0 left-0 rounded-sm bg-navy" style={{ width: `${Math.min(100, (now / cap) * 100)}%` }} />
        <i
          className="absolute top-[-3px] h-3.5 w-0.5 bg-idle"
          style={{ left: `clamp(0%, calc(${(yest / cap) * 100}% - 1px), 100%)` }}
          title={`Yesterday this hour ${fmt(yest)}`}
        />
        <i
          className="absolute top-[-3px] h-3.5 w-0.5 bg-ink"
          style={{ left: `clamp(0%, calc(${(goal / cap) * 100}% - 1px), 100%)` }}
          title={`Goal ${fmt(goal)}`}
        />
      </div>
      <p className="mt-1 flex justify-between gap-2 text-[10px] tabular-nums text-muted">
        <span>Yest {fmt(yest)}</span>
        <span>Goal {fmt(goal)}</span>
      </p>
    </div>
  );
}

function Cell({
  label,
  value,
  note,
  trend,
  mark,
}: {
  label: string;
  value: string;
  note?: string;
  trend: Trend;
  mark?: Mark;
}) {
  return (
    <div className="bg-card px-5 py-5">
      <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
        {label}
        <Pip now={trend.now} yest={trend.yest} />
      </p>
      <p className={cn("mt-1 text-[28px] leading-none font-bold tabular-nums", markClass(mark))}>{value}</p>
      <Track {...trend} />
      {note ? <p className="mt-1 text-[12px] text-muted">{note}</p> : null}
    </div>
  );
}

function Stack({ title, rows, caption, trend }: { title: string; rows: Split[]; caption?: string; trend?: Trend }) {
  const total = Math.max(rows.reduce((s, r) => s + r.n, 0), 1);
  return (
    <section className="rounded-md bg-card px-5 py-4">
      <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
        {title}
        {trend ? <Pip now={trend.now} yest={trend.yest} /> : null}
      </p>
      {caption ? <p className="mt-0.5 text-[12px] text-muted">{caption}</p> : null}
      <div className="mt-3 flex h-5 overflow-hidden rounded-sm bg-page">
        {rows.map((r) =>
          r.n ? (
            <span
              key={r.label}
              className="h-full"
              style={{ width: `${(r.n / total) * 100}%`, background: r.tone }}
              title={`${r.label}: ${r.n} · ${r.pct}%`}
            />
          ) : null,
        )}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
        {rows.map((r) => (
          <li key={r.label} className="inline-flex items-center gap-1.5">
            <i className="size-2.5 rounded-sm" style={{ background: r.tone }} />
            <span className="font-semibold">{r.label}</span>
            <span className={cn("tabular-nums", r.mark ? markClass(r.mark) : "text-muted")}>
              {r.n} · {r.pct}%
            </span>
          </li>
        ))}
      </ul>
      {trend ? <Track {...trend} /> : null}
    </section>
  );
}

function Stars({ n, tone }: { n: number; tone?: "gold" | "silver" | "bronze" }) {
  const fill =
    tone === "gold" || n >= 5
      ? "#C4A35A"
      : tone === "silver" || n === 4
        ? "#8AA0AB"
        : tone === "bronze" || n === 3
          ? "#A67C52"
          : n <= 1
            ? "var(--color-stop)"
            : "var(--color-navy)";
  return (
    <span className="inline-flex gap-0.5" aria-label={`${n} stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className="size-3.5 shrink-0" aria-hidden>
          <path d="M12 2.6 14.7 8.4l6.4.9-4.6 4.5 1.1 6.4L12 17.2 6.4 20.2l1.1-6.4L2.9 9.3l6.4-.9L12 2.6z" fill={i <= n ? fill : "var(--color-page)"} />
        </svg>
      ))}
    </span>
  );
}

export function TodayBoard() {
  const events = useBook();
  const roster = useRoster();
  const { leads } = useOps();
  const [office, setOffice] = useState<"all" | "PHX" | "DFW">("all");
  const dayKey = toIso(TODAY).slice(0, 10);
  const yestKey = toIso(addDays(TODAY, -1)).slice(0, 10);
  const t = useMemo(
    () => buildToday({ events, leads, roster, dayKey, yestKey, hour: 18, office }),
    [events, leads, roster, dayKey, yestKey, office],
  );
  const stripMax = Math.max(...t.strip.map((s) => Math.max(s.sales + s.prod, s.yestSales + s.yestProd)), 1);
  const mktMax = Math.max(t.marketingSpend, t.marketingSold, 1);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-page">
      <header className="flex min-h-14 shrink-0 flex-wrap items-center gap-2 border-b border-line bg-card px-4">
        <PageTitle
          title="Live Board"
          flush
          actions={
            <span className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-muted">
                <i className="live-pip" />
                Live
              </span>
              <BookPick
                value={office}
                onChange={setOffice}
                items={[
                  { id: "all", label: "All markets" },
                  { id: "PHX", label: "Phoenix" },
                  { id: "DFW", label: "Dallas" },
                ]}
              />
            </span>
          }
        />
      </header>

      <p className="shrink-0 border-b border-line bg-card px-4 py-2.5 text-center text-[15px] tabular-nums">
        <span className="font-bold text-navy">{money(t.sold)} sold</span>
        <span className="text-muted"> · </span>
        <span className="font-bold">{t.closeRate}% close</span>
        <span className="text-muted"> · </span>
        <span className="font-bold text-navy-2">{t.left} sits left</span>
        {t.behindN ? (
          <>
            <span className="text-muted"> · </span>
            <span className="font-bold text-stop">{t.behindN} installs late</span>
          </>
        ) : null}
      </p>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="space-y-3 bg-page p-3">
          <section className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-line lg:grid-cols-4">
            <Cell label="Sales today" value={money(t.sold)} note={`${t.soldN} deals · vs this hour yesterday`} trend={t.trends.sales} mark={t.marks.sales} />
            <Cell label="Close rate" value={`${t.closeRate}%`} note={`${t.soldN} sold of ${t.decided} decided`} trend={t.trends.close} mark={t.marks.close} />
            <Cell label="Cash in" value={money(t.cashIn)} note={`${money(t.expected)} still expected`} trend={t.trends.cashIn} />
            <Cell label="Sits left" value={String(t.left)} note={`${t.passed} ran · ${t.appt.find((r) => r.label === "Left")?.pct ?? 0}% of the book still out`} trend={t.trends.left} />
          </section>

          <section className="grid gap-px overflow-hidden rounded-md bg-line lg:grid-cols-3">
            <div className="bg-card px-5 py-5">
              <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
                Money today
                <Pip now={t.trends.cashIn.now} yest={t.trends.cashIn.yest} />
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <p>
                  <span className="block text-[11px] font-bold text-muted uppercase">In</span>
                  <span className="text-[20px] font-bold tabular-nums">{money(t.cashIn)}</span>
                </p>
                <p>
                  <span className="block text-[11px] font-bold text-muted uppercase">Out</span>
                  <span className={cn("text-[20px] font-bold tabular-nums", markClass(t.marks.cashOut))}>{money(t.spent)}</span>
                </p>
                <p>
                  <span className="block text-[11px] font-bold text-muted uppercase">Expected</span>
                  <span className="text-[20px] font-bold tabular-nums">{money(t.expected)}</span>
                </p>
              </div>
              <Track {...t.trends.cashIn} />
              <p className="mt-2 text-[12px] text-muted">{t.cashOut.map((r) => `${r.name} ${money(r.amount)}`).join(" · ")}</p>
            </div>
            <div className="bg-card px-5 py-5">
              <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
                Marketing
                <Pip now={t.trends.marketing.now} yest={t.trends.marketing.yest} />
              </p>
              <p className="mt-1 text-[28px] font-bold tabular-nums">{money(t.marketingSold)}</p>
              <p className="text-[12px] text-muted">Sold from ads and canvass · spent {money(t.marketingSpend)}</p>
              <div className="mt-3 space-y-1.5">
                <span className="flex items-center gap-2">
                  <span className="w-14 text-[10px] font-bold text-muted uppercase">Sold</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-sm bg-page">
                    <i className="block h-full bg-navy" style={{ width: `${(t.marketingSold / mktMax) * 100}%` }} />
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-14 text-[10px] font-bold text-muted uppercase">Spend</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-sm bg-page">
                    <i className="block h-full bg-idle" style={{ width: `${Math.max(8, (t.marketingSpend / mktMax) * 100)}%` }} />
                  </span>
                </span>
              </div>
              <p className={cn("mt-2 text-[12px] font-semibold", markClass(t.marks.mkt))}>
                {t.marketingSpend ? `${Math.round(t.marketingSold / t.marketingSpend)}x` : "—"} return
              </p>
              <Track {...t.trends.marketing} />
            </div>
            <div className="bg-card px-5 py-5">
              <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
                Payroll today
                <Pip now={t.trends.payroll.now} yest={t.trends.payroll.yest} />
              </p>
              <p className="mt-1 text-[28px] font-bold tabular-nums">{money(t.payroll)}</p>
              <Track {...t.trends.payroll} />
              <p className="mt-2 text-[12px] text-muted">{t.sold ? `${Math.round((t.payroll / t.sold) * 100)}% of sales` : "No sales yet"}</p>
            </div>
          </section>

          <section className="rounded-md bg-card px-5 py-4">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Appointments and installs by hour</p>
                <p className="text-[12px] text-muted">Navy is today. Gray is yesterday this hour. Line is now ({t.hour > 12 ? `${t.hour - 12}p` : `${t.hour}a`}).</p>
              </div>
              <ul className="flex gap-4 text-[12px]">
                <li className="inline-flex items-center gap-1.5">
                  <i className="size-2.5 rounded-sm bg-navy" /> Today
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <i className="size-2.5 rounded-sm bg-line-strong" /> Yesterday
                </li>
              </ul>
            </div>
            <div className="flex h-32 items-end gap-1.5">
              {t.strip.map((s) => {
                const todayN = s.sales + s.prod;
                const yestN = s.yestSales + s.yestProd;
                return (
                  <div key={s.h} className="relative flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
                    {s.h === t.hour ? <i className="absolute inset-x-1/2 top-0 bottom-6 w-px bg-ink/40" /> : null}
                    <div className="flex h-24 w-full max-w-7 items-end justify-center gap-0.5">
                      <span
                        className="w-[45%] rounded-sm bg-line-strong"
                        style={{ height: yestN ? `${Math.max(8, (yestN / stripMax) * 100)}%` : 0 }}
                        title={`${s.label} yesterday: ${s.yestSales} sits, ${s.yestProd} installs`}
                      />
                      <span
                        className="w-[45%] rounded-sm bg-navy"
                        style={{ height: todayN ? `${Math.max(8, (todayN / stripMax) * 100)}%` : 0 }}
                        title={`${s.label} today: ${s.sales} sits, ${s.prod} installs`}
                      />
                    </div>
                    <span className={cn("text-[10px] tabular-nums", s.h === t.hour ? "font-bold text-navy" : "text-faint")}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <Stack title="Leads" caption={`${t.leadsIn} in today`} rows={t.leadSplit} trend={t.trends.leads} />
            <Stack title="Appointments" caption="Passed vs still on the book" rows={t.appt} trend={t.trends.sits} />
            <Stack title="Jobs" caption="Done, on a house, not started" rows={t.jobSplit} trend={t.trends.jobs} />
            <Stack title="Tickets" caption="Open pile, added today, closed today" rows={t.tix} trend={t.trends.tix} />
          </div>

          <Stack title="Set, ran, sold, cancelled" caption="Share of today's book" rows={t.mix} />

          <section className="rounded-md bg-card px-5 py-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
              Customers
              <Pip now={t.trends.reviews.now} yest={t.trends.reviews.yest} />
            </p>
            <div className="mt-2 flex flex-wrap items-end gap-8">
              <p className="flex items-center gap-2 text-[28px] font-bold tabular-nums">
                {t.reviewScore}
                <Stars n={5} tone="gold" />
              </p>
              <div>
                <p>
                  <span className="text-[28px] font-bold tabular-nums">{t.trends.reviews.now}</span>
                  <span className="ml-2 text-[12px] text-muted">reviews today</span>
                </p>
                <Track {...t.trends.reviews} />
              </div>
              <div>
                <p>
                  <span className="text-[28px] font-bold tabular-nums">{t.trends.referrals.now}</span>
                  <span className="ml-2 text-[12px] text-muted">referrals today</span>
                </p>
                <Track {...t.trends.referrals} />
              </div>
            </div>
            <ul className="mt-4 divide-y divide-line">
              {t.reviews.slice(0, 3).map((r) => (
                <li key={r.id} className="flex items-start gap-3 py-2.5 first:pt-0">
                  <Stars n={r.stars} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{r.name}</span>
                    <span className="text-[12px] text-muted">{r.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <div className="grid gap-3 lg:grid-cols-2">
            <section className="rounded-md bg-card px-5 py-4">
              <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Top today</p>
              <ul className="mt-2 divide-y divide-line">
                {t.top.map((p) => (
                  <li key={p.id} className="flex items-baseline justify-between gap-3 py-2.5">
                    <span>
                      <span className="block text-sm font-semibold">{p.name}</span>
                      <span className="text-[12px] text-muted">
                        {p.role} · {p.why}
                      </span>
                    </span>
                    <span className="shrink-0 text-[15px] font-bold tabular-nums">{p.role === "Closer" ? money(p.amount) : p.amount}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-md bg-card px-5 py-4">
              <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Bottom today</p>
              <ul className="mt-2 divide-y divide-line">
                {t.bottom.map((p) => (
                  <li key={p.id} className="flex items-baseline justify-between gap-3 py-2.5">
                    <span>
                      <span className="block text-sm font-semibold">{p.name}</span>
                      <span className="text-[12px] text-muted">
                        {p.role} · {p.why}
                      </span>
                    </span>
                    <span className={cn("shrink-0 text-[15px] font-bold tabular-nums", p.amount === 0 && "text-stop")}>
                      {p.role === "Closer" ? money(p.amount) : p.amount}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
