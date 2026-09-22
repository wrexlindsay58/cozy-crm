import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell as RCell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Sector, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/cn";
import { money } from "@/lib/crm-data";
import { PageTitle } from "@/components/ui-bits";
import { Tip } from "@/components/tip";
import { BookPick } from "@/features/book/pick";
import {
  boards,
  discounts,
  markets,
  officeFill,
  payMix,
  ranges,
  sourceMix,
  viewBoard,
  type Mark,
  type MarketId,
  type RangeId,
} from "@/lib/sales-data";

type Drill = "appointments" | "leads" | "opportunities" | "projects" | "sold";
type MixView = "dollars" | "qty";
type RankBy = "overall" | "sold" | "qty" | "close" | "nsa" | "avg";

function markClass(m?: Mark) {
  if (m === "go") return "text-go";
  if (m === "watch") return "text-watch";
  if (m === "stop") return "text-stop";
  return "";
}

function changePct(now: number, prior: number, invert = false) {
  if (!prior) return null;
  const raw = invert ? (prior - now) / prior : (now - prior) / prior;
  return Math.round(raw * 100);
}

function periodMark(now: number, prior: number, invert = false): Mark | undefined {
  const pct = changePct(now, prior, invert);
  if (pct == null || pct === 0) return undefined;
  if (pct >= 10) return "go";
  if (pct <= -5) return "stop";
  if (pct < 0) return "watch";
  return undefined;
}

function numClass(now: number, prior: number, target?: number, invert = false) {
  const above = target != null && target > 0 && (invert ? now < target : now > target);
  if (above) return "text-go";
  return markClass(periodMark(now, prior, invert)) || "text-navy";
}

function deltaPct(now: number, was: number) {
  if (!was) return null;
  return Math.round(((now - was) / was) * 100);
}

function pipMark(now: number, yest: number, invert = false): Mark | undefined {
  const pct = changePct(now, yest, invert);
  if (pct == null || pct === 0) return undefined;
  if (pct >= 5) return "go";
  if (pct <= -5) return "stop";
  if (pct < 0) return "watch";
  return undefined;
}

function Pip({ now, yest, invert }: { now: number; yest: number; invert?: boolean }) {
  const mark = pipMark(now, yest, invert);
  const fill = mark === "go" ? "var(--color-go)" : mark === "stop" ? "var(--color-stop)" : mark === "watch" ? "var(--color-watch)" : "var(--color-navy)";
  const label = now === yest ? "Even" : (invert ? now < yest : now > yest) ? "Ahead" : "Behind";
  if (now === yest) return <i className="inline-block size-1.5 rounded-full bg-idle" title={label} />;
  return (
    <svg viewBox="0 0 10 10" className="size-2.5 shrink-0" aria-label={label}>
      {(invert ? now < yest : now > yest) ? <path d="M5 1.5 9 8.5H1Z" fill={fill} /> : <path d="M5 8.5 9 1.5H1Z" fill={fill} />}
    </svg>
  );
}

function Delta({ now, was, invert }: { now: number; was: number; invert?: boolean }) {
  const n = deltaPct(now, was);
  if (n == null) return null;
  const mark = periodMark(now, was, invert);
  return (
    <span className={cn("text-[13px] font-semibold tabular-nums", markClass(mark) || "text-navy")}>
      {n > 0 ? "+" : ""}
      {n}%
    </span>
  );
}

const tip = {
  contentStyle: {
    background: "var(--color-card)",
    border: "1px solid var(--color-line)",
    borderRadius: 6,
    fontSize: 12,
    color: "var(--color-ink)",
    boxShadow: "0 8px 20px rgba(11,58,77,0.08)",
  },
  labelStyle: { fontWeight: 700, marginBottom: 2 },
  itemStyle: { fontSize: 12 },
  cursor: false as const,
  offset: 18,
  animationDuration: 0,
  wrapperStyle: { pointerEvents: "none" as const, transition: "none" },
};

function popSlice(props: {
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  fill?: string;
}) {
  return (
    <Sector
      cx={props.cx}
      cy={props.cy}
      innerRadius={Math.max((props.innerRadius ?? 0) - 1, 0)}
      outerRadius={(props.outerRadius ?? 0) + 7}
      startAngle={props.startAngle}
      endAngle={props.endAngle}
      fill={props.fill}
      stroke="var(--color-card)"
      strokeWidth={1.5}
    />
  );
}

function popBar(props: { x?: number; y?: number; width?: number; height?: number; fill?: string }) {
  const x = props.x ?? 0;
  const y = props.y ?? 0;
  const width = props.width ?? 0;
  const height = props.height ?? 0;
  return <rect x={x} y={y - 8} width={width} height={height + 8} rx={3} fill={props.fill} />;
}

function PopPie({
  data,
  dataKey,
  inner,
  outer,
  active,
  onActive,
  formatter,
}: {
  data: { name: string; fill: string }[];
  dataKey: string;
  inner: number | string;
  outer: number | string;
  active?: number;
  onActive: (i: number | undefined) => void;
  formatter?: (v: number) => string | number;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey="name"
          innerRadius={inner}
          outerRadius={outer}
          paddingAngle={2}
          stroke="none"
          isAnimationActive={false}
          activeIndex={active}
          activeShape={popSlice}
          onMouseEnter={(_, i) => onActive(i)}
          onMouseLeave={() => onActive(undefined)}
        >
          {data.map((d, i) => (
            <RCell key={d.name} fill={d.fill} opacity={active == null || active === i ? 1 : 0.32} style={{ cursor: "pointer", outline: "none" }} />
          ))}
        </Pie>
        <Tooltip {...tip} formatter={formatter ? (v: number) => formatter(v) : undefined} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function MixTrack({ pct, fill }: { pct: number; fill?: string }) {
  return (
    <span className="relative block h-3 w-full min-w-0 overflow-hidden rounded-sm bg-page">
      <i
        className="absolute inset-y-[3px] left-0 rounded-sm bg-muted transition-[top,bottom] duration-150 ease-out group-hover:inset-y-0"
        style={{ width: `${Math.min(Math.max(pct, 0), 100)}%`, background: fill }}
      />
    </span>
  );
}

function Spark({ data, moneyBars }: { data: { label: string; now: number; prior: number }[]; moneyBars: boolean }) {
  return (
    <div className="mt-auto h-16 pt-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 6, left: 0, bottom: 0 }}>
          <Tooltip {...tip} formatter={(v: number) => (moneyBars ? money(v) : v)} />
          <Line type="monotone" dataKey="prior" stroke="var(--color-line-strong)" strokeWidth={1.5} dot={false} activeDot={false} isAnimationActive={false} />
          <Line
            type="monotone"
            dataKey="now"
            stroke="var(--color-muted)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 5, fill: "var(--color-navy)", stroke: "var(--color-card)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function TargetBar({ now, target }: { now: number; target: number }) {
  const cap = Math.max(target, now, 1) * 1.15;
  const nowPct = Math.min(100, (now / cap) * 100);
  const goalPct = Math.min(98, Math.max(2, (target / cap) * 100));
  const ofTarget = target ? Math.round((now / target) * 100) : 0;
  return (
    <div className="mt-auto flex h-16 flex-col justify-end gap-1.5 pt-3">
      <p className="flex items-baseline justify-between gap-2 text-[11px]">
        <span>
          <span className="font-semibold tabular-nums">{ofTarget}%</span>
          <span className="text-muted"> of target</span>
        </span>
        <span className="font-semibold tabular-nums">{money(target)}</span>
      </p>
      <span className="relative block h-2 w-full rounded-full bg-page">
        <i className="absolute inset-y-0 left-0 rounded-full bg-navy" style={{ width: `${nowPct}%` }} />
        <i className="absolute top-[-4px] h-4 w-0.5 rounded-full bg-muted" style={{ left: `${goalPct}%` }} />
      </span>
    </div>
  );
}

function avgComm(truePct: number) {
  const cut = Math.ceil((truePct / 2.5) * 10) / 10;
  return Math.max(0, Math.round((20 - cut) * 10) / 10);
}

function Medal({ place }: { place: number }) {
  if (place > 3) return <span className="w-5 text-center text-[13px] font-bold text-muted">{place}</span>;
  const fill = place === 1 ? "#C4A35A" : place === 2 ? "#8AA0AB" : "#A67C52";
  return (
    <span className="inline-flex size-5 items-center justify-center rounded-full text-[11px] font-bold text-card" style={{ background: fill }} aria-label={`${place}`}>
      {place}
    </span>
  );
}

function MixTabs({ value, onChange }: { value: MixView; onChange: (v: MixView) => void }) {
  return (
    <div className="flex rounded-md bg-page p-0.5">
      <Tip label="Dollars" on>
        <button
          type="button"
          aria-label="Dollars"
          onClick={() => onChange("dollars")}
          className={cn("grid size-7 place-items-center rounded-sm text-[12px] font-semibold", value === "dollars" ? "bg-card text-ink" : "text-muted")}
        >
          $
        </button>
      </Tip>
      <Tip label="Quantity" on>
        <button
          type="button"
          aria-label="Quantity"
          onClick={() => onChange("qty")}
          className={cn("grid size-7 place-items-center rounded-sm", value === "qty" ? "bg-card text-ink" : "text-muted")}
        >
          <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
            <path fill="currentColor" d="M3 2.5h2.2V4.7H3zm4.2 0H13v2.2H7.2zM3 6.9h2.2v2.2H3zm4.2 0H13v2.2H7.2zM3 11.3h2.2v2.2H3zm4.2 0H13v2.2H7.2z" />
          </svg>
        </button>
      </Tip>
    </div>
  );
}

const RANK_ITEMS: { id: RankBy; label: string }[] = [
  { id: "overall", label: "Overall" },
  { id: "sold", label: "Sold $" },
  { id: "qty", label: "Quantity" },
  { id: "close", label: "Close" },
  { id: "nsa", label: "NRA" },
  { id: "avg", label: "Avg ticket" },
];

const CLOSE_RATE: Record<string, number> = {
  "Dana Ortiz": 0.43,
  "Marco Velez": 0.34,
  "Luis Haddad": 0.36,
  "Cole Brennan": 0.48,
  "Nate Solis": 0.23,
};

function mixValue(view: MixView, amount: number, qty: number) {
  return view === "qty" ? qty : amount;
}

function mixLabel(view: MixView, amount: number, qty: number) {
  return view === "qty" ? String(qty) : money(amount);
}

export function SalesDashboard({ embedded = false, filterSlot = null }: { embedded?: boolean; filterSlot?: HTMLElement | null }) {
  const [range, setRange] = useState<RangeId>("ytd");
  const [market, setMarket] = useState<MarketId>("all");
  const [person, setPerson] = useState("all");
  const [open, setOpen] = useState<Drill>("leads");
  const [picked, setPicked] = useState("kpi-leads");
  const [productView, setProductView] = useState<MixView>("dollars");
  const [officeView, setOfficeView] = useState<MixView>("dollars");
  const [sourceView, setSourceView] = useState<MixView>("dollars");
  const [payView, setPayView] = useState<MixView>("dollars");
  const [rankBy, setRankBy] = useState<RankBy>("overall");
  const [closerShown, setCloserShown] = useState(3);
  const [closeHover, setCloseHover] = useState<number>();
  const [payHover, setPayHover] = useState<number>();
  const [officeHover, setOfficeHover] = useState<number>();
  const raw = boards[range];
  const t = useMemo(() => viewBoard(raw, market, person), [raw, market, person]);
  const moneyBars = t.id !== "day";
  const leftover = Math.max(t.appts - t.runs, 0);
  const unbooked = Math.max(t.deals - t.jobs, 0);
  const lost = t.nosit + t.missed + t.cancelledN;
  const pay = useMemo(() => payMix(t), [t]);
  const sources = useMemo(() => sourceMix(t), [t]);
  const disc = discounts[t.id];
  const people = useMemo(() => {
    const names = [...raw.closers.map((p) => p.name), ...raw.setters.map((p) => p.name)];
    return [{ id: "all", label: "All people" }, ...names.map((name) => ({ id: name, label: name }))];
  }, [raw]);
  const kpis: { key: Drill; n: number; prior: number; l: string }[] = [
    { key: "leads", n: t.leads, prior: t.priorLeads, l: "Leads" },
    { key: "appointments", n: t.appts, prior: t.priorAppts, l: "Appointments" },
    { key: "opportunities", n: t.runs, prior: t.priorRuns, l: "Runs" },
    { key: "projects", n: t.jobs, prior: t.priorJobs, l: "Jobs" },
  ];
  const nsa = t.runs ? Math.round(t.sold / t.runs) : 0;
  const priorNsa = t.priorRuns ? Math.round(t.priorSold / t.priorRuns) : 0;
  const readyPay = Math.round(t.sold * 0.031);
  const priorReady = Math.round(t.priorSold * 0.028);
  const paidComm = Math.round(t.sold * 0.118);
  const priorPaid = Math.round(t.priorSold * 0.112);
  const commPct = avgComm(disc.truePct);
  const priorCommPct = avgComm(disc.priorTrue);
  const products = t.products.map((p) => {
    const qty = Math.max(1, Math.round(p.amount / Math.max(t.avg, 1)));
    return { ...p, qty };
  });
  const offices = t.offices.map((o) => {
    const qty = Math.max(1, Math.round(o.amount / Math.max(t.avg, 1)));
    return { ...o, qty, fill: officeFill[o.name] ?? "var(--color-muted)", short: o.name.replace("North Phoenix", "N. PHX") };
  });
  const sourceRows = sources.map((s) => ({
    ...s,
    qty: s.leads,
    amount: s.sold,
  }));
  const board = useMemo(() => {
    const rows = t.closers.map((p) => {
      const rate = CLOSE_RATE[p.name] ?? 0.38;
      const runs = p.count ? Math.max(p.count, Math.round(p.count / rate)) : Math.max(4, Math.round(t.runs / Math.max(t.closers.length, 1)));
      const close = runs ? Math.round((p.count / runs) * 100) : 0;
      const avg = p.count ? Math.round(p.amount / p.count) : 0;
      const nsaVal = runs ? Math.round(p.amount / runs) : 0;
      return { ...p, runs, close, avg, nsa: nsaVal };
    });
    const span = (get: (r: (typeof rows)[number]) => number) => {
      const vals = rows.map(get);
      const max = Math.max(...vals, 1);
      const min = Math.min(...vals, 0);
      const d = max - min || 1;
      return (v: number) => (v - min) / d;
    };
    const sSold = span((r) => r.amount);
    const sQty = span((r) => r.count);
    const sClose = span((r) => r.close);
    const sNsa = span((r) => r.nsa);
    const sAvg = span((r) => r.avg);
    return rows
      .map((r) => ({
        ...r,
        overall: (sSold(r.amount) + sQty(r.count) + sClose(r.close) + sNsa(r.nsa) + sAvg(r.avg)) / 5,
      }))
      .sort((a, b) => {
        if (rankBy === "sold") return b.amount - a.amount;
        if (rankBy === "qty") return b.count - a.count;
        if (rankBy === "close") return b.close - a.close;
        if (rankBy === "nsa") return b.nsa - a.nsa;
        if (rankBy === "avg") return b.avg - a.avg;
        return b.overall - a.overall;
      });
  }, [t, rankBy]);
  const closeParts = [
    { name: "Sold", amount: t.deals, fill: "var(--color-navy)" },
    { name: "Didn't close", amount: lost, fill: "var(--color-idle)" },
    { name: "Still out", amount: leftover, fill: "var(--color-line-strong)" },
  ];
  const rates = [
    {
      key: "leads" as Drill,
      label: "Lead to set",
      a: t.appts,
      b: t.leads,
      priorA: t.priorAppts,
      priorB: t.priorLeads,
      drop: `${Math.max(t.leads - t.appts, 0).toLocaleString()} not set`,
    },
    {
      key: "appointments" as Drill,
      label: "Set to run",
      a: t.runs,
      b: t.appts,
      priorA: t.priorRuns,
      priorB: t.priorAppts,
      drop: `${leftover} no run`,
    },
    {
      key: "sold" as Drill,
      label: "Run to sold",
      a: t.deals,
      b: t.runs,
      priorA: t.priorDeals,
      priorB: t.priorRuns,
      drop: `${Math.max(t.runs - t.deals, 0)} no deal`,
    },
    {
      key: "projects" as Drill,
      label: "Sold to job",
      a: t.jobs,
      b: t.deals,
      priorA: t.priorJobs,
      priorB: t.priorDeals,
      drop: `${Math.max(t.deals - t.jobs, 0)} not booked`,
    },
  ];
  const sourceMax = Math.max(...sourceRows.map((s) => mixValue(sourceView, s.amount, s.qty)), 1);

  const filters = (
    <>
      {range === "day" ? (
        <Tip label="As of this hour" on>
          <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-muted">
            <i className="live-pip" />
            Live
          </span>
        </Tip>
      ) : null}
      <BookPick value={market} onChange={setMarket} items={[...markets]} />
      <BookPick value={person} onChange={setPerson} items={people} />
      <div className="ml-auto flex shrink-0 rounded-md bg-page p-0.5">
        {ranges.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRange(r.id)}
            className={cn("h-8 rounded-sm px-2.5 text-[12px] font-semibold", range === r.id ? "bg-card text-ink" : "text-muted")}
          >
            {r.label}
          </button>
        ))}
      </div>
    </>
  );

  return (
    <div className={embedded ? "flex min-h-0 flex-1 flex-col overflow-hidden bg-page" : "h-full min-w-0 space-y-3 overflow-x-hidden overflow-y-auto bg-page p-3"}>
      {embedded && filterSlot ? createPortal(filters, filterSlot) : null}
      {embedded ? null : (
      <PageTitle
        title="Sales"
        actions={<div className="flex w-full min-w-0 items-center gap-2">{filters}</div>}
      />
      )}

      <p className="shrink-0 border-b border-line bg-card px-4 py-2.5 text-center text-[15px] tabular-nums max-md:px-3 max-md:text-left max-md:text-[13px] max-md:leading-5">
        <span className="font-bold">{money(t.sold)} sold</span>
        <span className="text-muted"> · </span>
        <span className="font-bold">{t.close}% close</span>
        <span className="text-muted"> · </span>
        <span className="font-bold">{t.deals.toLocaleString()} deals</span>
        {unbooked ? (
          <>
            <span className="text-muted"> · </span>
            <span className="font-bold text-stop">{unbooked.toLocaleString()} not booked</span>
          </>
        ) : null}
      </p>

      <div className={embedded ? "min-h-0 flex-1 space-y-3 overflow-y-auto p-3" : "contents"}>
      <section className="grid gap-px overflow-hidden rounded-md bg-line sm:grid-cols-2 lg:grid-cols-4">
        <button type="button" onClick={() => { setOpen("sold"); setPicked("hero-sold"); }} className={cn("flex h-full flex-col bg-card p-5 text-left", picked === "hero-sold" && "shadow-[inset_3px_0_0_0_var(--color-navy)]")}>
          <p className="flex h-4 items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
            Sold
            <Pip now={t.sold} yest={t.priorSold} />
          </p>
          <p className={cn("mt-1 text-[36px] font-bold leading-none tabular-nums tracking-tight max-md:text-[28px]", numClass(t.sold, t.priorSold, t.goalSold))}>{money(t.sold)}</p>
          <p className="mt-2 flex h-5 items-center gap-2">
            <Delta now={t.sold} was={t.priorSold} />
            <span className="text-[12px] text-muted">vs {t.vs}</span>
          </p>
          <p className="mt-1 h-4 text-[12px] text-muted">
            {t.deals} deals · disc {disc.pct}%
          </p>
          <Spark data={t.bars} moneyBars={moneyBars} />
        </button>

        <button
          type="button"
          onClick={() => { setOpen("appointments"); setPicked("hero-close"); }}
          className={cn("flex h-full flex-col bg-card p-5 text-left", picked === "hero-close" && "shadow-[inset_3px_0_0_0_var(--color-navy)]")}
        >
          <p className="flex h-4 items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
            Close
            <Pip now={t.close} yest={t.priorClose} />
          </p>
          <p className={cn("mt-1 text-[36px] font-bold leading-none tabular-nums tracking-tight max-md:text-[28px]", numClass(t.close, t.priorClose, t.goalClose))}>{t.close}%</p>
          <p className="mt-2 flex h-5 items-center gap-2">
            <Delta now={t.close} was={t.priorClose} />
            <span className="text-[12px] text-muted">vs {t.vs}</span>
          </p>
          <p className="mt-1 h-4 text-[12px] text-muted">
            {t.deals} sold of {t.runs} ran
          </p>
          <div className="mt-auto flex h-16 items-center gap-3">
            <div className="relative size-16 shrink-0">
              <div className="absolute top-1/2 left-1/2 size-24 -translate-x-1/2 -translate-y-[calc(50%-6px)]">
                <PopPie data={closeParts} dataKey="amount" inner={18} outer={28} active={closeHover} onActive={setCloseHover} />
              </div>
            </div>
            <ul className="min-w-0 flex-1 translate-y-[6px] space-y-0.5 text-[11px]">
              {closeParts.map((s, i) => (
                <li
                  key={s.name}
                  className={cn("-mx-1 flex items-center justify-between gap-2 rounded-sm px-1", closeHover === i && "bg-page")}
                  onMouseEnter={() => setCloseHover(i)}
                  onMouseLeave={() => setCloseHover(undefined)}
                >
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <i className="size-1.5 shrink-0 rounded-sm" style={{ background: s.fill }} />
                    <span className="truncate">{s.name}</span>
                  </span>
                  <span className="font-semibold tabular-nums">{s.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        </button>

        <div className="flex h-full flex-col bg-card p-5">
          <p className="flex h-4 items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
            NRA
            <Pip now={nsa} yest={priorNsa} />
          </p>
          <p className={cn("mt-1 text-[36px] font-bold leading-none tabular-nums tracking-tight max-md:text-[28px]", numClass(nsa, priorNsa, 4000))}>{money(nsa)}</p>
          <p className="mt-2 flex h-5 items-center gap-2">
            <Delta now={nsa} was={priorNsa} />
            <span className="text-[12px] text-muted">vs {t.vs}</span>
          </p>
          <p className="mt-1 h-4 text-[12px] text-muted">Net revenue per appointment</p>
          <TargetBar now={nsa} target={4000} />
        </div>

        <div className="flex h-full flex-col bg-card p-5">
          <p className="flex h-4 items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
            Avg ticket
            <Pip now={t.avg} yest={t.priorAvg} />
          </p>
          <p className={cn("mt-1 text-[36px] font-bold leading-none tabular-nums tracking-tight max-md:text-[28px]", numClass(t.avg, t.priorAvg, 15000))}>{money(t.avg)}</p>
          <p className="mt-2 flex h-5 items-center gap-2">
            <Delta now={t.avg} was={t.priorAvg} />
            <span className="text-[12px] text-muted">vs {t.vs}</span>
          </p>
          <p className="mt-1 h-4 text-[12px] text-muted">{disc.pct}% sold discount</p>
          <TargetBar now={t.avg} target={15000} />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-line lg:grid-cols-5">
        <div className="bg-card px-4 py-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
            True discount
            <Pip now={disc.truePct} yest={disc.priorTrue} invert />
          </p>
          <p className={cn("mt-1 text-[28px] font-bold tabular-nums", numClass(disc.truePct, disc.priorTrue, undefined, true))}>{disc.truePct}%</p>
          <p className="mt-1 text-[12px] text-muted">
            <Delta now={disc.truePct} was={disc.priorTrue} invert /> vs {t.vs}
          </p>
        </div>
        <div className="bg-card px-4 py-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
            Sold discount
            <Pip now={disc.pct} yest={disc.prior} invert />
          </p>
          <p className={cn("mt-1 text-[28px] font-bold tabular-nums", numClass(disc.pct, disc.prior, undefined, true))}>{disc.pct}%</p>
          <p className="mt-1 text-[12px] text-muted">
            <Delta now={disc.pct} was={disc.prior} invert /> vs {t.vs}
          </p>
        </div>
        <div className="bg-card px-4 py-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
            Avg. Commission %
            <Pip now={commPct} yest={priorCommPct} />
          </p>
          <p className={cn("mt-1 text-[28px] font-bold tabular-nums", numClass(commPct, priorCommPct))}>{commPct}%</p>
          <p className="mt-1 text-[12px] text-muted">
            <Delta now={commPct} was={priorCommPct} /> vs {t.vs}
          </p>
        </div>
        <div className="bg-card px-4 py-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
            Commissions RTP
            <Pip now={readyPay} yest={priorReady} />
          </p>
          <p className={cn("mt-1 text-[28px] font-bold tabular-nums", numClass(readyPay, priorReady))}>{money(readyPay)}</p>
          <p className="mt-1 text-[12px] text-muted">
            <Delta now={readyPay} was={priorReady} /> vs {t.vs}
          </p>
        </div>
        <div className="bg-card px-4 py-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
            Commissions Paid
            <Pip now={paidComm} yest={priorPaid} />
          </p>
          <p className={cn("mt-1 text-[28px] font-bold tabular-nums", numClass(paidComm, priorPaid))}>{money(paidComm)}</p>
          <p className="mt-1 text-[12px] text-muted">
            <Delta now={paidComm} was={priorPaid} /> vs {t.vs}
          </p>
        </div>
      </section>

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
              { n: t.nosit, l: "No sit" },
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

      {open === "projects" ? (
        <section className="rounded-md bg-card p-5">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h2 className="text-[13px] font-bold">Jobs</h2>
            <Link to="/projects" className="text-[13px] font-semibold text-navy">
              Open
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {t.jobSplit.map((item) => (
              <div key={item.label} className="rounded-sm bg-page px-3 py-2">
                <b className="block text-[20px] font-bold tabular-nums">{item.n}</b>
                <span className="text-[11px] font-semibold text-muted">{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {open === "sold" ? (
        <section className="rounded-md bg-card p-5">
          <h2 className="mb-3 text-[13px] font-bold">Sold mix</h2>
          <div className="space-y-2">
            {t.products.map((p) => (
              <div key={p.name} className="grid grid-cols-[minmax(4.5rem,7.5rem)_minmax(3rem,1fr)_auto] items-center gap-2 text-[13px]">
                <span className="truncate font-semibold">{p.name}</span>
                <span className="h-2 overflow-hidden rounded-sm bg-page">
                  <i className="block h-full bg-muted" style={{ width: `${(p.amount / Math.max(t.products[0]?.amount, 1)) * 100}%` }} />
                </span>
                <span className="flex shrink-0 items-baseline justify-end gap-4 tabular-nums">
                  <span className="text-right font-bold">{money(p.amount)}</span>
                  <span className="w-10 text-right font-normal text-muted">{t.sold ? Math.round((p.amount / t.sold) * 100) : 0}%</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-px overflow-hidden rounded-md bg-line sm:grid-cols-2 lg:grid-cols-4">
        {rates.map((r) => {
          const pct = r.b ? Math.round((r.a / r.b) * 100) : 0;
          const priorPct = r.priorB ? Math.round((r.priorA / r.priorB) * 100) : 0;
          return (
            <button
              key={r.label}
              type="button"
              onClick={() => { setOpen(r.key); setPicked(`rate-${r.label}`); }}
              className={cn("bg-card p-4 text-left", picked === `rate-${r.label}` && "shadow-[inset_3px_0_0_0_var(--color-navy)]")}
            >
              <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
                {r.label}
                <Pip now={pct} yest={priorPct} />
              </p>
              <p className={cn("mt-1 text-[28px] font-bold tabular-nums", numClass(pct, priorPct))}>{pct}%</p>
              <p className="mt-1 text-[12px] text-muted">
                {r.a.toLocaleString()} of {r.b.toLocaleString()}
              </p>
              <p className="mt-1 text-[12px] text-muted">
                <Delta now={pct} was={priorPct} /> vs {t.vs}
              </p>
              <p className="mt-2 text-[12px] text-muted">{r.drop}</p>
            </button>
          );
        })}
      </section>

      <section className="grid gap-px overflow-hidden rounded-md bg-line lg:grid-cols-2">
        <article className="bg-card p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-[13px] font-bold">Product</h3>
            <MixTabs value={productView} onChange={setProductView} />
          </div>
          <div className="space-y-2 hover:[&>button]:opacity-40 hover:[&>button:hover]:opacity-100">
            {products.map((p) => {
              const max = Math.max(...products.map((x) => mixValue(productView, x.amount, x.qty)), 1);
              const v = mixValue(productView, p.amount, p.qty);
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setOpen("sold")}
                  className="group grid w-full grid-cols-[minmax(4.5rem,7.5rem)_minmax(3rem,1fr)_auto] items-center gap-2 text-left text-[13px] transition-opacity duration-150"
                >
                  <span className="truncate">{p.name}</span>
                  <span>
                    <MixTrack pct={(v / max) * 100} />
                  </span>
                  <span className="flex shrink-0 items-baseline justify-end gap-4 tabular-nums">
                    <span className="text-right font-bold">{mixLabel(productView, p.amount, p.qty)}</span>
                    <span className="w-10 text-right font-normal text-muted">
                      {productView === "qty"
                        ? `${t.deals ? Math.round((p.qty / t.deals) * 100) : 0}%`
                        : `${t.sold ? Math.round((p.amount / t.sold) * 100) : 0}%`}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </article>
        <article className="bg-card p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-[13px] font-bold">Office</h3>
            <MixTabs value={officeView} onChange={setOfficeView} />
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={offices.map((o) => ({
                  name: o.short,
                  value: mixValue(officeView, o.amount, o.qty),
                  fill: o.fill,
                }))}
                margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
                onMouseMove={(state) => {
                  const i = state?.activeTooltipIndex;
                  setOfficeHover(typeof i === "number" ? i : undefined);
                }}
                onMouseLeave={() => setOfficeHover(undefined)}
              >
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-faint)" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  {...tip}
                  cursor={{ fill: "var(--color-page)", opacity: 0.65 }}
                  formatter={(v: number) => (officeView === "dollars" ? money(v) : v)}
                />
                <Bar dataKey="value" radius={[3, 3, 0, 0]} cursor="pointer" activeBar={popBar} isAnimationActive={false}>
                  {offices.map((o, i) => (
                    <RCell key={o.name} fill={o.fill} opacity={officeHover == null || officeHover === i ? 1 : 0.32} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1 text-[12px]">
            {offices.map((o, i) => (
              <li
                key={o.name}
                className={cn("-mx-1 flex items-center justify-between gap-2 rounded-sm px-1 py-0.5", officeHover === i && "bg-page")}
                onMouseEnter={() => setOfficeHover(i)}
                onMouseLeave={() => setOfficeHover(undefined)}
              >
                <span className="inline-flex items-center gap-1.5">
                  <i className="size-2 rounded-sm" style={{ background: o.fill }} />
                  {o.short}
                </span>
                <span className="flex shrink-0 items-baseline justify-end gap-4 tabular-nums">
                  <span className="text-right">{mixLabel(officeView, o.amount, o.qty)}</span>
                  <span className="w-10 text-right text-muted">{t.sold ? Math.round((o.amount / t.sold) * 100) : 0}%</span>
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid gap-px overflow-hidden rounded-md bg-line lg:grid-cols-2">
        <article className="flex h-full flex-col bg-card p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-[13px] font-bold">Payment</h3>
              <p className="text-[12px] text-muted">Cash includes check. Mixed deals are split.</p>
            </div>
            <MixTabs value={payView} onChange={setPayView} />
          </div>
          <div className="flex flex-1 items-center gap-5">
            <div className="relative size-44 shrink-0 sm:size-52">
              <PopPie
                data={pay}
                dataKey={payView === "dollars" ? "amount" : "qty"}
                inner="52%"
                outer="84%"
                active={payHover}
                onActive={setPayHover}
                formatter={(v) => (payView === "dollars" ? money(v) : v)}
              />
            </div>
            <ul className="min-w-0 flex-1 space-y-1.5 text-[12px]">
              {pay.map((p, i) => (
                <li
                  key={p.name}
                  className={cn("-mx-1 flex items-center justify-between gap-3 rounded-sm px-1 py-0.5", payHover === i && "bg-page")}
                  onMouseEnter={() => setPayHover(i)}
                  onMouseLeave={() => setPayHover(undefined)}
                >
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <i className="size-2.5 shrink-0 rounded-sm" style={{ background: p.fill }} />
                    <span className="truncate">{p.name}</span>
                  </span>
                  <span className="flex shrink-0 items-baseline justify-end gap-4 tabular-nums">
                    <span className="text-right font-semibold">{mixLabel(payView, p.amount, p.qty)}</span>
                    <span className="w-10 text-right text-muted">{t.deals ? Math.round((p.qty / t.deals) * 100) : 0}%</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </article>
        <article className="bg-card p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-[13px] font-bold">Lead source</h3>
              <p className="text-[12px] text-muted">Share of leads and sold</p>
            </div>
            <MixTabs value={sourceView} onChange={setSourceView} />
          </div>
          <ul className="space-y-2.5 hover:[&>li]:opacity-40 hover:[&>li:hover]:opacity-100">
            {sourceRows.map((s) => {
              const v = mixValue(sourceView, s.amount, s.qty);
              const leadPct = t.leads ? Math.round((s.leads / t.leads) * 100) : 0;
              const soldPct = t.sold ? Math.round((s.sold / t.sold) * 100) : 0;
              return (
                <li key={s.name} className="group transition-opacity duration-150">
                  <div className="mb-1 flex items-center justify-between gap-2 text-[13px]">
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <i className="size-2.5 rounded-sm" style={{ background: s.fill }} />
                      {s.name}
                    </span>
                    <span className="flex shrink-0 items-baseline justify-end gap-4 tabular-nums text-muted">
                      <span className="text-right">{mixLabel(sourceView, s.amount, s.qty)}</span>
                      <span className="w-10 text-right">{sourceView === "dollars" ? `${soldPct}%` : `${leadPct}%`}</span>
                    </span>
                  </div>
                  <MixTrack pct={(v / sourceMax) * 100} fill={s.fill} />
                </li>
              );
            })}
          </ul>
        </article>
      </section>

      <section className="rounded-md bg-card p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h3 className="text-[13px] font-bold">{t.barTitle}</h3>
          <ul className="flex gap-4 text-[12px]">
            <li className="inline-flex items-center gap-1.5">
              <i className="size-2.5 rounded-sm bg-muted" /> This period
            </li>
            <li className="inline-flex items-center gap-1.5">
              <i className="size-2.5 rounded-sm bg-line-strong" /> {t.vs}
            </li>
          </ul>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={t.bars} margin={{ top: 12, right: 12, left: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--color-line)" strokeDasharray="4 8" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-faint)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip {...tip} formatter={(v: number) => (moneyBars ? money(v) : v)} />
              <Line type="monotone" dataKey="prior" stroke="var(--color-line-strong)" strokeWidth={2} dot={false} isAnimationActive={false} activeDot={{ r: 4, fill: "var(--color-line-strong)", stroke: "var(--color-card)", strokeWidth: 2 }} />
              <Line
                type="monotone"
                dataKey="now"
                stroke="var(--color-muted)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "var(--color-muted)", strokeWidth: 0 }}
                isAnimationActive={false}
                activeDot={{ r: 6, fill: "var(--color-navy)", stroke: "var(--color-card)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-md bg-card p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[13px] font-bold">Closers</h3>
          <BookPick
            value={rankBy}
            onChange={(id) => {
              setRankBy(id);
              setCloserShown(3);
            }}
            items={RANK_ITEMS}
          />
        </div>
        <ol className="space-y-2 hover:[&>li]:opacity-40 hover:[&>li:hover]:opacity-100">
          {board.slice(0, closerShown).map((p, i) => {
            const shown =
              rankBy === "qty"
                ? `${p.count} sold`
                : rankBy === "close"
                  ? `${p.close}%`
                  : rankBy === "nsa"
                    ? money(p.nsa)
                    : rankBy === "avg"
                      ? money(p.avg)
                      : rankBy === "overall"
                        ? `${Math.round(p.overall * 100)}`
                        : money(p.amount);
            const barMax = Math.max(
              ...board.map((r) =>
                rankBy === "qty" ? r.count : rankBy === "close" ? r.close : rankBy === "nsa" ? r.nsa : rankBy === "avg" ? r.avg : rankBy === "overall" ? r.overall : r.amount,
              ),
              0.01,
            );
            const barNow =
              rankBy === "qty" ? p.count : rankBy === "close" ? p.close : rankBy === "nsa" ? p.nsa : rankBy === "avg" ? p.avg : rankBy === "overall" ? p.overall : p.amount;
            return (
              <li key={p.name}>
                <button
                  type="button"
                  onClick={() => setPerson(p.name)}
                  className="group grid w-full grid-cols-[1.5rem_1fr_auto] items-center gap-3 text-left text-[13px] transition-opacity duration-150"
                >
                  <Medal place={i + 1} />
                  <div className="min-w-0">
                    <p className="font-semibold">{p.name}</p>
                    <MixTrack pct={(barNow / barMax) * 100} />
                    <p className="mt-0.5 text-[11px] text-muted">
                      {p.count} sold · {p.close}% close · NRA {money(p.nsa)} · {money(p.avg)} avg
                    </p>
                  </div>
                  <b className={cn("tabular-nums", p.amount === 0 && "text-stop")}>{shown}</b>
                </button>
              </li>
            );
          })}
        </ol>
        {closerShown < board.length ? (
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => setCloserShown((n) => Math.min(board.length, n + 3))}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-navy"
            >
              Next {Math.min(3, board.length - closerShown)}
              <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
                <path d="M4 6.2 8 10.2 12 6.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ) : null}
      </section>
      </div>
    </div>
  );
}
