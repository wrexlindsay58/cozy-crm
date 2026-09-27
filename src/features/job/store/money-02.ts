import { patch } from "./events-02";
import { assignedCrews, defaultService } from "./seed";
import { receivePoAmount } from "./events-04";
import { addHistory } from "@/features/ops/store";
import { membersOf, payFor, actingName } from "@/features/staff/store";
import { isAccepted, type CostHit, type FieldExtra, type LaborLine, type LoanFile, type PurchaseOrder, type SalesFault } from "../types";

export function removeCommission(jobId: string, id: string) {
  patch(jobId, (j) => {
    const commissions = (j.commissions ?? []).filter((c) => c.id !== id);
    return { ...j, commissions, commission: commissions.reduce((s, c) => s + Math.round(j.sold * (c.pct / 100)), 0) };
  }, { nudge: false });
}

export function addLaborer(jobId: string, crew = "") {
  patch(jobId, (j) => {
    const crews = assignedCrews(j);
    const pick = crew || crews[0] || "Crew 2 — Tasha";
    const taken = new Set((j.laborLines ?? []).map((l) => l.who));
    const who = membersOf(pick).find((n) => !taken.has(n)) || membersOf(pick)[0] || "";
    if (!who) return j;
    const service = defaultService(j);
    const pay = payFor(who, service);
    const row: LaborLine = {
      id: `LB-${Date.now()}`,
      who,
      crew: pick,
      kind: pay.kind,
      qty: pay.kind === "Hourly" ? 8 : 1,
      rate: pay.rate,
      service: pay.kind === "Piece" ? service : "",
      added: true,
    };
    return { ...j, laborLines: [...(j.laborLines ?? []), row] };
  }, { nudge: false });
}

export function patchLabor(jobId: string, id: string, row: Partial<LaborLine>) {
  patch(jobId, (j) => ({
    ...j,
    laborLines: (j.laborLines ?? []).map((l) => {
      if (l.id !== id) return l;
      const next = { ...l, ...row };
      if (row.crew && !row.who) {
        const first = membersOf(row.crew).find((n) => n !== l.who) ?? membersOf(row.crew)[0];
        if (first) next.who = first;
      }
      if (row.who || row.service || row.crew) {
        const pay = payFor(next.who, next.service);
        next.kind = row.kind ?? pay.kind;
        if (row.rate == null) next.rate = pay.rate;
      }
      return next;
    }),
  }), { nudge: false });
}

export function removeLabor(jobId: string, id: string) {
  patch(jobId, (j) => ({ ...j, laborLines: (j.laborLines ?? []).filter((l) => l.id !== id) }), { nudge: false });
}

export function addCostHit(jobId: string, kind: CostHit["kind"], reason: SalesFault | FieldExtra, amount: number, note = "") {
  if (amount <= 0) return;
  patch(jobId, (j) => {
    if (kind === "field" && !isAccepted(j)) return j;
    const row: CostHit = {
      id: `CH-${Date.now()}`,
      kind,
      reason,
      amount,
      note: note.trim(),
      at: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
    addHistory(j.personId, actingName(), `${reason} ${kind === "sales" ? "true discount" : "field extra"} $${amount}.`);
    return { ...j, costHits: [...(j.costHits ?? []), row] };
  }, { nudge: false });
}

export function removeCostHit(jobId: string, id: string) {
  patch(jobId, (j) => ({ ...j, costHits: (j.costHits ?? []).filter((h) => h.id !== id) }), { nudge: false });
}

export function setLoanStatus(jobId: string, status: LoanFile["status"]) {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, `GoodLeap ${status}.`);
    return { ...j, loan: { ...j.loan, status } };
  }, { nudge: false });
}

export function sendGoodLeapPay(jobId: string) {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, "Funding request sent to GoodLeap.");
    return { ...j, loan: { ...j.loan, paySentAt: j.loan.paySentAt || "Now", status: j.loan.status === "NTP" ? "Complete" : j.loan.status } };
  }, { nudge: false });
}

export function receiveGoodLeapPay(jobId: string) {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, `GoodLeap funded ${j.loan.amount}.`);
    return { ...j, loan: { ...j.loan, fundedAmount: j.loan.amount, payReceivedAt: "Now", status: "Funded" } };
  }, { nudge: false });
}

export function addPurchaseOrder(jobId: string, vendor: string, what: string, amount: number, received: boolean) {
  if (!vendor.trim() || amount <= 0) return;
  patch(jobId, (j) => {
    const row: PurchaseOrder = { id: `PO-${60 + j.pos.length}`, vendor: vendor.trim(), what: what.trim() || vendor.trim(), amount, status: received ? "Received" : "Sent", file: { name: `${vendor}.pdf`, url: "#" } };
    addHistory(j.personId, j.pm, received ? `PO received ${vendor} $${amount}.` : `PO sent ${vendor} $${amount}.`);
    return { ...j, pos: [row, ...j.pos] };
  });
}

export function sendPo(jobId: string, poId: string) {
  patch(jobId, (j) => ({ ...j, pos: j.pos.map((p) => (p.id === poId ? { ...p, status: "Sent" } : p)) }));
}

export function receivePo(jobId: string, poId: string) {
  receivePoAmount(jobId, poId, Number.POSITIVE_INFINITY, "");
}
