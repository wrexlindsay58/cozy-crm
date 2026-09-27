import { cashOut, dayGoals, referrals, reviews, snapshot, surveys } from "@/lib/snapshot";
import type { Lead } from "@/lib/crm-data";
import type { Resource } from "@/features/book/roster";
import { familyOf, isWatch, type BookEvent } from "@/features/book/types";
import { hourOf } from "@/features/book/time";
import { STEEL, WASH, MID, LIVE, pack, valueOf, prep_buildToday2, type Mark, type Rank, type FlowBar, type FieldNow } from "./part-01";

export function step_02(ctx: any): any {
ctx.field = {
    demand: ctx.demandN,
    capacity: ctx.capacityN,
    demandPct: ctx.demandPct,
    crewsOut: ctx.crewOut.length,
    crewsIdle: Math.max(0, ctx.crews.length - ctx.crewOut.length),
    crewsN: ctx.crews.length,
    installsDone: ctx.jobsDone,
    installsLive: ctx.installsLive,
    installsWait: ctx.installsWait,
    repsOut: ctx.repOut.length,
    repsIdle: Math.max(0, ctx.closers.length - ctx.repOut.length),
    repsN: ctx.closers.length,
    runsLeft: ctx.left.length,
    runsLive: ctx.runsLive,
    runsDone: ctx.passed.length,
    qcOut: new Set(ctx.svc.map((e: any) => e.resourceId).filter(Boolean)).size,
    qcFail: ctx.qcFailN,
    qcDone: ctx.qcDoneN,
    qcReason: snapshot.qcReason,
    tixAdded: ctx.tixAdded,
    tixDone: ctx.tixClosed,
    tixOpen: ctx.tixOpen,
    tixCat: snapshot.actionCat,
    reviews: snapshot.reviewsToday,
    reviewScore: snapshot.reviewScore,
    referrals: snapshot.referralsToday,
    surveys: snapshot.surveysToday,
    qcTechs: snapshot.qcTechs,
    bookValue: ctx.prod.reduce((s: any, e: any) => s + valueOf(e, ctx.leads), 0),
    holds: ctx.prod.filter((e: any) => e.hold).length,
    late: ctx.behindN,
    perCrew: Math.round((ctx.demandN / ctx.capacityN) * 10) / 10,
    qcPassPct: ctx.qcAll ? Math.round((ctx.qcDoneN / ctx.qcAll) * 100) : 100,
    installSplit: pack([
      { label: "Done", n: ctx.jobsDone, tone: LIVE },
      { label: "Live", n: ctx.installsLive, tone: STEEL, ink: true },
      { label: "Pending", n: ctx.installsWait, tone: WASH, ink: true },
    ]),
    runNowSplit: pack([
      { label: "Left", n: ctx.left.length, tone: MID },
      { label: "Live", n: ctx.runsLive, tone: STEEL, ink: true },
      { label: "Done", n: ctx.passed.length, tone: LIVE },
    ]),
    qcSplit: pack([
      { label: "Pass", n: Math.max(snapshot.qcDone, ctx.svc.filter((e: any) => e.status === "Done").length), tone: "var(--color-go)" },
      { label: "Fail", n: snapshot.qcFailed, tone: "var(--color-stop)", mark: snapshot.qcFailed ? "stop" : undefined },
      { label: "Fixed", n: snapshot.qcFixed, tone: LIVE },
      { label: "Pending", n: snapshot.qcPending, tone: WASH, ink: true },
    ]),
    crewSplit: pack([
      { label: "Out", n: ctx.crewOut.length, tone: LIVE },
      { label: "Idle", n: Math.max(0, ctx.crews.length - ctx.crewOut.length), tone: WASH, ink: true },
    ]),
    repSplit: pack([
      { label: "Out", n: ctx.repOut.length, tone: LIVE },
      { label: "Idle", n: Math.max(0, ctx.closers.length - ctx.repOut.length), tone: WASH, ink: true },
    ]),
  };
ctx.demandMark = ctx.demandPct >= 105 && ctx.demandPct <= 125 ? "go" : ctx.demandPct < 95 || ctx.demandPct > 150 ? "stop" : "watch";
ctx.marks = {
    sales: ctx.sold > ctx.yesterday ? ("go" as const) : ctx.sold < ctx.yesterday * 0.8 ? ("watch" as const) : undefined,
    close: ctx.closeRate < 25 ? ("stop" as const) : ctx.closeRate >= 50 ? ("go" as const) : undefined,
    cashOut: ctx.spent > ctx.cashIn ? ("stop" as const) : undefined,
    behind: ctx.behindN ? ("stop" as const) : undefined,
    mkt: ctx.marketingSpend && ctx.marketingSold / ctx.marketingSpend >= 8 ? ("go" as const) : undefined,
    ticket: ctx.ticket >= dayGoals.ticket ? ("go" as const) : ctx.ticket && ctx.ticket < ctx.yestTicket * 0.85 ? ("watch" as const) : undefined,
    demand: ctx.demandMark,
    deals: ctx.soldN > ctx.yestSoldEv.length ? ("go" as const) : ctx.soldN < ctx.yestSoldEv.length ? ("watch" as const) : undefined,
  };
ctx.trends = {
    sales: { now: ctx.sold, yest: ctx.yesterday, goal: dayGoals.sales, money: true },
    close: { now: ctx.closeRate, yest: ctx.yestClose, goal: dayGoals.close },
    cashIn: { now: ctx.cashIn, yest: snapshot.cashInYest, goal: dayGoals.cashIn, money: true },
    ticket: { now: ctx.ticket, yest: ctx.yestTicket, goal: dayGoals.ticket, money: true },
    cashOut: { now: ctx.spent, yest: snapshot.cashOutYest, goal: dayGoals.cashOut, money: true },
    sits: { now: ctx.passed.length + ctx.left.length, yest: ctx.yestPassed.length + ctx.yestLeft.length, goal: dayGoals.sits },
    left: { now: ctx.left.length, yest: ctx.yestLeft.length, goal: 0 },
    leads: { now: snapshot.leadsToday, yest: snapshot.leadsYest, goal: dayGoals.leads },
    jobs: { now: ctx.jobsDone + ctx.jobsOut, yest: ctx.yestJobsDone, goal: dayGoals.jobs },
    tix: { now: ctx.tixClosed, yest: snapshot.ticketsClosedYest, goal: dayGoals.ticketsClosed },
    payroll: { now: ctx.payroll, yest: snapshot.payrollYesterday, goal: dayGoals.payroll, money: true },
    marketing: { now: ctx.marketingSold, yest: snapshot.marketingSoldYest, goal: dayGoals.marketing, money: true },
    reviews: { now: snapshot.reviewsToday, yest: snapshot.reviewsYest, goal: dayGoals.reviews },
    referrals: { now: snapshot.referralsToday, yest: snapshot.referralsYest, goal: dayGoals.referrals },
    demand: { now: ctx.demandPct, yest: 0, goal: dayGoals.demand },
    deals: { now: ctx.soldN, yest: ctx.yestSoldEv.length, goal: dayGoals.deals },
    surveys: { now: snapshot.surveysToday, yest: snapshot.surveysYest, goal: dayGoals.surveys },
    members: { now: snapshot.membersToday, yest: snapshot.membersYest, goal: dayGoals.members },
  };
}
