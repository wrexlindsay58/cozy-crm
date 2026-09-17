import { cn } from "@/lib/cn";
import { money } from "@/lib/crm-data";
import { PageTitle } from "@/components/ui-bits";
import { BookPick } from "@/features/book/pick";
import { TODAY, addDays, toIso } from "@/features/book/time";
import { useBook } from "@/features/book/store";
import { useRoster } from "@/features/book/roster";
import { useOps } from "@/features/ops/store";
import { buildToday, type Mark, type Split } from "@/features/today/live";
import { useMemo, useState } from "react";

function deltaPct(now: number, was: number) {
  if (!was) return null;
  return Math.round(((now - was) / was) * 100);
}

function markClass(m?: Mark) {
  if (m === "go") return "text-go";
  if (m === "watch") return "text-watch";
  if (m === "stop") return "text-stop";
  return "";
}

function Delta({ n }: { n: number | null }) {
  if (n == null || n === 0) return null;
  const mark: Mark | undefined = n >= 15 ? "go" : n <= -20 ? "stop" : n < 0 ? "watch" : undefined;
  return (
    <span className={cn("text-[12px] font-semibold tabular-nums", mark ? markClass(mark) : "text-navy")}>
      {n > 0 ? "+" : ""}
      {n}% vs yesterday
    </span>
  );
}

function Cell({
  label,
  value,
  note,
  delta,
  mark,
}: {
  label: string;
  value: string;
  note?: string;
  delta?: number | null;
  mark?: Mark;
}) {
  return (
    <div className="bg-card px-5 py-5">
      <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{label}</p>
      <p className={cn("mt-1 text-[28px] leading-none font-bold tabular-nums", markClass(mark))}>{value}</p>
      {delta != null ? (
        <p className="mt-1">
          <Delta n={delta} />
        </p>
      ) : null}
      {note ? <p className={cn("mt-1 text-[12px] text-muted", delta == null && "mt-2")}>{note}</p> : null}
    </div>
  );
}

function lightFill(row: Split) {
  return Boolean(row.ink);
}

function Stack({ title, rows, caption }: { title: string; rows: Split[]; caption?: string }) {
  const total = Math.max(rows.reduce((s, r) => s + r.n, 0), 1);
  return (
    <section className="rounded-md bg-card px-5 py-4">
      <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{title}</p>
      {caption ? <p className="mt-0.5 text-[12px] text-muted">{caption}</p> : null}
      <div className="mt-3 flex h-10 overflow-hidden rounded-md bg-page">
        {rows.map((r) =>
          r.n ? (
            <span
              key={r.label}
              className={cn("grid place-items-center px-1 text-[12px] font-bold tabular-nums", lightFill(r) ? "text-ink" : "text-card")}
              style={{ width: `${(r.n / total) * 100}%`, background: r.tone }}
              title={`${r.label}: ${r.n} · ${r.pct}%`}
            >
              {r.pct >= 12 ? `${r.pct}%` : r.n}
            </span>
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
  const salesDelta = deltaPct(t.sold, t.yesterday);
  const stripMax = Math.max(...t.strip.map((s) => s.sales + s.prod), 1);
  const mktMax = Math.max(t.marketingSpend, t.marketingSold, 1);
  const payDelta = deltaPct(t.payroll, t.payrollYest);

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
            <Cell label="Sales today" value={money(t.sold)} note={`${t.soldN} deals`} delta={salesDelta} mark={t.marks.sales} />
            <Cell label="Close rate" value={`${t.closeRate}%`} note={`${t.soldN} sold of ${t.decided} decided`} mark={t.marks.close} />
            <Cell label="Cash in" value={money(t.cashIn)} note={`${money(t.expected)} still expected`} />
            <Cell label="Sits left" value={String(t.left)} note={`${t.passed} ran · ${t.appt.find((r) => r.label === "Left")?.pct ?? 0}% of the book still out`} />
          </section>

          <section className="grid gap-px overflow-hidden rounded-md bg-line lg:grid-cols-3">
            <div className="bg-card px-5 py-5">
              <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Money today</p>
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
              <p className="mt-2 text-[12px] text-muted">{t.cashOut.map((r) => `${r.name} ${money(r.amount)}`).join(" · ")}</p>
            </div>
            <div className="bg-card px-5 py-5">
              <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Marketing</p>
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
            </div>
            <div className="bg-card px-5 py-5">
              <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Payroll today</p>
              <p className="mt-1 text-[28px] font-bold tabular-nums">{money(t.payroll)}</p>
              <p className="mt-1">
                <Delta n={payDelta} />
              </p>
              <p className="mt-2 text-[12px] text-muted">{t.sold ? `${Math.round((t.payroll / t.sold) * 100)}% of sales` : "No sales yet"}</p>
            </div>
          </section>

          <section className="rounded-md bg-card px-5 py-4">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Appointments and installs by hour</p>
                <p className="text-[12px] text-muted">Navy is sits. Gray-blue is installs. Line is now ({t.hour > 12 ? `${t.hour - 12}p` : `${t.hour}a`}).</p>
              </div>
              <ul className="flex gap-4 text-[12px]">
                <li className="inline-flex items-center gap-1.5">
                  <i className="size-2.5 rounded-sm bg-navy" /> Sits
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <i className="size-2.5 rounded-sm bg-idle" /> Installs
                </li>
              </ul>
            </div>
            <div className="flex h-28 items-end gap-1">
              {t.strip.map((s) => (
                <div key={s.h} className="relative flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
                  {s.h === t.hour ? <i className="absolute inset-x-1/2 -top-1 bottom-5 w-0.5 bg-ink" /> : null}
                  <div
                    className="flex w-full max-w-5 flex-col justify-end overflow-hidden rounded-sm"
                    style={{ height: `${16 + ((s.sales + s.prod) / stripMax) * 72}px` }}
                    title={`${s.label}: ${s.sales} sits, ${s.prod} installs`}
                  >
                    {s.prod ? <span className="w-full bg-idle" style={{ height: `${(s.prod / Math.max(s.sales + s.prod, 1)) * 100}%` }} /> : null}
                    {s.sales ? <span className="w-full bg-navy" style={{ height: `${(s.sales / Math.max(s.sales + s.prod, 1)) * 100}%` }} /> : null}
                    {!s.sales && !s.prod ? <span className="h-2 w-full bg-page" /> : null}
                  </div>
                  <span className={cn("text-[10px] tabular-nums", s.h === t.hour ? "font-bold text-navy" : "text-faint")}>{s.label}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <Stack title="Leads" caption={`${t.leadsIn} in this week`} rows={t.leadSplit} />
            <Stack title="Appointments" caption="Passed vs still on the book" rows={t.appt} />
            <Stack title="Jobs" caption="Done, on a house, not started" rows={t.jobSplit} />
            <Stack title="Tickets" caption="Open pile, added today, closed today" rows={t.tix} />
          </div>

          <Stack title="Set, ran, sold, cancelled" caption="Share of today's book" rows={t.mix} />

          <section className="rounded-md bg-card px-5 py-4">
            <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Customers</p>
            <div className="mt-2 flex flex-wrap items-end gap-8">
              <p className="flex items-center gap-2 text-[28px] font-bold tabular-nums">
                {t.reviewScore}
                <Stars n={5} tone="gold" />
              </p>
              <p>
                <span className="text-[28px] font-bold tabular-nums">{t.reviewCount}</span>
                <span className="ml-2 text-[12px] text-muted">reviews on file</span>
              </p>
              <p>
                <span className="text-[28px] font-bold tabular-nums">{t.referrals.length}</span>
                <span className="ml-2 text-[12px] text-muted">referrals this week</span>
              </p>
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
