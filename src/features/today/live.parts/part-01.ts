import { referrals, reviews, surveys } from "@/lib/snapshot";
import { tickets, type Lead } from "@/lib/crm-data";
import type { Resource } from "@/features/book/roster";
import type { BookEvent } from "@/features/book/types";
import { hourOf } from "@/features/book/time";
import { prep_buildToday } from "./part-02";

export type Mark = "go" | "watch" | "stop";

export type Split = { label: string; n: number; pct: number; tone: string; ink?: boolean; mark?: Mark };

export const STEEL = "var(--color-idle)";

export const WASH = "var(--color-line-strong)";

export const MID = "var(--color-muted)";

export const LIVE = "var(--color-navy)";

export function pack(rows: { label: string; n: number; tone: string; ink?: boolean; mark?: Mark }[]): Split[] {
  const total = rows.reduce((s, r) => s + r.n, 0);
  return rows.map((r) => ({ ...r, pct: total ? Math.round((r.n / total) * 100) : 0 }));
}

export type Rank = { id: string; name: string; role: string; amount: number; why: string; href: string };

export type Trend = { now: number; yest: number; goal: number; money?: boolean };

export type FlowBar = { key: string; label: string; now: number; yest: number };

export type SparkPt = { h: number; spend: number; sold: number };

export type FieldNow = {
  demand: number;
  capacity: number;
  demandPct: number;
  crewsOut: number;
  crewsIdle: number;
  crewsN: number;
  installsDone: number;
  installsLive: number;
  installsWait: number;
  repsOut: number;
  repsIdle: number;
  repsN: number;
  runsLeft: number;
  runsLive: number;
  runsDone: number;
  qcOut: number;
  qcFail: number;
  qcDone: number;
  qcReason: string;
  tixAdded: number;
  tixDone: number;
  tixOpen: number;
  tixCat: string;
  reviews: number;
  reviewScore: number;
  referrals: number;
  surveys: number;
  qcTechs: number;
  bookValue: number;
  holds: number;
  late: number;
  perCrew: number;
  qcPassPct: number;
  installSplit: Split[];
  runNowSplit: Split[];
  qcSplit: Split[];
  crewSplit: Split[];
  repSplit: Split[];
};

export function valueOf(e: BookEvent, leads: Lead[]) {
  return leads.find((l) => l.id === e.personId)?.value ?? 0;
}

function whoName(id: string, roster: Resource[]) {
  return roster.find((r) => r.id === id)?.name ?? id;
}

export function prep_buildToday2(opts: any) {
  const { CAT, catN, catTone, roster, office, sales, leads, hour, prod, yestSales, passed, yestPassed, soldN, yestSoldEv, yestProd, cancelled, nosit, sold, yesterday, left, jobsDone, jobsOut, jobsPending, tixOpen, tixAdded, tixClosed, day, closeRate, spent, cashIn, marketingSpend, marketingSold, ticket, yestTicket, yestClose, yestLeft, yestJobsDone, payroll, decided, expected, mktBySource, mktSpark, dealSpark } = prep_buildToday(opts);
  for (const row of tickets) {
    const c = CAT[row.id] ?? "Callback";
    catN[c] = (catN[c] ?? 0) + 1;
  }
  const actionCats = pack(Object.entries(catN).map(([label, n], i) => ({ label, n, tone: catTone[i % catTone.length] })));
  const closers = roster.filter((r: any) => r.kind === "closer" && (office === "all" || r.office === office));
  const crews = roster.filter((r: any) => r.kind === "crew" && (office === "all" || r.office === office));
  const setters = roster.filter((r: any) => r.kind === "setter" && (office === "all" || r.office === office));
  const closerRank: Rank[] = closers
    .map((r: any) => {
      const mine = sales.filter((e: any) => e.resourceId === r.id);
      const amt = mine.filter((e: any) => e.status === "Done").reduce((s: any, e: any) => s + valueOf(e, leads), 0);
      const leftN = mine.filter((e: any) => hourOf(e.end) > hour && e.status !== "Done").length;
      return {
        id: r.id,
        name: r.name,
        role: "Closer",
        amount: amt,
        why: amt ? `${mine.filter((e: any) => e.status === "Done").length} sold` : leftN ? `${leftN} sits left` : "No sold",
        href: "/calendar",
      };
    })
    .sort((a: any, b: any) => b.amount - a.amount);
  const crewRank: Rank[] = crews
    .map((r: any) => {
      const mine = prod.filter((e: any) => e.resourceId === r.id);
      const done = mine.filter((e: any) => e.status === "Done").length;
      return {
        id: r.id,
        name: r.name,
        role: "Crew",
        amount: mine.length,
        why: mine.length ? mine.map((e: any) => e.title).join(", ") : "No jobs",
        href: "/dispatch",
      };
    })
    .sort((a: any, b: any) => b.amount - a.amount);
  const setterRank: Rank[] = setters
    .map((r: any) => {
      const mine = sales.filter((e: any) => e.setBy === r.name || whoName(e.resourceId, roster) === r.name);
      return {
        id: r.id,
        name: r.name,
        role: "Setter",
        amount: mine.length,
        why: mine.length ? `${mine.length} on the book` : "No sets today",
        href: "/calendar",
      };
    })
    .sort((a: any, b: any) => b.amount - a.amount);
  return { closerRank, crewRank, setterRank, sales, yestSales, passed, yestPassed, soldN, yestSoldEv, prod, yestProd, cancelled, nosit, hour, sold, yesterday, left, jobsDone, jobsOut, jobsPending, tixOpen, tixAdded, tixClosed, day, crews, closers, leads, closeRate, spent, cashIn, marketingSpend, marketingSold, ticket, yestTicket, yestClose, yestLeft, yestJobsDone, payroll, decided, expected, mktBySource, mktSpark, dealSpark, actionCats };
}
