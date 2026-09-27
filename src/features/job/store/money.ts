import { isPayBill } from "./seed";
import { paid, poWatch } from "./events";
import { write_jobs, jobs, emit } from "./core";
import { patch } from "./events-02";
import { payFor } from "@/features/staff/store";
import { commissionCost, contractTotal, materialCost, punchHours, quotedMaterials, trueDiscount, type CommShare, type JobFile } from "../types";

export function invoiced(job: JobFile) {
  return job.invoices.filter((i) => !isPayBill(i) && i.status !== "Void" && i.status !== "Draft" && i.status !== "Refunded").reduce((s, i) => s + i.amount, 0);
}

export function quotedCost(job: JobFile) {
  return job.scope.reduce((s, r) => s + r.quotedCost, 0);
}

export function laborRows(job: JobFile) {
  if (job.laborLines?.length) {
    return job.laborLines.map((l) => {
      const amount = l.actual ?? (l.kind === "Piece" ? l.rate : Math.round(l.qty * l.rate));
      const note = l.kind === "Piece" ? (l.service || "Piece") : l.kind === "Hourly" ? `${l.qty}h × $${l.rate}` : `${l.qty} day × $${l.rate}`;
      return { who: l.who, kind: l.kind, note, amount };
    });
  }
  if (!job.punches.length) return [{ who: "Quoted", kind: "Quoted", note: "Until labor posts", amount: job.labor }];
  return job.punches.map((p) => {
    const pay = payFor(p.who);
    const hrs = punchHours(p).total;
    if (pay.kind === "Hourly") {
      return { who: p.who, kind: pay.kind, note: `${hrs.toFixed(1)}h × $${pay.rate}`, amount: Math.round(hrs * pay.rate) };
    }
    if (pay.kind === "Piece") {
      return { who: p.who, kind: pay.kind, note: `Piece · ${p.day}`, amount: pay.rate };
    }
    return { who: p.who, kind: pay.kind, note: `Day · ${p.day}`, amount: pay.rate };
  });
}

export function laborActual(job: JobFile) {
  const rows = laborRows(job);
  const sum = rows.reduce((s, r) => s + r.amount, 0);
  return sum || job.labor;
}

export function tally(job: JobFile) {
  const revenue = contractTotal(job);
  const labor = laborActual(job);
  const fee = job.loan.vendor === "GoodLeap" ? job.loan.dealerFee : 0;
  const mats = materialCost(job);
  const comm = commissionCost(job);
  const adders = job.scope.filter((s) => s.kind === "adder").reduce((s, r) => s + r.amount, 0);
  const discounts = job.scope.filter((s) => s.kind === "discount" || s.amount < 0).reduce((s, r) => s + Math.abs(r.amount), 0);
  const td = trueDiscount(job);
  const cogs = labor + mats + job.extras + td.fieldHits + fee;
  const cost = cogs;
  const quoted = quotedCost(job);
  const invoicedAmt = invoiced(job);
  const paidAmt = paid(job);
  const funded = job.loan.vendor === "GoodLeap" ? job.loan.fundedAmount : 0;
  const refunds = job.invoices.filter((i) => i.status === "Refunded" && (i.party ?? "customer") === "customer").reduce((s, i) => s + i.amount, 0);
  return {
    revenue,
    cost,
    quoted,
    labor,
    laborRows: laborRows(job),
    mats,
    materialReturns: job.scope.reduce((s, sc) => s + sc.bom.reduce((b, l) => b + (l.returnCredit || 0), 0), 0),
    warehouse: job.scope.reduce((s, sc) => s + sc.bom.reduce((b, l) => b + (l.warehouseQty || 0) * (l.actualUnitCost ?? l.unitCost), 0), 0),
    quotedMats: quotedMaterials(job),
    adders,
    discounts,
    cogs,
    commission: comm,
    gross: revenue - cogs - refunds,
    refunds,
    margin: revenue - cogs - comm - refunds,
    quotedMargin: revenue - quoted - comm,
    invoiced: invoicedAmt,
    paid: paidAmt,
    funded,
    collect: Math.max(0, revenue - paidAmt - funded),
    overUnder: invoicedAmt - revenue,
    watch: poWatch(job),
    balance: invoicedAmt - paidAmt,
    trueDiscount: td,
  };
}

export function applyCommissionPct(pct: number) {
  const rate = Math.max(0, pct);
  write_jobs(Object.fromEntries(
    Object.entries(jobs).map(([id, j]) => {
      const commissions = (j.commissions ?? []).map((c, i, all) => {
        const closers = all.filter((x) => x.role === "Closer" || x.role === "Split");
        if (closers.length === 1 && c.id === closers[0].id) return { ...c, pct: rate };
        return c;
      });
      const commission = commissions.length ? commissions.reduce((s, c) => s + Math.round(j.sold * (c.pct / 100)), 0) : Math.round(j.sold * (rate / 100));
      return [id, { ...j, commissions, commission }];
    }),
  ));
  emit();
}

export function addCommission(jobId: string, role: CommShare["role"]) {
  patch(jobId, (j) => {
    const row: CommShare = {
      id: `CM-${Date.now()}`,
      who: role === "Setter" ? "Setter" : j.closer,
      role,
      pct: role === "Setter" ? 1 : role === "Split" ? 5 : 10,
      paid: false,
    };
    const commissions = [...(j.commissions ?? []), row];
    return { ...j, commissions, commission: commissions.reduce((s, c) => s + Math.round(j.sold * (c.pct / 100)), 0) };
  }, { nudge: false });
}

export function patchCommission(jobId: string, id: string, row: Partial<CommShare>) {
  patch(jobId, (j) => {
    if (row.paid && tally(j).collect > 0) return j;
    const commissions = (j.commissions ?? []).map((c) => (c.id === id ? { ...c, ...row } : c));
    return { ...j, commissions, commission: commissions.reduce((s, c) => s + Math.round(j.sold * (c.pct / 100)), 0) };
  }, { nudge: false });
}
