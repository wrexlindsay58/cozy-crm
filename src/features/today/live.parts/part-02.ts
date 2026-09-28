import { snapshot } from "@/lib/snapshot";
import { tickets } from "@/lib/crm-data";
import { familyOf } from "@/features/book/types";
import { hourOf } from "@/features/book/time";
import { STEEL, WASH, MID, LIVE, pack, valueOf, type SparkPt } from "./part-01";

export function prep_buildToday(opts: any) {
  const { events, leads, roster, dayKey, yestKey, hour, office } = opts;
  const day = events.filter((e: any) => e.start.slice(0, 10) === dayKey && (office === "all" || e.office === office) && !e.blank);
  const yest = events.filter((e: any) => e.start.slice(0, 10) === yestKey && (office === "all" || e.office === office) && !e.blank);
  const sales = day.filter((e: any) => familyOf(e.type) === "sales");
  const prod = day.filter((e: any) => familyOf(e.type) === "production");
  const yestSales = yest.filter((e: any) => familyOf(e.type) === "sales");
  const yestProd = yest.filter((e: any) => familyOf(e.type) === "production");
  const soldEv = sales.filter((e: any) => e.status === "Done" && hourOf(e.end) <= hour);
  const yestSoldEv = yestSales.filter((e: any) => e.status === "Done" && hourOf(e.end) <= hour);
  const sold = soldEv.reduce((s: any, e: any) => s + valueOf(e, leads), 0);
  const soldN = soldEv.length;
  const yesterday = yestSoldEv.reduce((s: any, e: any) => s + valueOf(e, leads), 0);
  const passed = sales.filter((e: any) => hourOf(e.end) <= hour);
  const left = sales.filter((e: any) => hourOf(e.end) > hour);
  const yestPassed = yestSales.filter((e: any) => hourOf(e.end) <= hour);
  const yestLeft = yestSales.filter((e: any) => hourOf(e.end) > hour);
  const nosit = day.filter((e: any) => (e.status === "No-run" || e.status === "No-show") && hourOf(e.end) <= hour);
  const yestNosit = yest.filter((e: any) => (e.status === "No-run" || e.status === "No-show") && hourOf(e.end) <= hour);
  const cancelled = snapshot.cancelledToday;
  const decided = soldN + nosit.length + cancelled;
  const closeRate = decided ? Math.round((soldN / decided) * 100) : 0;
  const yestDecided = yestSoldEv.length + yestNosit.length + snapshot.cancelledYest;
  const yestClose = yestDecided ? Math.round((yestSoldEv.length / yestDecided) * 100) : 0;
  const jobsDone = prod.filter((e: any) => e.status === "Done" && hourOf(e.end) <= hour).length;
  const yestJobsDone = yestProd.filter((e: any) => e.status === "Done" && hourOf(e.end) <= hour).length;
  const jobsOut = prod.filter((e: any) => e.status === "Dispatched" || (e.status !== "Done" && e.status !== "Set")).length;
  const jobsPending = prod.filter((e: any) => e.status === "Set" || e.hold).length;
  const tixOpen = tickets.filter((t) => t.status !== "Complete" && t.status !== "Cancel").length;
  const tixAdded = snapshot.ticketsAddedToday;
  const tixClosed = snapshot.ticketsClosedToday;
  const ads = new Set(["Google", "Website", "Canvass"]);
  const marketingSold = soldEv.filter((e: any) => ads.has(leads.find((l: any) => l.id === e.personId)?.source ?? "")).reduce((s: any, e: any) => s + valueOf(e, leads), 0);
  const marketingSpend = snapshot.marketingToday;
  const ticket = soldN ? Math.round(sold / soldN) : 0;
  const yestTicket = yestSoldEv.length ? Math.round(yesterday / yestSoldEv.length) : 0;
  const mktBySource = pack(
    ["Google", "Website", "Canvass"].map((label, i) => ({
      label,
      n: soldEv.filter((e: any) => (leads.find((l: any) => l.id === e.personId)?.source ?? "") === label).reduce((s: any, e: any) => s + valueOf(e, leads), 0),
      tone: i === 2 ? LIVE : i === 0 ? MID : STEEL,
    })),
  );
  const payroll = snapshot.payrollToday;
  const cashIn = snapshot.cashInToday;
  const spent = snapshot.cashOutToday;
  const expected = snapshot.expectedInToday;
  const hourKeys = Array.from({ length: 16 }, (_, i) => i + 6);
  const soldByHour = hourKeys.map((h) =>
    soldEv
      .filter((e: any) => ads.has(leads.find((l: any) => l.id === e.personId)?.source ?? "") && Math.floor(hourOf(e.end)) === h)
      .reduce((s: any, e: any) => s + valueOf(e, leads), 0),
  );
  const soldSum = soldByHour.reduce((s, n) => s + n, 0) || 1;
  const mktSpark: SparkPt[] = hourKeys.map((h, i) => ({
    h,
    sold: soldByHour[i],
    spend: (soldByHour[i] / soldSum) * 0.6 * marketingSpend + (0.4 * marketingSpend) / hourKeys.length,
  }));
  const dealSpark = hourKeys.map((h) => ({
    h,
    n: soldEv.filter((e: any) => Math.floor(hourOf(e.end)) === h).length,
  }));
  const catTone = [LIVE, STEEL, MID, WASH, "var(--color-go)"];
  const catN: Record<string, number> = {};
  const CAT: Record<string, string> = {
    "T-91": "HOA",
    "T-88": "Callback",
    "T-86": "HOA",
    "T-84": "Permit",
    "T-81": "Callback",
    "T-79": "Material",
    "T-74": "Callback",
    "T-70": "Material",
    "T-66": "Warranty",
  };
  return { CAT, catN, catTone, roster, office, sales, leads, hour, prod, yestSales, passed, yestPassed, soldN, yestSoldEv, yestProd, cancelled, nosit, sold, yesterday, left, jobsDone, jobsOut, jobsPending, tixOpen, tixAdded, tixClosed, day, closeRate, spent, cashIn, marketingSpend, marketingSold, ticket, yestTicket, yestClose, yestLeft, yestJobsDone, payroll, decided, expected, mktBySource, mktSpark, dealSpark };
}
