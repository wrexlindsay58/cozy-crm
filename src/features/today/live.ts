import { cashOut, dayGoals, referrals, reviews, snapshot } from "@/lib/snapshot";
import { tickets, type Lead } from "@/lib/crm-data";
import type { Resource } from "@/features/book/roster";
import { familyOf, isWatch, type BookEvent } from "@/features/book/types";
import { hourOf } from "@/features/book/time";

export type Mark = "go" | "watch" | "stop";
export type Split = { label: string; n: number; pct: number; tone: string; ink?: boolean; mark?: Mark };

const STEEL = "var(--color-idle)";
const WASH = "var(--color-line-strong)";
const MID = "var(--color-muted)";
const LIVE = "var(--color-navy)";

function pack(rows: { label: string; n: number; tone: string; ink?: boolean; mark?: Mark }[]): Split[] {
  const total = rows.reduce((s, r) => s + r.n, 0);
  return rows.map((r) => ({ ...r, pct: total ? Math.round((r.n / total) * 100) : 0 }));
}
export type Rank = { id: string; name: string; role: string; amount: number; why: string; href: string };
export type Trend = { now: number; yest: number; goal: number; money?: boolean };
export type HourBar = { h: number; label: string; sales: number; prod: number; yestSales: number; yestProd: number };

function valueOf(e: BookEvent, leads: Lead[]) {
  return leads.find((l) => l.id === e.personId)?.value ?? 0;
}

function whoName(id: string, roster: Resource[]) {
  return roster.find((r) => r.id === id)?.name ?? id;
}

function hourLabel(h: number) {
  if (h === 0 || h === 24) return "12a";
  if (h === 12) return "12p";
  if (h < 12) return `${h}a`;
  return `${h - 12}p`;
}

export function buildToday(opts: {
  events: BookEvent[];
  leads: Lead[];
  roster: Resource[];
  dayKey: string;
  yestKey: string;
  hour: number;
  office: "all" | "PHX" | "DFW";
}) {
  const { events, leads, roster, dayKey, yestKey, hour, office } = opts;
  const day = events.filter((e) => e.start.slice(0, 10) === dayKey && (office === "all" || e.office === office) && !e.blank);
  const yest = events.filter((e) => e.start.slice(0, 10) === yestKey && (office === "all" || e.office === office) && !e.blank);
  const sales = day.filter((e) => familyOf(e.type) === "sales");
  const prod = day.filter((e) => familyOf(e.type) === "production");
  const yestSales = yest.filter((e) => familyOf(e.type) === "sales");
  const yestProd = yest.filter((e) => familyOf(e.type) === "production");
  const soldEv = sales.filter((e) => e.status === "Done" && hourOf(e.end) <= hour);
  const yestSoldEv = yestSales.filter((e) => e.status === "Done" && hourOf(e.end) <= hour);
  const sold = soldEv.reduce((s, e) => s + valueOf(e, leads), 0);
  const soldN = soldEv.length;
  const yesterday = yestSoldEv.reduce((s, e) => s + valueOf(e, leads), 0);
  const passed = sales.filter((e) => hourOf(e.end) <= hour);
  const left = sales.filter((e) => hourOf(e.end) > hour);
  const yestPassed = yestSales.filter((e) => hourOf(e.end) <= hour);
  const yestLeft = yestSales.filter((e) => hourOf(e.end) > hour);
  const nosit = day.filter((e) => (e.status === "No-sit" || e.status === "No-show") && hourOf(e.end) <= hour);
  const yestNosit = yest.filter((e) => (e.status === "No-sit" || e.status === "No-show") && hourOf(e.end) <= hour);
  const cancelled = snapshot.cancelledToday;
  const decided = soldN + nosit.length + cancelled;
  const closeRate = decided ? Math.round((soldN / decided) * 100) : 0;
  const yestDecided = yestSoldEv.length + yestNosit.length + snapshot.cancelledYest;
  const yestClose = yestDecided ? Math.round((yestSoldEv.length / yestDecided) * 100) : 0;
  const jobsDone = prod.filter((e) => e.status === "Done" && hourOf(e.end) <= hour).length;
  const yestJobsDone = yestProd.filter((e) => e.status === "Done" && hourOf(e.end) <= hour).length;
  const jobsOut = prod.filter((e) => e.status === "Dispatched" || (e.status !== "Done" && e.status !== "Set")).length;
  const jobsPending = prod.filter((e) => e.status === "Set" || e.hold).length;
  const tixOpen = tickets.filter((t) => t.status !== "Complete" && t.status !== "Cancel").length;
  const tixAdded = snapshot.ticketsAddedToday;
  const tixClosed = snapshot.ticketsClosedToday;
  const ads = new Set(["Google", "Website", "Canvass"]);
  const marketingSold = soldEv.filter((e) => ads.has(leads.find((l) => l.id === e.personId)?.source ?? "")).reduce((s, e) => s + valueOf(e, leads), 0);
  const marketingSpend = snapshot.marketingToday;
  const payroll = snapshot.payrollToday;
  const cashIn = snapshot.cashInToday;
  const spent = snapshot.cashOutToday;
  const expected = snapshot.expectedInToday;

  const closers = roster.filter((r) => r.kind === "closer" && (office === "all" || r.office === office));
  const crews = roster.filter((r) => r.kind === "crew" && (office === "all" || r.office === office));
  const setters = roster.filter((r) => r.kind === "setter" && (office === "all" || r.office === office));

  const closerRank: Rank[] = closers
    .map((r) => {
      const mine = sales.filter((e) => e.resourceId === r.id);
      const amt = mine.filter((e) => e.status === "Done").reduce((s, e) => s + valueOf(e, leads), 0);
      const leftN = mine.filter((e) => hourOf(e.end) > hour && e.status !== "Done").length;
      return {
        id: r.id,
        name: r.name,
        role: "Closer",
        amount: amt,
        why: amt ? `${mine.filter((e) => e.status === "Done").length} sold` : leftN ? `${leftN} sits left` : "No sold",
        href: "/calendar",
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const crewRank: Rank[] = crews
    .map((r) => {
      const mine = prod.filter((e) => e.resourceId === r.id);
      const done = mine.filter((e) => e.status === "Done").length;
      return {
        id: r.id,
        name: r.name,
        role: "Crew",
        amount: mine.length,
        why: mine.length ? mine.map((e) => e.title).join(", ") : "No jobs",
        href: "/dispatch",
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const setterRank: Rank[] = setters
    .map((r) => {
      const mine = sales.filter((e) => e.setBy === r.name || whoName(e.resourceId, roster) === r.name);
      return {
        id: r.id,
        name: r.name,
        role: "Setter",
        amount: mine.length,
        why: mine.length ? `${mine.length} on the book` : "No sets today",
        href: "/calendar",
      };
    })
    .sort((a, b) => b.amount - a.amount);

  function ends(list: Rank[]) {
    if (!list.length) return { top: [] as Rank[], bottom: [] as Rank[] };
    const top = list[0].amount > 0 ? [list[0]] : [];
    const last = list[list.length - 1];
    const bottom = last && last.id !== top[0]?.id ? [last] : [];
    return { top, bottom };
  }
  const c = ends(closerRank);
  const k = ends(crewRank);
  const s = ends(setterRank);

  const hours = Array.from({ length: 16 }, (_, i) => i + 6);
  const strip: HourBar[] = hours.map((h) => ({
    h,
    label: hourLabel(h),
    sales: day.filter((e) => familyOf(e.type) === "sales" && Math.floor(hourOf(e.start)) === h).length,
    prod: day.filter((e) => familyOf(e.type) === "production" && Math.floor(hourOf(e.start)) === h).length,
    yestSales: yest.filter((e) => familyOf(e.type) === "sales" && Math.floor(hourOf(e.start)) === h).length,
    yestProd: yest.filter((e) => familyOf(e.type) === "production" && Math.floor(hourOf(e.start)) === h).length,
  }));

  const ranN =
    nosit.length +
    sales.filter((e) => e.status !== "Done" && e.status !== "Set" && hourOf(e.end) <= hour).length;
  const mix = pack([
    { label: "Set", n: sales.filter((e) => e.status === "Set").length, tone: WASH, ink: true },
    { label: "Ran", n: ranN, tone: STEEL, ink: true },
    { label: "Sold", n: soldN, tone: sold > yesterday ? LIVE : MID, mark: sold > yesterday ? "go" : undefined },
    { label: "Cancelled", n: cancelled, tone: WASH, ink: true, mark: cancelled ? "stop" : undefined },
  ]);

  const appt = pack([
    { label: "Passed", n: passed.length, tone: STEEL, ink: true },
    { label: "Left", n: left.length, tone: MID },
  ]);
  const jobSplit = pack([
    { label: "Done", n: jobsDone, tone: MID },
    { label: "Out", n: Math.max(jobsOut, prod.filter((e) => e.status === "Dispatched").length), tone: STEEL, ink: true },
    { label: "Pending", n: jobsPending, tone: WASH, ink: true, mark: jobsPending > 2 ? "watch" : undefined },
  ]);
  const tix = pack([
    { label: "Open", n: tixOpen, tone: MID, mark: tixOpen > snapshot.ticketsOpenYest ? "watch" : undefined },
    { label: "Added", n: tixAdded, tone: STEEL, ink: true },
    { label: "Closed", n: tixClosed, tone: WASH, ink: true },
  ]);
  const notCalledN = snapshot.notCalledToday;
  const leadSplit = pack([
    { label: "Called", n: snapshot.calledToday, tone: STEEL, ink: true },
    { label: "Not called", n: notCalledN, tone: MID, mark: notCalledN ? "watch" : undefined },
  ]);

  const behindN = day.filter((e) => familyOf(e.type) === "production" && e.status !== "Done" && hourOf(e.end) <= hour).length;
  const marks = {
    sales: sold > yesterday ? ("go" as const) : sold < yesterday * 0.8 ? ("watch" as const) : undefined,
    close: closeRate < 25 ? ("stop" as const) : closeRate >= 50 ? ("go" as const) : undefined,
    cashOut: spent > cashIn ? ("stop" as const) : undefined,
    behind: behindN ? ("stop" as const) : undefined,
    mkt: marketingSpend && marketingSold / marketingSpend >= 8 ? ("go" as const) : undefined,
  };

  const trends = {
    sales: { now: sold, yest: yesterday, goal: dayGoals.sales, money: true },
    close: { now: closeRate, yest: yestClose, goal: dayGoals.close },
    cashIn: { now: cashIn, yest: snapshot.cashInYest, goal: dayGoals.cashIn, money: true },
    cashOut: { now: spent, yest: snapshot.cashOutYest, goal: dayGoals.cashOut, money: true },
    sits: { now: passed.length + left.length, yest: yestPassed.length + yestLeft.length, goal: dayGoals.sits },
    left: { now: left.length, yest: yestLeft.length, goal: 0 },
    leads: { now: snapshot.leadsToday, yest: snapshot.leadsYest, goal: dayGoals.leads },
    jobs: { now: jobsDone + jobsOut, yest: yestJobsDone, goal: dayGoals.jobs },
    tix: { now: tixClosed, yest: snapshot.ticketsClosedYest, goal: dayGoals.ticketsClosed },
    payroll: { now: payroll, yest: snapshot.payrollYesterday, goal: dayGoals.payroll, money: true },
    marketing: { now: marketingSold, yest: snapshot.marketingSoldYest, goal: dayGoals.marketing, money: true },
    reviews: { now: snapshot.reviewsToday, yest: snapshot.reviewsYest, goal: dayGoals.reviews },
    referrals: { now: snapshot.referralsToday, yest: snapshot.referralsYest, goal: dayGoals.referrals },
  };

  return {
    sold,
    soldN,
    yesterday,
    closeRate,
    decided,
    passed: passed.length,
    left: left.length,
    onBook: left.reduce((s, e) => s + valueOf(e, leads), 0),
    cashIn,
    spent,
    expected,
    cashOut,
    marketingSpend,
    marketingSold,
    payroll,
    payrollYest: snapshot.payrollYesterday,
    jobsDone,
    jobsOut: jobSplit[1].n,
    jobsPending,
    tixOpen,
    tixAdded,
    tixClosed,
    reviews,
    reviewScore: snapshot.reviewScore,
    reviewCount: snapshot.reviewCount,
    referrals,
    strip,
    mix,
    appt,
    jobSplit,
    tix,
    leadSplit,
    leadsIn: snapshot.leadsToday,
    hour,
    behindN,
    marks,
    trends,
    unsigned: prod.filter((e) => isWatch(e)).length,
    top: [...c.top, ...k.top, ...s.top],
    bottom: [...c.bottom, ...k.bottom, ...s.bottom],
    nosit: nosit.length,
  };
}
