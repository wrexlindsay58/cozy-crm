import { cn } from "@/lib/cn";
import { money } from "@/lib/crm-data";
import { PageTitle } from "@/components/ui-bits";
import { BookPick } from "@/features/book/pick";
import { TODAY, addDays, toIso } from "@/features/book/time";
import { useBook } from "@/features/book/store";
import { useRoster } from "@/features/book/roster";
import { useOps } from "@/features/ops/store";
import { buildToday } from "@/features/today/live";
import { useMemo, useState } from "react";

function initials(name: string) {
  const p = name.replace(/^Crew \d+ — /, "").split(" ").filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || name.slice(0, 2).toUpperCase();
}

function Meter({ label, fact, score, tone }: { label: string; fact: string; score: number; tone: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
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
  const [office, setOffice] = useState<"all" | "PHX" | "DFW">("all");
  const dayKey = toIso(TODAY).slice(0, 10);
  const yestKey = toIso(addDays(TODAY, -1)).slice(0, 10);
  const hour = 18;
  const t = useMemo(
    () => buildToday({ events, leads, roster, dayKey, yestKey, hour, office }),
    [events, leads, roster, dayKey, yestKey, office],
  );
  const maxBar = Math.max(t.sold, t.yesterday, 1);
  const stripMax = Math.max(...t.strip.map((s) => s.n), 1);
  const topAmt = Math.max(...t.board.filter((r) => r.role === "Closer").map((r) => r.amount), 1);
  const mixTotal = Math.max(t.mix.reduce((s, x) => s + x.n, 0), 1);
  const [open, setOpen] = useState<string | null>(null);
  const buckets = [...t.winBuckets, ...t.lossBuckets];
  const openBucket = buckets.find((b) => b.id === open);
  const closers = t.board.filter((r) => r.role === "Closer");
  const crews = t.board.filter((r) => r.role === "Crew");

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
        <span className="font-bold text-navy">{t.soldN} sold</span>
        <span className="text-muted"> · </span>
        <span className="font-bold text-navy-2">{money(t.onBook)} on the book</span>
        {t.behindN ? (
          <>
            <span className="text-muted"> · </span>
            <span className="font-bold text-stop">{t.behindN} behind</span>
          </>
        ) : null}
        <span className="text-muted"> · </span>
        <span className="font-bold">{t.sitsLeft.length} sits left</span>
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
                    className={cn("w-full max-w-5 rounded-sm", s.h === t.hour ? "bg-navy" : s.prod ? "bg-navy-2" : s.sales ? "bg-navy/80" : "bg-page")}
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

          <section className="rounded-md bg-card px-5 py-4">
            <p className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">Set, ran, sold, cancelled</p>
            <div className="flex h-10 overflow-hidden rounded-md bg-page">
              {t.mix.map((m) =>
                m.n ? (
                  <span
                    key={m.label}
                    className="grid place-items-center text-[12px] font-bold text-card"
                    style={{ width: `${(m.n / mixTotal) * 100}%`, background: m.tone }}
                    title={`${m.label} ${m.n}`}
                  >
                    {m.n}
                  </span>
                ) : null,
              )}
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
              {t.mix.map((m) => (
                <li key={m.label} className="inline-flex items-center gap-1.5">
                  <i className="size-2.5 rounded-sm" style={{ background: m.tone }} />
                  <span className="font-semibold">{m.label}</span>
                  <span className="tabular-nums text-muted">{m.n}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="grid gap-3 lg:grid-cols-2">
            <section className="rounded-md bg-card">
              <h2 className="border-b border-line px-5 py-3 text-[11px] font-bold tracking-wide text-muted uppercase">Won</h2>
              <div className="grid grid-cols-2 gap-px bg-line">
                {t.winBuckets.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setOpen(open === b.id ? null : b.id)}
                    className={cn("bg-card px-5 py-4 text-left hover:bg-page", open === b.id && "bg-page")}
                  >
                    <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{b.label}</p>
                    <p className="mt-1 text-[28px] leading-none font-bold tabular-nums text-navy">{b.n}</p>
                    {b.amount ? <p className="mt-1 text-[12px] font-semibold text-muted">{money(b.amount)}</p> : null}
                  </button>
                ))}
              </div>
            </section>
            <section className="rounded-md bg-card">
              <h2 className="border-b border-line px-5 py-3 text-[11px] font-bold tracking-wide text-muted uppercase">Lost</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-px bg-line">
                {t.lossBuckets.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setOpen(open === b.id ? null : b.id)}
                    className={cn("bg-card px-5 py-4 text-left hover:bg-page", open === b.id && "bg-page")}
                  >
                    <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{b.label}</p>
                    <p className={cn("mt-1 text-[28px] leading-none font-bold tabular-nums", b.stop && b.n ? "text-stop" : "text-ink")}>{b.n}</p>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {openBucket && openBucket.items.length ? (
            <section className="rounded-md bg-card">
              <h2 className="border-b border-line px-5 py-3 text-[13px] font-bold">
                {openBucket.label} <span className="font-semibold text-muted">{openBucket.n}</span>
              </h2>
              <div className="max-h-56 overflow-y-auto">
                <ul>
                  {openBucket.items.map((row) => (
                    <li key={row.id} className="border-b border-line last:border-b-0">
                      <a href={row.href} className="flex items-baseline justify-between gap-3 px-5 py-2.5 hover:bg-page">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{row.title}</span>
                          <span className="block truncate text-[11px] text-muted">{row.detail}</span>
                        </span>
                        {row.amount ? <span className="shrink-0 text-[12px] font-bold tabular-nums">{money(row.amount)}</span> : null}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}

          <section className="overflow-hidden rounded-md bg-card">
            <h2 className="border-b border-line px-5 py-3 text-[11px] font-bold tracking-wide text-muted uppercase">Deployed</h2>
            <div className="max-h-80 overflow-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="sticky top-0 bg-card text-[11px] font-bold tracking-wide text-muted uppercase">
                  <tr className="border-b border-line">
                    <th className="w-10 px-3 py-2">#</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Why</th>
                    <th className="px-3 py-2 text-right">Today</th>
                  </tr>
                </thead>
                <tbody>
                  {closers.map((p, i) => (
                    <tr key={p.id} className="border-b border-line">
                      <td className="px-3 py-2.5 font-bold tabular-nums text-muted">{i + 1}</td>
                      <td className="px-3 py-2.5">
                        <a href={p.href} className="font-semibold hover:text-navy">
                          {p.name}
                        </a>
                        <span className="mt-1 block h-1.5 max-w-[12rem] overflow-hidden rounded-sm bg-page">
                          <i className="block h-full bg-navy" style={{ width: `${Math.max(8, (p.amount / topAmt) * 100)}%` }} />
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-muted">{p.why}</td>
                      <td className="px-3 py-2.5 text-right font-bold tabular-nums">{money(p.amount)}</td>
                    </tr>
                  ))}
                  {crews.map((p) => (
                    <tr key={p.id} className="border-b border-line last:border-b-0">
                      <td className="px-3 py-2.5">
                        <span className="grid size-8 place-items-center rounded-md bg-navy text-[10px] font-bold text-card">{initials(p.name)}</span>
                      </td>
                      <td className="px-3 py-2.5 font-semibold">{p.name}</td>
                      <td className="px-3 py-2.5 text-muted">{p.why}</td>
                      <td className="px-3 py-2.5 text-right font-bold tabular-nums">
                        {p.amount} job{p.amount === 1 ? "" : "s"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-md bg-card px-5 py-4">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Customers</p>
                <p className="mt-1 flex items-center gap-2 text-[28px] font-bold tabular-nums">
                  {t.reviewScore}
                  <Stars n={5} tone="gold" />
                </p>
                <p className="text-[12px] text-muted">{t.reviewCount} reviews</p>
              </div>
              <p className="text-[13px] font-semibold">
                {t.referrals.length} referrals <span className="font-normal text-muted">set this week</span>
              </p>
            </div>
            <ul className="divide-y divide-line">
              {t.reviews.map((r) => (
                <li key={r.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <Stars n={r.stars} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{r.name}</span>
                    <span className="text-[12px] text-muted">{r.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function MoneyCell({ label, value, note, hot, bar, prior }: { label: string; value: number; note?: string; hot?: boolean; bar?: number; prior?: number }) {
  return (
    <div className="bg-card px-5 py-5">
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
  const empty = "var(--color-page)";
  return (
    <span className="inline-flex gap-0.5" aria-label={`${n} stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className="size-3.5 shrink-0" aria-hidden>
          <path d="M12 2.6 14.7 8.4l6.4.9-4.6 4.5 1.1 6.4L12 17.2 6.4 20.2l1.1-6.4L2.9 9.3l6.4-.9L12 2.6z" fill={i <= n ? fill : empty} />
        </svg>
      ))}
    </span>
  );
}
