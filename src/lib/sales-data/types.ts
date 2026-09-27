export type RangeId = "ltd" | "ytd" | "qtd" | "mtd" | "wtd" | "day";

export type Mark = "go" | "watch" | "stop";

export type Split = { label: string; n: number; pct: number; tone: string; mark?: Mark };

export type Trend = { now: number; yest: number; goal: number; money?: boolean };

export type Bar = { label: string; now: number; prior: number; hot?: boolean };

export type MixRow = { name: string; amount: number };

export type Person = { name: string; why: string; amount: number; count: number };

export type SalesBoard = {
  id: RangeId;
  vs: string;
  sold: number;
  priorSold: number;
  goalSold: number;
  deals: number;
  priorDeals: number;
  goalDeals: number;
  close: number;
  priorClose: number;
  goalClose: number;
  avg: number;
  priorAvg: number;
  cancel: number;
  priorCancel: number;
  cashIn: number;
  priorCash: number;
  finance: number;
  card: number;
  leads: number;
  priorLeads: number;
  appts: number;
  priorAppts: number;
  runs: number;
  priorRuns: number;
  cancelledN: number;
  jobs: number;
  priorJobs: number;
  opps: number;
  sitsLeft?: number;
  mix: Split[];
  leadSplit: Split[];
  apptSplit: Split[];
  jobSplit: Split[];
  products: MixRow[];
  offices: MixRow[];
  funnel: { label: string; n: number; rate: string }[];
  bars: Bar[];
  barTitle: string;
  barHint: string;
  closers: Person[];
  setters: Person[];
  unmarked: number;
  nosit: number;
  missed: number;
  oneleg: number;
};
