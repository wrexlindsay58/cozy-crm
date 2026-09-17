import { cashOut, referrals, reviews, snapshot } from "@/lib/snapshot";
import { tickets, type Lead } from "@/lib/crm-data";
import type { Resource } from "@/features/book/roster";
import { familyOf, isWatch, type BookEvent } from "@/features/book/types";
import { hourOf } from "@/features/book/time";

export type Split = { label: string; n: number; tone: string };
export type Rank = { id: string; name: string; role: string; amount: number; why: string; href: string };
export type HourBar = { h: number; label: string; sales: number; prod: number };

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
  const soldEv = sales.filter((e) => e.status === "Done");
  const yestSold = yest.filter((e) => familyOf(e.type) === "sales" && e.status === "Done");
  const sold = soldEv.reduce((s, e) => s + valueOf(e, leads), 0);
  const soldN = soldEv.length;
  const yesterday = yestSold.reduce((s, e) => s + valueOf(e, leads), 0);
  const passed = sales.filter((e) => hourOf(e.end) <= hour);
  const left = sales.filter((e) => hourOf(e.end) > hour);
  const nosit = day.filter((e) => e.status === "No-sit" || e.status === "No-show");
  const cancelled = leads.filter((l) => l.status === "Cancelled" || l.status === "Not qualified");
  const decided = soldN + nosit.length + cancelled.length;
  const closeRate = decided ? Math.round((soldN / decided) * 100) : 0;
  const jobsDone = prod.filter((e) => e.status === "Done").length;
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
  }));

  const mix: Split[] = [
    { label: "Set", n: sales.filter((e) => e.status === "Set").length, tone: "var(--color-line-strong)" },
    { label: "Confirmed", n: sales.filter((e) => e.status === "Confirmed").length, tone: "var(--color-navy-2)" },
    { label: "Sold", n: soldN, tone: "var(--color-navy)" },
    { label: "Cancelled", n: cancelled.length, tone: "var(--color-idle)" },
  ];

  const appt: Split[] = [
    { label: "Passed", n: passed.length, tone: "var(--color-navy-2)" },
    { label: "Left", n: left.length, tone: "var(--color-navy)" },
  ];
  const jobSplit: Split[] = [
    { label: "Done", n: jobsDone, tone: "var(--color-navy)" },
    { label: "Out", n: Math.max(jobsOut, prod.filter((e) => e.status === "Dispatched").length), tone: "var(--color-navy-2)" },
    { label: "Pending", n: jobsPending, tone: "var(--color-line-strong)" },
  ];
  const tix: Split[] = [
    { label: "Open", n: tixOpen, tone: "var(--color-navy)" },
    { label: "Added", n: tixAdded, tone: "var(--color-navy-2)" },
    { label: "Closed", n: tixClosed, tone: "var(--color-line-strong)" },
  ];

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
    hour,
    behindN: day.filter((e) => familyOf(e.type) === "production" && e.status !== "Done" && hourOf(e.end) <= hour).length,
    unsigned: prod.filter((e) => isWatch(e)).length,
    top: [...c.top, ...k.top, ...s.top],
    bottom: [...c.bottom, ...k.bottom, ...s.bottom],
    nosit: nosit.length,
  };
}
