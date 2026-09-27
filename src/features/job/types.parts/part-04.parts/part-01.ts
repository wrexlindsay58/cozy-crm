import type { Tone } from "@/lib/crm-data";
import type { Stage, BomLine } from "../part-01";
import type { TimePunch, CheckItem } from "../part-02";
import type { JobFile } from "../part-03";

export function bomJobCost(l: BomLine) {
  const paid = l.actualUnitCost ?? l.unitCost;
  const ordered = l.orderQty ?? l.estQty;
  const used = l.usedQty || 0;
  const returned = l.returnQty || 0;
  const warehoused = l.warehouseQty || 0;
  if (used > 0 || returned > 0 || warehoused > 0) {
    const onJob = used > 0 ? used : Math.max(0, ordered - returned - warehoused);
    return onJob * paid;
  }
  if (l.ordered) return ordered * paid;
  return l.estQty * l.unitCost;
}

export function bomOrderedCost(l: BomLine) {
  return (l.orderQty ?? l.estQty) * (l.actualUnitCost ?? l.unitCost);
}

export function quotedMaterials(j: JobFile) {
  return j.scope.reduce((s, sc) => s + sc.bom.reduce((b, l) => b + l.estQty * l.unitCost, 0), 0);
}

/** Quoted paid work. Adders in. Listed discounts and sales misses sit on True Discount, not here. */
export function commissionBase(j: JobFile) {
  return j.scope.filter((s) => s.kind === "product" || s.kind === "adder").reduce((s, r) => s + r.amount, 0) || j.sold;
}

export function trueDiscount(j: JobFile) {
  const listed = j.scope.filter((s) => s.kind === "discount" || s.amount < 0).reduce((s, r) => s + Math.abs(r.amount), 0);
  const salesHits = (j.costHits ?? []).filter((h) => h.kind === "sales").reduce((s, h) => s + h.amount, 0);
  const fieldHits = (j.costHits ?? []).filter((h) => h.kind === "field").reduce((s, h) => s + h.amount, 0);
  const dollars = listed + salesHits;
  const base = commissionBase(j);
  const pct = base ? (dollars / base) * 100 : 0;
  const deduction = Math.round((pct / 2.5) * 10) / 10;
  const rate = Math.max(0, Math.round((20 - deduction) * 10) / 10);
  return { listed, salesHits, fieldHits, dollars, pct, deduction, rate, base };
}

export function commissionCost(j: JobFile) {
  const td = trueDiscount(j);
  const shares = j.commissions ?? [];
  const closers = shares.filter((c) => c.role !== "Setter");
  const setters = shares.filter((c) => c.role === "Setter");
  const closerPool = Math.round(td.base * (td.rate / 100));
  const setterPay = setters.reduce((s, c) => s + Math.round(td.base * (c.pct / 100)), 0);
  if (!shares.length) return closerPool || j.commission;
  return (closers.length ? closerPool : 0) + setterPay;
}

export function contractTotal(j: JobFile) {
  return j.sold + j.changeOrders.filter((c) => c.lane !== "finance" && c.status === "Approved" && c.signed).reduce((s, c) => s + c.amount, 0);
}

export function agreementsSync(j: JobFile) {
  return j.installRev === j.financeRev;
}

export function processFor(label: string): string {
  const t = label.toLowerCase();
  if (t.includes("remov")) return "Attic removal";
  if (t.includes("attic") || t.includes("r-49") || t.includes("insul") || t.includes("cellulose")) return "Attic blow";
  if (t.includes("hvac") || t.includes("ton") || t.includes("condenser")) return "HVAC set";
  if (t.includes("duct") || t.includes("aero")) return "Ducts";
  return `Install · ${label}`;
}

export function punchHours(p: TimePunch) {
  function mins(a: string, b: string) {
    if (!a || !b) return 0;
    const [ah, am] = a.split(":").map(Number);
    const [bh, bm] = b.split(":").map(Number);
    return Math.max(0, bh * 60 + bm - (ah * 60 + am)) / 60;
  }
  const travel = mins(p.leftYard, p.onSite) + mins(p.complete, p.back);
  const site = mins(p.onSite, p.complete);
  return { travel, site, total: travel + site };
}

export function jobTone(job: Pick<JobFile, "stage" | "holds" | "cancelled">): Tone {
  if (job.cancelled) return "alert";
  if (job.holds.length) return "alert";
  if (job.stage === "Closed" || job.stage === "In progress") return "up";
  if (job.stage === "Punch" || job.stage === "Test-out" || job.stage === "Permit") return "alert";
  if (job.stage === "Materials" || job.stage === "Sold") return "muted";
  return "navy";
}

export function inferStage(j: JobFile): Stage {
  if (j.cancelled) return j.stage;
  if (j.stage === "Closed") return "Closed";
  const invoiced = j.invoices.some((i) => i.status !== "Draft" && i.status !== "Void");
  const punchOpen = j.punch.some((p) => p.status === "Open");
  const test = j.events.some((e) => e.process === "Test-out") || Number(j.testOut.blowerAfter) > 0;
  const inField = j.punches.some((p) => p.onSite) || j.events.some((e) => e.status === "Dispatched" || e.status === "Done");
  const scheduled = j.assignments.some((a) => a.day) || j.events.some((e) => e.status === "Set");
  const materials = j.pos.some((p) => p.status !== "Draft") || j.scope.some((s) => s.bom.some((b) => b.ordered));
  const permit = j.holds.some((h) => h.kind === "permit") || !!j.permit.number || j.checks.some((c) => c.id === "permit" && c.on);
  if (invoiced) return "Invoiced";
  if (punchOpen) return "Punch";
  if (test) return "Test-out";
  if (inField) return "In progress";
  if (scheduled) return "Scheduled";
  if (materials) return "Materials";
  if (permit) return "Permit";
  return "Sold";
}

export function closeBlocks(j: JobFile): string[] {
  const out: string[] = [];
  if (j.punch.some((p) => p.status === "Open")) out.push("Open punch");
  if (j.workOrders.some((w) => w.status !== "Signed" && w.status !== "Done" && w.status !== "On truck")) out.push("Work order not signed");
  if (j.loan.vendor === "GoodLeap" && j.loan.status !== "Funded") out.push("GoodLeap not funded");
  if (j.changeOrders.some((c) => c.lane !== "finance" && !c.signed)) out.push("Install CO not signed");
  if (j.changeOrders.some((c) => c.lane === "finance" && !c.signed)) out.push("GoodLeap CO not signed");
  if (j.scope.some((s) => s.plan && s.plan.status !== "Released" && s.kind === "product")) out.push("Plan not released");
  if (!j.preCheck.signedAt) out.push("Pre-install not signed");
  if (!j.postCheck.signedAt) out.push("Post-install not signed");
  return out;
}

export function defaultChecks(): CheckItem[] {
  return [
    { id: "permit", label: "Permit pulled", on: false },
    { id: "hoa", label: "HOA signed off", on: false },
    { id: "equip", label: "Equipment confirmed", on: false },
    { id: "dump", label: "Dump scheduled", on: false },
    { id: "test", label: "Test-out booked", on: false },
    { id: "photos", label: "Before/after photos in", on: false },
    { id: "rebate", label: "Rebate packet out", on: false },
    { id: "walk", label: "Homeowner walkthrough", on: false },
  ];
}
