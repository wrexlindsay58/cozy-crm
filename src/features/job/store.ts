import { useSyncExternalStore } from "react";
import { addHistory } from "@/features/ops/store";
import { seedJobs } from "./seed";
import {
  closeBlocks,
  inferStage,
  processFor,
  punchHours,
  STAGES,
  type ChangeOrder,
  type CrewAssign,
  type EquipRow,
  type Hold,
  type JobEvent,
  type JobFile,
  type JobInvoice,
  type LoanFile,
  type MediaCat,
  type PayStatus,
  type PermitFile,
  type PunchItem,
  type PurchaseOrder,
  type RebateFile,
  type ScopeLine,
  type ScopeMedia,
  type Stage,
  type TestOut,
  type TimePunch,
  type WorkOrder,
} from "./types";

export type {
  ChangeOrder,
  CrewAssign,
  EquipRow,
  Hold,
  HoldRow,
  JobEvent,
  JobFile,
  JobInvoice,
  LoanFile,
  PunchItem,
  PurchaseOrder,
  Stage,
  WorkOrder,
} from "./types";
export { closeBlocks, HOLDS, inferStage, jobTone, MEDIA_CATS, PROCESSES, punchHours, STAGES } from "./types";

let jobs: Record<string, JobFile> = Object.fromEntries(seedJobs().map((j) => [j.jobId, j]));
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function snap() {
  return jobs;
}
export function useJobs() {
  useSyncExternalStore(subscribe, snap, snap);
  return jobs;
}
export function useJob(jobId: string) {
  return useJobs()[jobId];
}
export function approvedCos(job: JobFile) {
  return job.changeOrders.filter((c) => c.status === "Approved").reduce((s, c) => s + c.amount, 0);
}
export function poReceived(job: JobFile) {
  return job.pos.filter((p) => p.status === "Received" || p.status === "Closed").reduce((s, p) => s + p.amount, 0);
}
export function poWatch(job: JobFile) {
  return job.pos.filter((p) => p.status === "Sent" || p.status === "Partial").reduce((s, p) => s + p.amount, 0);
}
export function invoiced(job: JobFile) {
  return job.invoices.filter((i) => i.status !== "Void" && i.status !== "Draft").reduce((s, i) => s + i.amount, 0);
}
export function paid(job: JobFile) {
  return job.invoices.reduce((s, i) => s + i.paid, 0);
}
export function quotedCost(job: JobFile) {
  return job.scope.reduce((s, r) => s + r.quotedCost, 0);
}
export function laborActual(job: JobFile) {
  const hrs = job.punches.reduce((s, p) => s + punchHours(p).total, 0);
  if (hrs <= 0) return job.labor;
  return Math.round(hrs * 55);
}
export function tally(job: JobFile) {
  const revenue = job.sold + approvedCos(job);
  const labor = laborActual(job);
  const fee = job.loan.vendor === "GoodLeap" ? job.loan.dealerFee : 0;
  const cost = labor + job.commission + poReceived(job) + job.extras + fee;
  const quoted = quotedCost(job) + job.commission;
  return { revenue, cost, quoted, labor, margin: revenue - cost, quotedMargin: revenue - quoted, balance: invoiced(job) - paid(job), watch: poWatch(job) };
}
function patch(jobId: string, fn: (j: JobFile) => JobFile, opts?: { nudge?: boolean }) {
  const cur = jobs[jobId];
  if (!cur) return;
  let next = fn(cur);
  if (opts?.nudge !== false && next.stage !== "Closed") {
    const inferred = inferStage(next);
    if (STAGES.indexOf(inferred) > STAGES.indexOf(next.stage)) {
      addHistory(next.personId, next.pm, `Stage → ${inferred}.`);
      next = { ...next, stage: inferred };
    }
  }
  jobs = { ...jobs, [jobId]: next };
  emit();
}
export function applyCommissionPct(pct: number) {
  const rate = Math.max(0, pct) / 100;
  jobs = Object.fromEntries(Object.entries(jobs).map(([id, j]) => [id, { ...j, commission: Math.round(j.sold * rate) }]));
  emit();
}
export function setStage(jobId: string, stage: Stage) {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, `Stage → ${stage}.`);
    return { ...j, stage };
  }, { nudge: false });
}
export function toggleHold(jobId: string, kind: Hold) {
  patch(jobId, (j) => {
    const on = j.holds.some((h) => h.kind === kind);
    addHistory(j.personId, j.pm, on ? `Hold cleared: ${kind}.` : `Hold set: ${kind}.`);
    return { ...j, holds: on ? j.holds.filter((h) => h.kind !== kind) : [...j.holds, { kind, note: "", at: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) }] };
  });
}
export function setHoldNote(jobId: string, kind: Hold, note: string) {
  patch(jobId, (j) => ({ ...j, holds: j.holds.map((h) => (h.kind === kind ? { ...h, note } : h)) }), { nudge: false });
}
function syncCrew(j: JobFile): JobFile {
  const first = j.assignments[0];
  if (!first) return { ...j, crew: "", truck: "", window: "" };
  return { ...j, crew: first.crew, truck: first.truck, window: first.day ? `${first.day} · ${first.start}–${first.end}` : j.window };
}
export function addAssign(jobId: string) {
  patch(jobId, (j) => {
    const row: CrewAssign = {
      id: `CA-${Date.now()}`,
      crew: "Crew 2 — Tasha",
      truck: "Truck 4",
      day: "",
      start: "07:00",
      end: "15:00",
      scopes: j.scope[0] ? [j.scope[0].id] : [],
      kind: "internal",
      company: "",
    };
    return syncCrew({ ...j, assignments: [...j.assignments, row] });
  });
}
export function patchAssign(jobId: string, id: string, row: Partial<CrewAssign>) {
  patch(jobId, (j) => syncCrew({ ...j, assignments: j.assignments.map((a) => (a.id === id ? { ...a, ...row } : a)) }));
}
export function removeAssign(jobId: string, id: string) {
  patch(jobId, (j) => syncCrew({ ...j, assignments: j.assignments.filter((a) => a.id !== id) }));
}
export function toggleAssignScope(jobId: string, id: string, scope: string) {
  patch(jobId, (j) => {
    const assignments = j.assignments.map((a) => {
      if (a.id !== id) return a;
      const on = a.scopes.includes(scope);
      return { ...a, scopes: on ? a.scopes.filter((s) => s !== scope) : [...a.scopes, scope] };
    });
    return syncCrew({ ...j, assignments });
  });
}
function eventsFromAssign(j: JobFile, a: CrewAssign): JobEvent[] {
  const window = `${a.start}–${a.end}`;
  const who = a.kind === "sub" ? a.company || a.crew : a.crew;
  return a.scopes.map((sid) => {
    const scope = j.scope.find((s) => s.id === sid);
    return {
      id: `EV-${a.id}-${sid}`,
      scopeId: sid,
      process: processFor(scope?.label ?? sid),
      day: a.day,
      window,
      crew: who,
      assignId: a.id,
      status: "Set" as const,
    };
  });
}
export function sendAssignWo(jobId: string, assignId: string) {
  patch(jobId, (j) => {
    const a = j.assignments.find((x) => x.id === assignId);
    if (!a) return j;
    const who = a.kind === "sub" ? a.company || a.crew : a.crew;
    const row: WorkOrder = {
      id: a.woId ?? `WO-${10 + j.workOrders.length}`,
      assignId: a.id,
      status: "Sent",
      day: a.day || j.window,
      crew: who,
      notes: a.scopes.map((id) => j.scope.find((s) => s.id === id)?.label ?? id).join(", "),
      file: { name: `${a.woId ?? "WO"}.pdf`, url: "#" },
    };
    addHistory(j.personId, j.pm, `Work order ${row.id} sent to ${who}.`);
    const workOrders = a.woId ? j.workOrders.map((w) => (w.id === a.woId ? { ...w, ...row } : w)) : [row, ...j.workOrders];
    const fresh = eventsFromAssign(j, a);
    const events = [...j.events.filter((e) => e.assignId !== a.id), ...fresh];
    return { ...j, workOrders, events, assignments: j.assignments.map((x) => (x.id === assignId ? { ...x, woId: row.id } : x)) };
  });
}
export function ackWo(jobId: string, woId: string, who: string) {
  patch(jobId, (j) => {
    addHistory(j.personId, who, `WO ${woId} acknowledged.`);
    return { ...j, workOrders: j.workOrders.map((w) => (w.id === woId ? { ...w, status: "Acked", ackedAt: "Now", ackedBy: who } : w)) };
  });
}
export function signWo(jobId: string, woId: string, who: string) {
  patch(jobId, (j) => {
    addHistory(j.personId, who, `WO ${woId} signed.`);
    return { ...j, workOrders: j.workOrders.map((w) => (w.id === woId ? { ...w, status: "Signed", signedAt: "Now", signedBy: who } : w)) };
  });
}
export function issueWo(jobId: string) {
  const j = jobs[jobId];
  if (j?.assignments[0]) sendAssignWo(jobId, j.assignments[0].id);
}
export function patchScope(jobId: string, id: string, row: Partial<ScopeLine>) {
  patch(jobId, (j) => ({ ...j, scope: j.scope.map((s) => (s.id === id ? { ...s, ...row } : s)) }), { nudge: false });
}
export function setSoldNotes(jobId: string, soldNotes: string) {
  patch(jobId, (j) => ({ ...j, soldNotes }), { nudge: false });
}
export function addScopeMedia(jobId: string, scopeId: string, file: File, cat: MediaCat) {
  const url = URL.createObjectURL(file);
  const kind: ScopeMedia["kind"] = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "photo" : "doc";
  const row: ScopeMedia = { id: `M-${Date.now()}`, cat, name: file.name, url, kind };
  patch(jobId, (j) => ({ ...j, scope: j.scope.map((s) => (s.id === scopeId ? { ...s, media: [row, ...s.media] } : s)) }), { nudge: false });
}
export function addChangeOrder(jobId: string, why: string, amount: number, cost: number) {
  if (!why.trim() || amount <= 0) return;
  patch(jobId, (j) => {
    const row: ChangeOrder = { id: `CO-${j.changeOrders.length + 1}`, why: why.trim(), amount, cost, status: "Approved", signed: false };
    addHistory(j.personId, j.pm, `Change order ${why.trim()} +$${amount}.`);
    return {
      ...j,
      changeOrders: [row, ...j.changeOrders],
      extras: j.extras + cost,
      scope: [...j.scope, { id: `SC-${Date.now()}`, label: why.trim(), amount, qty: 1, notes: "", quotedCost: cost, estHours: 2, media: [] }],
    };
  });
}
export function signCo(jobId: string, id: string) {
  patch(jobId, (j) => ({ ...j, changeOrders: j.changeOrders.map((c) => (c.id === id ? { ...c, signed: true, signedAt: "Now", status: "Approved" } : c)) }));
}
export function addPurchaseOrder(jobId: string, vendor: string, what: string, amount: number, received: boolean) {
  if (!vendor.trim() || amount <= 0) return;
  patch(jobId, (j) => {
    const row: PurchaseOrder = { id: `PO-${60 + j.pos.length}`, vendor: vendor.trim(), what: what.trim() || vendor.trim(), amount, status: received ? "Received" : "Sent", file: { name: `${vendor}.pdf`, url: "#" } };
    addHistory(j.personId, j.pm, received ? `PO received ${vendor} $${amount}.` : `PO sent ${vendor} $${amount}.`);
    return { ...j, pos: [row, ...j.pos] };
  });
}
export function receivePo(jobId: string, poId: string) {
  patch(jobId, (j) => ({ ...j, pos: j.pos.map((p) => (p.id === poId ? { ...p, status: "Received" } : p)) }));
}
export function addInvoice(jobId: string, kind: JobInvoice["kind"], amount: number) {
  if (amount <= 0) return;
  patch(jobId, (j) => {
    const row: JobInvoice = { id: `INV-${30 + j.invoices.length}`, kind, amount, paid: 0, status: "Sent", file: { name: `INV.pdf`, url: "#" }, payments: [] };
    addHistory(j.personId, j.pm, `${kind} invoice sent ${amount}.`);
    return { ...j, invoices: [row, ...j.invoices] };
  });
}
export function setInvoiceStatus(jobId: string, invoiceId: string, status: PayStatus) {
  patch(jobId, (j) => ({ ...j, invoices: j.invoices.map((i) => (i.id === invoiceId ? { ...i, status } : i)) }));
}
export function payInvoice(jobId: string, invoiceId: string, how = "Card") {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, `Invoice ${invoiceId} paid.`);
    return {
      ...j,
      invoices: j.invoices.map((i) =>
        i.id === invoiceId
          ? { ...i, paid: i.amount, status: "Paid", payments: [...i.payments, { id: `PY-${Date.now()}`, amount: i.amount - i.paid, at: "Now", how, status: "Paid" }] }
          : i,
      ),
    };
  });
}
export function patchLoan(jobId: string, row: Partial<LoanFile>) {
  patch(jobId, (j) => {
    const loan = { ...j.loan, ...row };
    if (loan.status === "Funded" && loan.fundedAmount <= 0) loan.fundedAmount = loan.amount;
    addHistory(j.personId, j.pm, `GoodLeap ${loan.status}.`);
    return { ...j, loan };
  });
}
export function setEventStatus(jobId: string, id: string, status: JobEvent["status"]) {
  patch(jobId, (j) => ({ ...j, events: j.events.map((e) => (e.id === id ? { ...e, status } : e)) }));
}
export function addEvent(jobId: string, process: string, scopeId: string, day: string) {
  if (!day.trim()) return;
  patch(jobId, (j) => {
    const scope = j.scope.find((s) => s.id === scopeId);
    const row: JobEvent = { id: `EV-${Date.now()}`, scopeId, process, day: day.trim(), window: "07:00–15:00", crew: j.crew, status: "Set" };
    addHistory(j.personId, j.pm, `${process} · ${scope?.label ?? ""} ${day}.`);
    return { ...j, events: [...j.events, row] };
  });
}
export function addPunch(jobId: string, item: string) {
  if (!item.trim()) return;
  patch(jobId, (j) => ({ ...j, punch: [{ id: `PU-${Date.now()}`, item: item.trim(), owner: j.crew, status: "Open" }, ...j.punch] }));
}
export function togglePunch(jobId: string, id: string) {
  patch(jobId, (j) => ({ ...j, punch: j.punch.map((p) => (p.id === id ? { ...p, status: p.status === "Open" ? "Done" : "Open" } : p)) }));
}
export function addEquip(jobId: string, name: string, eta: string) {
  if (!name.trim()) return;
  patch(jobId, (j) => ({
    ...j,
    equipment: [...j.equipment, { id: `EQ-${Date.now()}`, name: name.trim(), model: "", serial: "", ahri: "", eta: eta.trim() || "TBD", status: "Ordered", oldRecovered: false }],
  }));
}
export function setEquip(jobId: string, id: string, patchRow: Partial<EquipRow>) {
  patch(jobId, (j) => ({ ...j, equipment: j.equipment.map((e) => (e.id === id ? { ...e, ...patchRow } : e)) }));
}
export function toggleCheck(jobId: string, id: string) {
  patch(jobId, (j) => ({ ...j, checks: j.checks.map((c) => (c.id === id ? { ...c, on: !c.on } : c)) }));
}
export function addTimePunch(jobId: string, who: string, day: string) {
  if (!who.trim()) return;
  const row: TimePunch = { id: `HR-${Date.now()}`, who: who.trim(), day: day || "Today", leftYard: "", onSite: "", complete: "", back: "" };
  patch(jobId, (j) => ({ ...j, punches: [row, ...j.punches] }));
}
export function patchPunchClock(jobId: string, id: string, row: Partial<TimePunch>) {
  patch(jobId, (j) => {
    const punches = j.punches.map((p) => (p.id === id ? { ...p, ...row } : p));
    const labor = punches.reduce((s, p) => s + Math.round(punchHours(p).total * 55), 0);
    return { ...j, punches, labor: labor || j.labor };
  });
}
export function setAccess(jobId: string, access: string) {
  patch(jobId, (j) => ({ ...j, access }), { nudge: false });
}
export function patchPermit(jobId: string, row: Partial<PermitFile>) {
  patch(jobId, (j) => ({ ...j, permit: { ...j.permit, ...row } }));
}
export function patchRebate(jobId: string, row: Partial<RebateFile>) {
  patch(jobId, (j) => ({ ...j, rebate: { ...j.rebate, ...row } }), { nudge: false });
}
export function patchTest(jobId: string, row: Partial<TestOut>) {
  patch(jobId, (j) => ({ ...j, testOut: { ...j.testOut, ...row } }));
}
export function togglePre(jobId: string, id: string) {
  patch(jobId, (j) => ({ ...j, preCheck: { ...j.preCheck, items: j.preCheck.items.map((i) => (i.id === id ? { ...i, on: !i.on } : i)) } }), { nudge: false });
}
export function togglePost(jobId: string, id: string) {
  patch(jobId, (j) => ({ ...j, postCheck: { ...j.postCheck, items: j.postCheck.items.map((i) => (i.id === id ? { ...i, on: !i.on } : i)) } }), { nudge: false });
}
export function signPre(jobId: string, who: string) {
  if (!who.trim()) return;
  patch(jobId, (j) => ({ ...j, preCheck: { ...j.preCheck, signedBy: who.trim(), signedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) } }), { nudge: false });
}
export function signPost(jobId: string, who: string) {
  if (!who.trim()) return;
  patch(jobId, (j) => ({ ...j, postCheck: { ...j.postCheck, signedBy: who.trim(), signedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) } }), { nudge: false });
}
export function togglePacket(jobId: string, id: string) {
  patch(jobId, (j) => ({ ...j, packet: { ...j.packet, parts: j.packet.parts.map((p) => (p.id === id ? { ...p, on: !p.on } : p)) } }), { nudge: false });
}
export function sendPacket(jobId: string) {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, "Closing packet sent.");
    return { ...j, packet: { ...j.packet, sent: true, sentAt: "Now" } };
  }, { nudge: false });
}
export function sendFinalInvoice(jobId: string) {
  patch(jobId, (j) => {
    const due = Math.max(0, j.sold + approvedCos(j) - paid(j));
    if (due <= 0) return j;
    const row: JobInvoice = { id: `INV-${30 + j.invoices.length}`, kind: "Final", amount: due, paid: 0, status: "Sent", file: { name: "final-invoice.pdf", url: "#" }, payments: [] };
    addHistory(j.personId, j.pm, `Final invoice sent ${due}.`);
    return { ...j, invoices: [row, ...j.invoices] };
  });
}
export function completeJob(jobId: string) {
  const j = jobs[jobId];
  if (!j) return;
  if (closeBlocks(j).length) return;
  patch(jobId, (cur) => {
    addHistory(cur.personId, cur.pm, cur.warranty ? "Job closed. Warranty opened." : "Job closed.");
    return { ...cur, stage: "Closed" };
  }, { nudge: false });
}
export function allInvoices() {
  return Object.values(jobs).flatMap((j) => j.invoices.map((i) => ({ ...i, jobId: j.jobId, name: j.name, personId: j.personId })));
}
export function allPos() {
  return Object.values(jobs).flatMap((j) => j.pos.map((p) => ({ ...p, jobId: j.jobId, name: j.name, personId: j.personId })));
}
export function dispatched() {
  return Object.values(jobs).filter((j) => j.stage !== "Closed" && j.crew);
}
