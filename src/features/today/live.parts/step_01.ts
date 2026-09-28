import { cashOut, dayGoals, referrals, reviews, snapshot, surveys } from "@/lib/snapshot";
import type { Lead } from "@/lib/crm-data";
import type { Resource } from "@/features/book/roster";
import { familyOf, isWatch, type BookEvent } from "@/features/book/types";
import { hourOf } from "@/features/book/time";
import { STEEL, WASH, MID, LIVE, pack, valueOf, prep_buildToday2, type Mark, type Rank, type FlowBar, type FieldNow } from "./part-01";

export function step_01(ctx: any): any {
{ const { closerRank, crewRank, setterRank, sales, yestSales, passed, yestPassed, soldN, yestSoldEv, prod, yestProd, cancelled, nosit, hour, sold, yesterday, left, jobsDone, jobsOut, jobsPending, tixOpen, tixAdded, tixClosed, day, crews, closers, leads, closeRate, spent, cashIn, marketingSpend, marketingSold, ticket, yestTicket, yestClose, yestLeft, yestJobsDone, payroll, decided, expected, mktBySource, mktSpark, dealSpark, actionCats } = prep_buildToday2(ctx.opts); ctx.closerRank = closerRank; ctx.crewRank = crewRank; ctx.setterRank = setterRank; ctx.sales = sales; ctx.yestSales = yestSales; ctx.passed = passed; ctx.yestPassed = yestPassed; ctx.soldN = soldN; ctx.yestSoldEv = yestSoldEv; ctx.prod = prod; ctx.yestProd = yestProd; ctx.cancelled = cancelled; ctx.nosit = nosit; ctx.hour = hour; ctx.sold = sold; ctx.yesterday = yesterday; ctx.left = left; ctx.jobsDone = jobsDone; ctx.jobsOut = jobsOut; ctx.jobsPending = jobsPending; ctx.tixOpen = tixOpen; ctx.tixAdded = tixAdded; ctx.tixClosed = tixClosed; ctx.day = day; ctx.crews = crews; ctx.closers = closers; ctx.leads = leads; ctx.closeRate = closeRate; ctx.spent = spent; ctx.cashIn = cashIn; ctx.marketingSpend = marketingSpend; ctx.marketingSold = marketingSold; ctx.ticket = ticket; ctx.yestTicket = yestTicket; ctx.yestClose = yestClose; ctx.yestLeft = yestLeft; ctx.yestJobsDone = yestJobsDone; ctx.payroll = payroll; ctx.decided = decided; ctx.expected = expected; ctx.mktBySource = mktBySource; ctx.mktSpark = mktSpark; ctx.dealSpark = dealSpark; ctx.actionCats = actionCats; }
ctx.c = ctx.ends(ctx.closerRank);
ctx.k = ctx.ends(ctx.crewRank);
ctx.s = ctx.ends(ctx.setterRank);
ctx.flow = [
    { key: "lead", label: "Leads", now: snapshot.leadsToday, yest: snapshot.leadsYest },
    { key: "appt", label: "Appts.", now: ctx.sales.length, yest: ctx.yestSales.length },
    { key: "run", label: "Runs", now: ctx.passed.length, yest: ctx.yestPassed.length },
    { key: "deal", label: "Deals", now: ctx.soldN, yest: ctx.yestSoldEv.length },
    { key: "job", label: "Jobs", now: ctx.prod.length, yest: ctx.yestProd.length },
    { key: "member", label: "Members", now: snapshot.membersToday, yest: snapshot.membersYest },
    { key: "cancel", label: "Cancels", now: ctx.cancelled, yest: snapshot.cancelledYest },
  ];
ctx.ranN = ctx.nosit.length +
    ctx.sales.filter((e: any) => e.status !== "Done" && e.status !== "Set" && hourOf(e.end) <= ctx.hour).length;
ctx.mix = pack([
    { label: "Set", n: ctx.sales.filter((e: any) => e.status === "Set").length, tone: WASH, ink: true },
    { label: "Ran", n: ctx.ranN, tone: STEEL, ink: true },
    { label: "Sold", n: ctx.soldN, tone: ctx.sold > ctx.yesterday ? LIVE : MID, mark: ctx.sold > ctx.yesterday ? "go" : undefined },
    { label: "Cancelled", n: ctx.cancelled, tone: WASH, ink: true, mark: ctx.cancelled ? "stop" : undefined },
  ]);
ctx.appt = pack([
    { label: "Passed", n: ctx.passed.length, tone: STEEL, ink: true },
    { label: "Left", n: ctx.left.length, tone: MID },
  ]);
ctx.runSplit = pack([
    { label: "Closed", n: ctx.soldN, tone: LIVE },
    { label: "Ran", n: Math.max(0, ctx.passed.length - ctx.soldN), tone: STEEL, ink: true },
    { label: "Left", n: ctx.left.length, tone: MID },
  ]);
ctx.jobSplit = pack([
    { label: "Done", n: ctx.jobsDone, tone: MID },
    { label: "Out", n: Math.max(ctx.jobsOut, ctx.prod.filter((e: any) => e.status === "Dispatched").length), tone: STEEL, ink: true },
    { label: "Pending", n: ctx.jobsPending, tone: WASH, ink: true, mark: ctx.jobsPending > 2 ? "watch" : undefined },
  ]);
ctx.tix = pack([
    { label: "Open", n: ctx.tixOpen, tone: MID, mark: ctx.tixOpen > snapshot.ticketsOpenYest ? "watch" : undefined },
    { label: "Added", n: ctx.tixAdded, tone: STEEL, ink: true },
    { label: "Closed", n: ctx.tixClosed, tone: WASH, ink: true },
  ]);
ctx.notCalledN = snapshot.notCalledToday;
ctx.leadSplit = pack([
    { label: "Called", n: snapshot.calledToday, tone: STEEL, ink: true },
    { label: "Not called", n: ctx.notCalledN, tone: MID, mark: ctx.notCalledN ? "watch" : undefined },
  ]);
ctx.behindN = ctx.day.filter((e: any) => familyOf(e.type) === "production" && e.status !== "Done" && hourOf(e.end) <= ctx.hour).length;
ctx.svcTypes = new Set(["Service", "Warranty", "Go-back", "Test-out", "Inspection", "Punch"]);
ctx.svc = ctx.day.filter((e: any) => ctx.svcTypes.has(e.type));
ctx.crewOut = ctx.crews.filter((r: any) => ctx.prod.some((e: any) => e.resourceId === r.id || e.crewId === r.id));
ctx.repOut = ctx.closers.filter((r: any) => ctx.sales.some((e: any) => e.resourceId === r.id));
ctx.installsLive = ctx.prod.filter((e: any) => e.status === "Dispatched").length;
ctx.installsWait = ctx.prod.filter((e: any) => e.status === "Set" || e.hold).length;
ctx.runsLive = ctx.sales.filter(
    (e: any) => hourOf(e.start) <= ctx.hour && hourOf(e.end) > ctx.hour && e.status !== "Done" && e.status !== "No-run" && e.status !== "No-show",
  ).length;
ctx.demandN = ctx.prod.length;
ctx.capacityN = Math.max(ctx.crews.length, 1);
ctx.demandPct = Math.round((ctx.demandN / ctx.capacityN) * 100);
ctx.qcDoneN = Math.max(snapshot.qcDone, ctx.svc.filter((e: any) => e.status === "Done").length);
ctx.qcFailN = snapshot.qcFailed;
ctx.qcAll = ctx.qcDoneN + ctx.qcFailN;
}
