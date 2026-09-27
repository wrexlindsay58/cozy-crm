import type { Bar, MixRow, Person, RangeId, SalesBoard, Split } from "./types";

export const ranges: { id: RangeId; label: string }[] = [
  { id: "ltd", label: "LTD" },
  { id: "ytd", label: "YTD" },
  { id: "qtd", label: "QTD" },
  { id: "mtd", label: "MTD" },
  { id: "wtd", label: "WTD" },
  { id: "day", label: "Day" },
];

export const officeFill: Record<string, string> = {
  Phoenix: "var(--color-navy)",
  Scottsdale: "var(--color-navy-2)",
  Dallas: "var(--color-muted)",
  "Fort Worth": "var(--color-idle)",
  "North Phoenix": "var(--color-faint)",
};

export const markets = [
  { id: "all", label: "All markets" },
  { id: "PHX", label: "Phoenix" },
  { id: "SDL", label: "Scottsdale" },
  { id: "DAL", label: "Dallas" },
  { id: "FTW", label: "Fort Worth" },
] as const;

export type MarketId = (typeof markets)[number]["id"];

export const discounts: Record<RangeId, { pct: number; prior: number; truePct: number; priorTrue: number }> = {
  ltd: { pct: 8.1, prior: 8.9, truePct: 11.4, priorTrue: 12.1 },
  ytd: { pct: 8.4, prior: 9.2, truePct: 11.8, priorTrue: 12.6 },
  qtd: { pct: 8.8, prior: 8.1, truePct: 12.4, priorTrue: 11.2 },
  mtd: { pct: 9.1, prior: 8.6, truePct: 13.1, priorTrue: 11.9 },
  wtd: { pct: 7.6, prior: 8.4, truePct: 10.2, priorTrue: 11.4 },
  day: { pct: 6.2, prior: 11.0, truePct: 8.6, priorTrue: 14.2 },
};

export const MARKET_OFFICE: Record<MarketId, string[]> = {
  all: ["Phoenix", "Scottsdale", "Dallas", "Fort Worth", "North Phoenix"],
  PHX: ["Phoenix", "North Phoenix"],
  SDL: ["Scottsdale"],
  DAL: ["Dallas"],
  FTW: ["Fort Worth"],
};

export const MARKET_K: Record<MarketId, number> = {
  all: 1,
  PHX: 0.415,
  SDL: 0.289,
  DAL: 0.193,
  FTW: 0.103,
};

export function n(x: number, k: number) {
  return Math.max(0, Math.round(x * k));
}

export function scale(t: SalesBoard, k: number): SalesBoard {
  if (Math.abs(k - 1) < 0.001) return t;
  const mix = (rows: Split[]) => {
    const next = rows.map((r) => ({ ...r, n: n(r.n, k) }));
    const total = next.reduce((s, r) => s + r.n, 0) || 1;
    return next.map((r) => ({ ...r, pct: Math.round((r.n / total) * 100) }));
  };
  return {
    ...t,
    sold: n(t.sold, k),
    priorSold: n(t.priorSold, k),
    goalSold: n(t.goalSold, k),
    deals: n(t.deals, k),
    priorDeals: n(t.priorDeals, k),
    goalDeals: n(t.goalDeals, k),
    cancel: n(t.cancel, k),
    priorCancel: n(t.priorCancel, k),
    cashIn: n(t.cashIn, k),
    priorCash: n(t.priorCash, k),
    finance: n(t.finance, k),
    card: n(t.card, k),
    leads: n(t.leads, k),
    priorLeads: n(t.priorLeads, k),
    appts: n(t.appts, k),
    priorAppts: n(t.priorAppts, k),
    runs: n(t.runs, k),
    priorRuns: n(t.priorRuns, k),
    cancelledN: n(t.cancelledN, k),
    jobs: n(t.jobs, k),
    priorJobs: n(t.priorJobs, k),
    opps: n(t.opps, k),
    sitsLeft: t.sitsLeft == null ? undefined : n(t.sitsLeft, k),
    mix: mix(t.mix),
    leadSplit: mix(t.leadSplit),
    apptSplit: mix(t.apptSplit),
    jobSplit: mix(t.jobSplit),
    products: t.products.map((p) => ({ ...p, amount: n(p.amount, k) })),
    offices: t.offices.map((p) => ({ ...p, amount: n(p.amount, k) })),
    funnel: t.funnel.map((f) => ({ ...f, n: n(f.n, k) })),
    bars: t.bars.map((b) => ({ ...b, now: n(b.now, k), prior: n(b.prior, k) })),
    closers: t.closers.map((p) => ({ ...p, amount: n(p.amount, k), count: n(p.count, k) })),
    setters: t.setters.map((p) => ({ ...p, amount: n(p.amount, k), count: n(p.count, k) })),
    unmarked: n(t.unmarked, k),
    nosit: n(t.nosit, k),
    missed: n(t.missed, k),
    oneleg: n(t.oneleg, k),
  };
}

export function viewBoard(t: SalesBoard, market: MarketId, person: string): SalesBoard {
  let pk = 1;
  if (person !== "all") {
    const closer = t.closers.find((p) => p.name === person);
    const setter = t.setters.find((p) => p.name === person);
    if (closer && t.sold) pk = closer.amount / t.sold;
    else if (setter) {
      const total = t.setters.reduce((s, x) => s + x.amount, 0) || 1;
      pk = setter.amount / total;
    }
  }
  const mk = MARKET_K[market];
  const out = scale(t, pk * mk);
  const keep = MARKET_OFFICE[market];
  const offices = t.offices
    .filter((o) => keep.includes(o.name))
    .map((o) => ({ ...o, amount: n(o.amount, pk) }));
  let closers = out.closers;
  let setters = out.setters;
  if (person !== "all") {
    closers = out.closers.filter((p) => p.name === person);
    setters = out.setters.filter((p) => p.name === person);
    if (!closers.length) closers = out.closers.slice(0, 3);
    if (!setters.length) setters = out.setters.slice(0, 2);
  }
  return { ...out, offices, closers, setters };
}
