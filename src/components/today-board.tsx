import { cn } from "@/lib/cn";
import { money } from "@/lib/crm-data";
import { PageTitle } from "@/components/ui-bits";
import { Tip } from "@/components/tip";
import { BookPick } from "@/features/book/pick";
import { TODAY, addDays, toIso } from "@/features/book/time";
import { useBook } from "@/features/book/store";
import { rollsOn } from "@/features/job/prep";
import { useJobs } from "@/features/job/store";
import { useRoster } from "@/features/book/roster";
import { useOps } from "@/features/ops/store";
import { buildToday, type Mark, type Split, type Trend, type SparkPt } from "@/features/today/live";
import { ShopFeed } from "@/features/today/feed";
import { useMemo, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { SalesDashboard } from "@/components/sales-dashboard";

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

function vsTip(t: Pick<Trend, "now" | "yest" | "goal" | "money">) {
  const fmt = (n: number) => (t.money ? money(n) : String(n));
  const vs = t.now === t.yest ? "Even with yesterday" : t.now > t.yest ? `Up vs yesterday (${fmt(t.yest)})` : `Down vs yesterday (${fmt(t.yest)})`;
  return t.goal ? `${vs} · goal ${fmt(t.goal)}` : vs;
}

function Pip({ now, yest }: { now: number; yest: number }) {
  const mark = pipMark(now, yest);
  const fill = mark === "go" ? "var(--color-go)" : mark === "stop" ? "var(--color-stop)" : mark === "watch" ? "var(--color-watch)" : "var(--color-idle)";
  if (now === yest) return <i className="inline-block size-1.5 rounded-full bg-idle" />;
  return (
    <svg viewBox="0 0 10 10" className="size-2.5 shrink-0" aria-hidden>
      {now > yest ? <path d="M5 1.5 9 8.5H1Z" fill={fill} /> : <path d="M5 8.5 9 1.5H1Z" fill={fill} />}
    </svg>
  );
}

function Delta({ now, yest, money: isMoney }: Pick<Trend, "now" | "yest" | "money">) {
  const d = now - yest;
  if (!d) return null;
  const fmt = isMoney ? money(Math.abs(d)) : String(Math.abs(d));
  return (
    <span className={cn("text-[12px] font-semibold tabular-nums", markClass(pipMark(now, yest)))}>
      {d > 0 ? "+" : "−"}
      {fmt}
    </span>
  );
}

function TrendMark({ trend }: { trend: Trend }) {
  return (
    <Tip label={vsTip(trend)} on>
      <span className="inline-flex items-center gap-1.5">
        <Pip now={trend.now} yest={trend.yest} />
        <Delta {...trend} />
      </span>
    </Tip>
  );
}

function Pace({
  trend,
  ink,
  pct,
  className,
}: {
  trend: Trend;
  ink?: boolean;
  pct?: boolean;
  className?: string;
}) {
  if (!trend.goal) return null;
  const fill = Math.min(100, Math.round((trend.now / trend.goal) * 100));
  const label = trend.money ? money(trend.goal) : pct ? `${trend.goal}%` : String(trend.goal);
  return (
      <Tip label={`${fill}% of ${label}`} on className={cn("w-full", className)}>
      <span className="flex w-full min-w-0 items-center gap-2">
        <span className={cn("h-1 min-w-0 flex-1 overflow-hidden rounded-full", ink ? "bg-card/20" : "bg-page")}>
          <i className={cn("block h-full rounded-full", ink ? "bg-card" : "bg-navy")} style={{ width: `${fill ? Math.max(fill, 4) : 0}%` }} />
        </span>
        <span className={cn("shrink-0 text-[11px] font-semibold tabular-nums", ink ? "text-card/65" : "text-muted")}>{label}</span>
      </span>
    </Tip>
  );
}

function GoalLine({ now, goal, hint }: { now: number; goal: number; hint: string }) {
  const cap = Math.max(goal * 1.4, now, 1);
  const nowPct = Math.min(100, (now / cap) * 100);
  const goalPct = Math.min(100, (goal / cap) * 100);
  return (
    <Tip label={hint} on className="mt-4 block w-full">
      <span className="relative block h-2 w-full rounded-full bg-page">
        <i className="absolute inset-y-0 left-0 rounded-full bg-navy" style={{ width: `${nowPct}%` }} />
        <i className="absolute top-[-4px] h-[16px] w-0.5 rounded-full bg-ink" style={{ left: `${goalPct}%` }} />
      </span>
      <span className="relative mt-1.5 block h-4 w-full text-[11px] tabular-nums text-muted">
        <span className="absolute -translate-x-1/2" style={{ left: `${goalPct}%` }}>
          Goal {goal}%
        </span>
      </span>
    </Tip>
  );
}

function Ring({ pct, label }: { pct: number; label: string }) {
  const r = 15.9155;
  const c = 100;
  const dash = Math.min(100, Math.max(0, pct));
  const [hot, setHot] = useState(false);
  const w = hot ? 3.5 : 2.75;
  return (
    <Tip label={label} on className="relative z-10 size-16 cursor-pointer">
      <svg
        viewBox="0 0 36 36"
        className="size-16 -rotate-90"
        aria-hidden
        onMouseEnter={() => setHot(true)}
        onMouseLeave={() => setHot(false)}
      >
        <circle cx="18" cy="18" r={r} fill="none" stroke="var(--color-page)" strokeWidth={w} />
        <circle cx="18" cy="18" r={r} fill="none" stroke="var(--color-navy)" strokeWidth={w} strokeDasharray={`${dash} ${c}`} />
      </svg>
    </Tip>
  );
}

function MktLine({ pts }: { pts: SparkPt[] }) {
  const sold = pts.map((p) => p.sold);
  const spend = pts.map((p) => p.spend);
  const max = Math.max(...sold, ...spend, 1);
  const w = 120;
  const h = 44;
  const last = Math.max(pts.length - 1, 1);
  const x = (i: number) => (i / last) * w;
  const y = (n: number) => h - 2.5 - (n / max) * (h - 5);
  const ptsOf = (vals: number[]) => vals.map((n, i) => [x(i), y(n)] as const);
  const smooth = (vals: number[]) => {
    const p = ptsOf(vals);
    if (p.length < 2) return "";
    let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] ?? p[i];
      const p1 = p[i];
      const p2 = p[i + 1];
      const p3 = p[i + 2] ?? p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d;
  };
  const area = (vals: number[]) => `${smooth(vals)} L${x(vals.length - 1).toFixed(1)} ${h} L0 ${h} Z`;
  return (
    <Tip label="Gray spend · navy sold" on className="relative z-10 block h-full w-full cursor-pointer">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full overflow-visible" preserveAspectRatio="none" aria-hidden>
        <rect width={w} height={h} fill="transparent" />
        <path d={area(spend)} fill="var(--color-line-strong)" opacity="0.4" />
        <path d={area(sold)} fill="var(--color-navy)" opacity="0.1" />
        <path d={smooth(spend)} fill="none" stroke="var(--color-line-strong)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path d={smooth(sold)} fill="none" stroke="var(--color-navy)" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </Tip>
  );
}

function DealSpark({ pts }: { pts: { h: number; n: number }[] }) {
  const vals = pts.map((p) => p.n);
  const max = Math.max(...vals, 1);
  const w = 120;
  const h = 36;
  const last = Math.max(pts.length - 1, 1);
  const x = (i: number) => (i / last) * w;
  const y = (n: number) => h - 2 - (n / max) * (h - 4);
  const p = vals.map((n, i) => [x(i), y(n)] as const);
  let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  const area = `${d} L${x(vals.length - 1).toFixed(1)} ${h} L0 ${h} Z`;
  const peak = pts.reduce((a, b) => (b.n > a.n ? b : a), pts[0]);
  return (
    <Tip label={peak ? `Peak ${peak.n} at ${peak.h > 12 ? peak.h - 12 : peak.h}${peak.h >= 12 ? "p" : "a"}` : "Deals by hour"} on className="relative z-10 block h-9 w-[7.25rem] cursor-pointer">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full overflow-visible" preserveAspectRatio="none" aria-hidden>
        <rect width={w} height={h} fill="transparent" />
        <path d={area} fill="var(--color-navy)" opacity="0.12" />
        <path d={d} fill="none" stroke="var(--color-navy)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </Tip>
  );
}

function MiniDonut({ rows }: { rows: Split[] }) {
  const [over, setOver] = useState<string | null>(null);
  const total = Math.max(
    rows.reduce((s, r) => s + r.n, 0),
    1,
  );
  const R = 13;
  const C = 2 * Math.PI * R;
  let offset = 0;
  const segs = rows
    .filter((r) => r.n)
    .map((r) => {
      const len = (r.n / total) * C;
      const row = { ...r, len, offset };
      offset += len;
      return row;
    });
  const hit = rows.find((r) => r.label === over);
  const tip = hit ? `${hit.label} ${hit.n} · ${hit.pct}%` : rows.map((r) => `${r.label} ${r.n}`).join(" · ");
  return (
    <Tip label={tip} on className="relative z-10 block size-[4.75rem] cursor-pointer">
      <svg viewBox="0 0 36 36" className="size-[4.75rem] -rotate-90" aria-hidden>
        <circle cx="18" cy="18" r={R} fill="transparent" />
        <circle cx="18" cy="18" r={R} fill="none" stroke="var(--color-page)" strokeWidth="4.5" />
        {segs.map((r) => (
          <circle
            key={r.label}
            cx="18"
            cy="18"
            r={R}
            fill="none"
            stroke={r.tone}
            strokeWidth={over === r.label ? 5.5 : 4.5}
            strokeOpacity={over && over !== r.label ? 0.35 : 1}
            strokeDasharray={`${r.len} ${C - r.len}`}
            strokeDashoffset={-r.offset}
            pointerEvents="stroke"
            onMouseEnter={() => setOver(r.label)}
            onMouseLeave={() => setOver(null)}
          />
        ))}
      </svg>
    </Tip>
  );
}

function Cell({
  label,
  value,
  trend,
  mark,
  ring,
  hint,
  pct,
  sub,
  split,
  spark,
}: {
  label: string;
  value: string;
  trend: Trend;
  mark?: Mark;
  ring?: boolean;
  hint: string;
  pct?: boolean;
  sub?: string;
  split?: Split[];
  spark?: ReactNode;
}) {
  const ringFill = ring ? Math.min(100, Math.max(0, trend.now)) : undefined;
  const graphic = ringFill != null || split || spark;
  return (
    <div className="relative flex h-full min-w-0 w-full flex-col bg-card px-5 py-6 max-md:px-3 max-md:py-4">
      {ringFill != null ? (
        <span className="absolute top-5 right-4 z-10">
          <Ring pct={ringFill} label={`${trend.now}% · goal ${trend.goal}%`} />
        </span>
      ) : null}
      {split && !ringFill ? (
        <span className="absolute top-4 right-3 z-10">
          <MiniDonut rows={split} />
        </span>
      ) : null}
      {spark && !ringFill && !split ? <span className="absolute top-4 right-3 z-10">{spark}</span> : null}
      <Tip label={hint} on className="min-w-0">
        <div className={graphic ? "pr-[7.5rem]" : undefined}>
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
            {label}
            <TrendMark trend={trend} />
          </p>
          <p className={cn("mt-1 text-[36px] leading-none font-bold tabular-nums max-md:text-[26px]", markClass(mark))}>{value}</p>
        </div>
      </Tip>
      <div className="mt-auto w-full pt-3">
        {sub ? <p className="text-[11px] font-semibold tabular-nums text-muted">{sub}</p> : <Pace trend={trend} pct={pct} />}
      </div>
    </div>
  );
}

function CountShare({ n, total, tone }: { n: number; total: number; tone?: string }) {
  const pct = total ? Math.round((n / total) * 100) : 0;
  return (
    <span className="flex shrink-0 items-baseline justify-end gap-6 tabular-nums">
      <span className={cn("font-semibold", tone)}>{n}</span>
      <span className="w-10 text-right font-normal text-muted">{pct}%</span>
    </span>
  );
}

function Story({
  title,
  value,
  hint,
  rows,
  note,
  mark,
}: {
  title: string;
  value: string;
  hint: string;
  rows: Split[];
  note?: string;
  mark?: Mark;
}) {
  return (
    <div className="flex min-w-0 flex-col bg-card px-5 py-4">
      <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{title}</p>
      <div className="mt-3 flex min-w-0 items-center gap-4">
        <MiniDonut rows={rows} />
        <div className="min-w-0 flex-1">
          <Tip label={hint} on>
            <p className={cn("text-[28px] font-bold leading-none tabular-nums", markClass(mark))}>{value}</p>
          </Tip>
          <ul className="mt-2 space-y-1">
            {rows.map((r) => {
              const total = rows.reduce((s, row) => s + row.n, 0);
              return (
                <li key={r.label} className="flex items-baseline justify-between gap-2 text-[12px]">
                  <span className="inline-flex min-w-0 items-center gap-1.5 text-muted">
                    <i className="size-1.5 shrink-0 rounded-full" style={{ background: r.tone }} />
                    {r.label}
                  </span>
                  <CountShare n={r.n} total={total} tone={r.mark ? markClass(r.mark) : ""} />
                </li>
              );
            })}
          </ul>
          {note ? <p className="mt-2 truncate text-[12px] text-muted">{note}</p> : null}
        </div>
      </div>
    </div>
  );
}

function FillMeter({ now, max, hint }: { now: number; max: number; hint: string }) {
  const pct = max ? Math.round((now / max) * 100) : 0;
  return (
    <Tip label={hint} on className="mt-3 block w-full">
      <span className="flex w-full items-center gap-2">
        <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-page">
          <i className="block h-full rounded-full bg-navy" style={{ width: `${pct ? Math.max(pct, 6) : 0}%` }} />
        </span>
        <span className="text-[11px] font-semibold tabular-nums text-muted">{pct}%</span>
      </span>
    </Tip>
  );
}

function SplitMix({ rows }: { rows: Split[] }) {
  const total = rows.reduce((s, r) => s + r.n, 0) || 1;
  return (
    <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-page">
      {rows.map((r) => (
        <i key={r.label} className="h-full" style={{ width: `${(r.n / total) * 100}%`, background: r.tone }} />
      ))}
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

function initials(name: string) {
  const parts = name.replace(/—/g, " ").split(/\s+/).filter(Boolean);
  if (/^crew/i.test(name)) return ((parts[1]?.[0] ?? "C") + (parts[2]?.[0] ?? parts[1]?.[1] ?? "")).toUpperCase();
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function RankList({ rows }: { rows: { id: string; name: string; role: string; amount: number; why: string }[] }) {
  return (
    <ul className="mt-3 space-y-3">
      {rows.length ? (
        rows.map((p) => (
          <li key={p.id} className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-navy text-[11px] font-bold tracking-wide text-card">{initials(p.name)}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{p.name}</span>
              <span className="text-[12px] text-muted">
                {p.role} · {p.why}
              </span>
            </span>
            <span className="shrink-0 text-[15px] font-bold tabular-nums">{p.role === "Closer" ? money(p.amount) : p.amount}</span>
          </li>
        ))
      ) : (
        <li className="text-[13px] text-muted">None yet</li>
      )}
    </ul>
  );
}

export function TodayBoard() {
  const jobs = useJobs();
  const events = useBook().filter((e) => rollsOn(e.jobId ? jobs[e.jobId] : undefined, e.start.slice(0, 10)));
  const roster = useRoster();
  const { leads } = useOps();
  const [office, setOffice] = useState<"all" | "PHX" | "DFW">("all");
  const dayKey = toIso(TODAY).slice(0, 10);
  const yestKey = toIso(addDays(TODAY, -1)).slice(0, 10);
  const t = useMemo(
    () => buildToday({ events, leads, roster, dayKey, yestKey, hour: 18, office }),
    [events, leads, roster, dayKey, yestKey, office],
  );
  const [feed, setFeed] = useState(false);
  const [salesSlot, setSalesSlot] = useState<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const sales = useRouterState({ select: (s) => (s.location.search as { board?: string }).board === "sales" });
  function pickBoard(next: "live" | "sales") {
    void navigate({ to: "/", search: next === "sales" ? { board: "sales" } : {} });
  }
  const flowMax = Math.max(...t.flow.map((s) => Math.max(s.now, s.yest)), 1);
  const mktX = t.marketingSpend ? Math.round(t.marketingSold / t.marketingSpend) : 0;
  const collectedOf = t.cashIn + t.expected;
  const collectedPct = collectedOf ? Math.round((t.cashIn / collectedOf) * 100) : 0;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-page">
      <header className="flex min-h-14 shrink-0 flex-wrap items-center gap-2 border-b border-line bg-card px-4">
        <PageTitle
          title={sales ? "Sales Board" : "Live Board"}
          flush
          actions={
            <span className="flex min-w-0 flex-1 items-center gap-3">
              <BookPick
                value={sales ? "sales" : "live"}
                onChange={pickBoard}
                items={[
                  { id: "live", label: "Live Board" },
                  { id: "sales", label: "Sales Board" },
                ]}
              />
              {sales ? <div ref={setSalesSlot} className="flex min-w-0 flex-1 items-center gap-2" /> : (
                <>
              <Tip label="As of this hour" on>
                <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-muted">
                  <i className="live-pip" />
                  Live
                </span>
              </Tip>
              <BookPick
                value={office}
                onChange={setOffice}
                items={[
                  { id: "all", label: "All markets" },
                  { id: "PHX", label: "Phoenix" },
                  { id: "DFW", label: "Dallas" },
                ]}
              />
              <button type="button" onClick={() => setFeed(true)} className="h-9 rounded-md bg-navy px-3 text-[12px] font-bold text-card xl:hidden">
                Feed
              </button>
                </>
              )}
            </span>
          }
        />
      </header>

      {sales ? (
        <SalesDashboard embedded filterSlot={salesSlot} />
      ) : (
      <>
      <p className="shrink-0 border-b border-line bg-card px-4 py-2.5 text-center text-[15px] tabular-nums max-md:px-3 max-md:text-left max-md:text-[13px] max-md:leading-5">
        <span className="font-bold">{money(t.sold)} sold</span>
        <span className="text-muted"> · </span>
        <span className="font-bold">{t.closeRate}% close</span>
        <span className="text-muted"> · </span>
        <span className="font-bold">{t.left} runs left</span>
        {t.behindN ? (
          <>
            <span className="text-muted"> · </span>
            <span className="font-bold text-stop">{t.behindN} installs late</span>
          </>
        ) : null}
      </p>

      <div className="relative flex min-h-0 flex-1 flex-col xl:flex-row">
        <div className="min-h-0 min-w-0 flex-1 overflow-auto">
        <div className="space-y-3 bg-page p-3">
          <section className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-line lg:grid-cols-4">
            <Cell
              label="Sales today"
              value={money(t.sold)}
              trend={t.trends.sales}
              mark={t.marks.sales}
              hint={`${t.soldN} deals`}
            />
            <Cell
              label="Close rate"
              value={`${t.closeRate}%`}
              trend={t.trends.close}
              mark={t.marks.close}
              ring
              pct
              hint={`${t.soldN} of ${t.decided} decided`}
            />
            <Cell
              label="Avg ticket"
              value={money(t.ticket)}
              trend={t.trends.ticket}
              mark={t.marks.ticket}
              hint={`${t.soldN} deals`}
            />
            <Cell
              label="Deals sold"
              value={String(t.soldN)}
              trend={t.trends.deals}
              mark={t.marks.deals}
              spark={<DealSpark pts={t.dealSpark} />}
              hint={`${t.soldN} closed`}
            />
          </section>

          <section className="grid gap-px overflow-hidden rounded-md bg-line lg:grid-cols-3">
            <div className="flex h-full flex-col bg-card px-5 py-5">
              <p className="flex h-4 items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
                Money today
                <TrendMark trend={t.trends.cashIn} />
              </p>
              <div className="mt-1 grid h-10 grid-cols-3 items-center gap-3">
                <Tip label="Collected" on>
                  <p>
                    <span className="block text-[11px] font-bold leading-none text-muted uppercase">In</span>
                    <span className="mt-1 block text-[20px] font-bold leading-none tabular-nums max-md:text-[16px]">{money(t.cashIn)}</span>
                  </p>
                </Tip>
                <Tip label="Paid out" on>
                  <p>
                    <span className="block text-[11px] font-bold leading-none text-muted uppercase">Out</span>
                    <span className={cn("mt-1 block text-[20px] font-bold leading-none tabular-nums max-md:text-[16px]", markClass(t.marks.cashOut))}>{money(t.spent)}</span>
                  </p>
                </Tip>
                <Tip label="Still due" on>
                  <p>
                    <span className="block text-[11px] font-bold leading-none text-muted uppercase">Due</span>
                    <span className="mt-1 block text-[20px] font-bold leading-none tabular-nums max-md:text-[16px]">{money(t.expected)}</span>
                  </p>
                </Tip>
              </div>
              <p className="mt-2 flex h-4 items-baseline gap-6 text-[12px] leading-4 tabular-nums text-muted">
                <span>{money(t.cashIn - t.spent)} net</span>
                <span>{collectedPct}% collected</span>
              </p>
              <div className="mt-auto pt-4">
                <Pace trend={t.trends.cashIn} />
              </div>
            </div>
            <div className="flex h-full flex-col bg-card px-5 py-5">
              <div className="relative min-w-0 pr-[7.75rem]">
                <p className="flex h-4 items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
                  Marketing
                  <TrendMark trend={t.trends.marketing} />
                </p>
                <div className="mt-1 flex h-10 items-center">
                  <Tip label="Sold per ad dollar" on>
                    <p className={cn("text-[28px] font-bold leading-none tabular-nums", markClass(t.marks.mkt))}>{mktX ? `${mktX}x` : "—"}</p>
                  </Tip>
                </div>
                <div className="absolute top-0 right-0 bottom-0 w-[7.25rem]">
                  <MktLine pts={t.mktSpark} />
                </div>
              </div>
              <p className="mt-2 h-4 text-[12px] leading-4 tabular-nums text-muted">
                {money(t.marketingSpend)} spend → {money(t.marketingSold)} sold
              </p>
              <div className="mt-auto pt-4">
                <Pace trend={t.trends.marketing} />
              </div>
            </div>
            <div className="flex h-full flex-col bg-card px-5 py-5">
              <p className="flex h-4 items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
                Payroll
                <TrendMark trend={t.trends.payroll} />
              </p>
              <div className="mt-1 flex h-10 items-center">
                <p className="text-[28px] font-bold leading-none tabular-nums">{money(t.payroll)}</p>
              </div>
              <Tip label="% of sales" on>
                <p className="mt-2 h-4 text-[12px] leading-4 tabular-nums text-muted">{t.sold ? `${Math.round((t.payroll / t.sold) * 100)}% of sales` : "—"}</p>
              </Tip>
              <div className="mt-auto pt-4">
                <Pace trend={t.trends.payroll} />
              </div>
            </div>
          </section>

          <section className="rounded-md bg-card px-5 py-4">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <Tip label="Today vs yesterday" on>
                <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Daily flow</p>
              </Tip>
              <ul className="flex gap-4 text-[12px]">
                <li className="inline-flex items-center gap-1.5">
                  <i className="size-2.5 rounded-sm bg-navy" /> Today
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <i className="size-2.5 rounded-sm bg-line-strong" /> Yesterday
                </li>
              </ul>
            </div>
            <div className="flex items-end gap-2">
              {t.flow.map((s) => {
                const nowH = s.now ? Math.max(12, (s.now / flowMax) * 100) : 0;
                const yestH = s.yest ? Math.max(12, (s.yest / flowMax) * 100) : 0;
                const flip = s.key === "cancel";
                const pip = { now: flip ? s.yest : s.now, yest: flip ? s.now : s.yest };
                return (
                  <div key={s.key} className="flex min-w-0 flex-1 flex-col items-center">
                    <div className="flex h-28 w-full max-w-[5.625rem] items-end justify-center gap-1.5">
                      <Tip label={`Yesterday ${s.yest}`} on className="flex h-full w-[42%] cursor-pointer items-end">
                        <span className="block w-full rounded-sm bg-line-strong" style={{ height: `${yestH}%` }} />
                      </Tip>
                      <Tip label={`Today ${s.now}`} on className="flex h-full w-[42%] cursor-pointer items-end">
                        <span className="block w-full rounded-sm bg-navy" style={{ height: `${nowH}%` }} />
                      </Tip>
                    </div>
                    <p className="mt-2 flex items-center gap-1">
                      <Pip now={pip.now} yest={pip.yest} />
                      <span className="text-[11px] font-bold tracking-wide text-muted uppercase">{s.label}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] tabular-nums text-muted">
                      {s.now} {s.label === "Appts." ? "Appts." : s.label.toLowerCase()}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-md bg-card px-5 py-5">
            <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
              Demand / capacity
              <TrendMark trend={t.trends.demand} />
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-x-5 gap-y-1">
              <Tip label="Jobs on the book vs crews. Goal 10% more demand than capacity." on>
                <p className={cn("text-[36px] font-bold leading-none tabular-nums", markClass(t.marks.demand))}>{t.field.demandPct}%</p>
              </Tip>
              <p className="pb-1 text-[13px] tabular-nums text-muted">
                {t.field.demand} demand · {t.field.capacity} capacity
              </p>
            </div>
            <GoalLine now={t.field.demandPct} goal={t.trends.demand.goal} hint={`Now ${t.field.demandPct}% · goal ${t.trends.demand.goal}%`} />
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <li>
                <Tip label="Contract value still on today's production book" on>
                  <p>
                    <span className="block text-[11px] font-bold tracking-wide text-muted uppercase">On the book</span>
                    <span className="text-[22px] font-bold tabular-nums">{money(t.field.bookValue)}</span>
                  </p>
                </Tip>
              </li>
              <li>
                <Tip label="Jobs held. They count as demand but eat no capacity until released." on>
                  <p>
                    <span className="block text-[11px] font-bold tracking-wide text-muted uppercase">Holds</span>
                    <span className="text-[22px] font-bold tabular-nums">{t.field.holds}</span>
                  </p>
                </Tip>
              </li>
              <li>
                <Tip label="Installs that should have finished by this hour" on>
                  <p>
                    <span className="block text-[11px] font-bold tracking-wide text-muted uppercase">Late</span>
                    <span className="text-[22px] font-bold tabular-nums">{t.field.late}</span>
                  </p>
                </Tip>
              </li>
              <li>
                <Tip label="Crews with no job today. Unused capacity." on>
                  <p>
                    <span className="block text-[11px] font-bold tracking-wide text-muted uppercase">Idle crews</span>
                    <span className="text-[22px] font-bold tabular-nums">{t.field.crewsIdle}</span>
                  </p>
                </Tip>
              </li>
            </ul>
          </section>

          <section className="grid gap-px overflow-hidden rounded-md bg-line sm:grid-cols-2 lg:grid-cols-4">
            <Story title="Installs" value={`${t.field.installsDone} done`} hint="Done · live · pending" rows={t.field.installSplit} />
            <Story title="Runs" value={`${t.field.runsLeft} left`} hint="Left · sitting now · already ran" rows={t.field.runNowSplit} />
            <div className="flex min-w-0 flex-col bg-card px-5 py-4">
              <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Crews</p>
              <div className="mt-3">
                <Tip label="Crews with a job today" on>
                  <p className="text-[28px] font-bold leading-none tabular-nums">
                    {t.field.crewsOut}/{t.field.crewsN}
                  </p>
                </Tip>
                <p className="mt-2 text-[12px] text-muted">{t.field.crewsIdle} idle</p>
              </div>
              <FillMeter now={t.field.crewsOut} max={t.field.crewsN} hint="Share of crews out" />
            </div>
            <div className="flex min-w-0 flex-col bg-card px-5 py-4">
              <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Reps</p>
              <div className="mt-3">
                <Tip label="Closers with a sit today" on>
                  <p className="text-[28px] font-bold leading-none tabular-nums">
                    {t.field.repsOut}/{t.field.repsN}
                  </p>
                </Tip>
                <p className="mt-2 text-[12px] text-muted">{t.field.repsIdle} idle</p>
              </div>
              <FillMeter now={t.field.repsOut} max={t.field.repsN} hint="Share of reps out" />
            </div>
          </section>

          <section className="grid gap-px overflow-hidden rounded-md bg-line lg:grid-cols-2">
            <div className="bg-card px-5 py-4">
              <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Quality</p>
              <div className="mt-3 flex min-w-0 items-center gap-4">
                <MiniDonut rows={t.field.qcSplit} />
                <div className="min-w-0 flex-1">
                  <Tip label="Pass · fail · fixed · pending" on>
                    <p className="text-[28px] font-bold leading-none tabular-nums">{t.field.qcDone} passed</p>
                  </Tip>
                  <ul className="mt-2 space-y-1">
                    {t.field.qcSplit.map((r) => (
                      <li key={r.label} className="flex items-baseline justify-between gap-2 text-[12px]">
                        <span className="inline-flex min-w-0 items-center gap-1.5 text-muted">
                          <i className="size-1.5 shrink-0 rounded-full" style={{ background: r.tone }} />
                          {r.label}
                        </span>
                        <CountShare n={r.n} total={t.field.qcSplit.reduce((s, row) => s + row.n, 0)} tone={r.mark ? markClass(r.mark) : ""} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-card px-5 py-4">
              <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Resolution</p>
              <div className="mt-3 flex min-w-0 items-center gap-4">
                <MiniDonut rows={t.actionCats} />
                <div className="min-w-0 flex-1">
                  <Tip label="Open tickets and tasks" on>
                    <p className="text-[28px] font-bold leading-none tabular-nums">{t.field.tixOpen} open</p>
                  </Tip>
                  <ul className="mt-2 space-y-1">
                    {t.actionCats.map((r) => (
                      <li key={r.label} className="flex items-baseline justify-between gap-2 text-[12px]">
                        <span className="inline-flex min-w-0 items-center gap-1.5 text-muted">
                          <i className="size-1.5 shrink-0 rounded-full" style={{ background: r.tone }} />
                          {r.label}
                        </span>
                        <CountShare n={r.n} total={t.actionCats.reduce((s, row) => s + row.n, 0)} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-px overflow-hidden rounded-md bg-line lg:grid-cols-2">
            <div className="bg-card px-5 py-4">
              <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Top</p>
              <RankList rows={t.top} />
            </div>
            <div className="bg-card px-5 py-4">
              <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Bottom</p>
              <RankList rows={t.bottom} />
            </div>
          </section>

          <section className="grid gap-px overflow-hidden rounded-md bg-line lg:grid-cols-3">
            <div className="bg-card px-5 py-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
                Reviews
                <TrendMark trend={t.trends.reviews} />
              </p>
              <Tip label="Today's score" on>
                <p className="mt-1 flex items-center gap-2">
                  <span className="text-[28px] font-bold tabular-nums">{t.field.reviewScore}</span>
                  <Stars n={5} tone="gold" />
                </p>
              </Tip>
              <ul className="mt-3 space-y-2.5">
                {t.reviews.slice(0, 3).map((r) => (
                  <li key={r.id} className="flex items-start gap-2">
                    <Stars n={r.stars} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{r.name}</span>
                      <span className="line-clamp-1 text-[12px] text-muted">{r.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card px-5 py-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
                Referrals
                <TrendMark trend={t.trends.referrals} />
              </p>
              <Tip label="Referrals in today" on>
                <p className="mt-1 text-[28px] font-bold leading-none tabular-nums">{t.field.referrals}</p>
              </Tip>
              <ul className="mt-3 space-y-2.5">
                {t.referrals.map((r) => (
                  <li key={r.id} className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{r.to}</span>
                      <span className="text-[12px] text-muted">from {r.from}</span>
                    </span>
                    <span className="shrink-0 text-[11px] font-bold tracking-wide text-muted uppercase">{r.status}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card px-5 py-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
                Surveys
                <TrendMark trend={t.trends.surveys} />
              </p>
              <Tip label="Surveys in today" on>
                <p className="mt-1 text-[28px] font-bold leading-none tabular-nums">{t.field.surveys}</p>
              </Tip>
              <ul className="mt-3 space-y-2.5">
                {t.surveys.map((r) => (
                  <li key={r.id} className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{r.name}</span>
                      <span className="line-clamp-1 text-[12px] text-muted">{r.note}</span>
                    </span>
                    <span className="shrink-0 text-[13px] font-bold tabular-nums">{r.score}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
        </div>
        <ShopFeed open={feed} onOpen={() => setFeed(true)} onClose={() => setFeed(false)} />
      </div>
      </>
      )}
    </div>
  );
}
