import { useSyncExternalStore } from "react";
import { addHistory } from "@/features/ops/store";
import { seedJobs } from "./seed";
import { inferStage, STAGES, type ChangeOrder, type CrewAssign, type EquipRow, type Hold, type JobAppt, type JobFile, type JobInvoice, type PunchItem, type PurchaseOrder, type Stage, type WorkOrder, type WorkPackage } from "./types";

export type { ChangeOrder, CheckItem, CrewAssign, EquipRow, Hold, HoldRow, JobAppt, JobFile, JobInvoice, LaborRow, PunchItem, PurchaseOrder, Stage, WorkOrder, WorkPackage } from "./types";
export { HOLDS, STAGES, inferStage, jobTone } from "./types";

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
  const all = useJobs();
  return all[jobId];
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
export function tally(job: JobFile) {
  const revenue = job.sold + approvedCos(job);
  const cost = job.labor + job.commission + poReceived(job) + job.extras;
  return { revenue, cost, margin: revenue - cost, balance: invoiced(job) - paid(job), watch: poWatch(job) };
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
  const window = first.day ? `${first.day} · ${first.start}–${first.end}` : j.window;
  return { ...j, crew: first.crew, truck: first.truck, window };
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
      scopes: j.scope[0] ? [j.scope[0].label] : [],
    };
    addHistory(j.personId, j.pm, "Crew added.");
    return syncCrew({ ...j, assignments: [...j.assignments, row] });
  });
}
export function patchAssign(jobId: string, id: string, row: Partial<CrewAssign>) {
  patch(jobId, (j) => {
    const assignments = j.assignments.map((a) => (a.id === id ? { ...a, ...row } : a));
    const next = syncCrew({ ...j, assignments });
    const hit = assignments.find((a) => a.id === id);
    if (hit?.day) addHistory(j.personId, j.pm, `${hit.crew} · ${hit.day} · ${hit.scopes.join(", ") || "no scope"}.`);
    return next;
  });
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
export function assignCrew(jobId: string, crew: string, truck: string, window: string) {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, `Crew ${crew} · ${truck} · ${window}.`);
    return { ...j, crew, truck, window };
  });
}
export function addChangeOrder(jobId: string, why: string, amount: number, cost: number) {
  if (!why.trim() || amount <= 0) return;
  patch(jobId, (j) => {
    const row: ChangeOrder = { id: `CO-${j.changeOrders.length + 1}`, why: why.trim(), amount, cost, status: "Approved" };
    addHistory(j.personId, j.pm, `Change order approved ${why.trim()} +$${amount}.`);
    return { ...j, changeOrders: [row, ...j.changeOrders], extras: j.extras + cost, scope: [...j.scope, { label: why.trim(), amount }] };
  });
}
export function addPurchaseOrder(jobId: string, vendor: string, what: string, amount: number, received: boolean) {
  if (!vendor.trim() || amount <= 0) return;
  patch(jobId, (j) => {
    const row: PurchaseOrder = { id: `PO-${60 + j.pos.length}`, vendor: vendor.trim(), what: what.trim() || vendor.trim(), amount, status: received ? "Received" : "Sent" };
    addHistory(j.personId, j.pm, received ? `PO received ${vendor} $${amount}.` : `PO sent ${vendor} $${amount}.`);
    return { ...j, pos: [row, ...j.pos] };
  });
}
export function receivePo(jobId: string, poId: string) {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, `PO ${poId} received.`);
    return { ...j, pos: j.pos.map((p) => (p.id === poId ? { ...p, status: "Received" } : p)) };
  });
}
export function addInvoice(jobId: string, kind: JobInvoice["kind"], amount: number) {
  if (amount <= 0) return;
  patch(jobId, (j) => {
    const row: JobInvoice = { id: `INV-${30 + j.invoices.length}`, kind, amount, paid: 0, status: "Sent" };
    addHistory(j.personId, j.pm, `${kind} invoice sent ${amount}.`);
    return { ...j, invoices: [row, ...j.invoices] };
  });
}
export function payInvoice(jobId: string, invoiceId: string) {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, `Invoice ${invoiceId} paid.`);
    return { ...j, invoices: j.invoices.map((i) => (i.id === invoiceId ? { ...i, paid: i.amount, status: "Paid" } : i)) };
  });
}
export function issueWo(jobId: string) {
  patch(jobId, (j) => {
    const row: WorkOrder = { id: `WO-${10 + j.workOrders.length}`, status: "Issued", day: j.window, crew: j.crew, notes: j.scope.map((s) => s.label).join(", ") };
    addHistory(j.personId, j.pm, `Work order ${row.id} issued.`);
    return { ...j, workOrders: [row, ...j.workOrders] };
  });
}
export function setNtp(jobId: string, ntp: JobFile["ntp"]) {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, `NTP ${ntp}.`);
    return { ...j, ntp };
  });
}
export function completeJob(jobId: string) {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, j.warranty ? "Job closed. Warranty opened." : "Job closed.");
    return { ...j, stage: "Closed" };
  }, { nudge: false });
}
export function setPackageStatus(jobId: string, id: string, status: WorkPackage["status"]) {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, `Package ${status}.`);
    return { ...j, packages: j.packages.map((p) => (p.id === id ? { ...p, status } : p)) };
  });
}
export function addPackage(jobId: string, name: string) {
  if (!name.trim()) return;
  patch(jobId, (j) => ({
    ...j,
    packages: [...j.packages, { id: `PKG-${Date.now()}`, name: name.trim(), status: "Queued", crew: j.crew }],
  }));
}
export function addAppt(jobId: string, kind: JobAppt["kind"], day: string) {
  if (!day.trim()) return;
  patch(jobId, (j) => {
    const row: JobAppt = { id: `JA-${Date.now()}`, kind, day: day.trim(), window: "7a–3p", crew: j.crew, status: "Set" };
    addHistory(j.personId, j.pm, `${kind} set ${day}.`);
    return { ...j, appointments: [...j.appointments, row] };
  });
}
export function setApptStatus(jobId: string, id: string, status: JobAppt["status"]) {
  patch(jobId, (j) => ({ ...j, appointments: j.appointments.map((a) => (a.id === id ? { ...a, status } : a)) }));
}
export function addPunch(jobId: string, item: string) {
  if (!item.trim()) return;
  patch(jobId, (j) => ({
    ...j,
    punch: [{ id: `PU-${Date.now()}`, item: item.trim(), owner: j.crew, status: "Open" }, ...j.punch],
  }));
}
export function togglePunch(jobId: string, id: string) {
  patch(jobId, (j) => ({
    ...j,
    punch: j.punch.map((p) => (p.id === id ? { ...p, status: p.status === "Open" ? "Done" : "Open" } : p)),
  }));
}
export function addEquip(jobId: string, name: string, eta: string) {
  if (!name.trim()) return;
  patch(jobId, (j) => ({
    ...j,
    equipment: [...j.equipment, { id: `EQ-${Date.now()}`, name: name.trim(), serial: "", eta: eta.trim() || "TBD", status: "Ordered" }],
  }));
}
export function setEquip(jobId: string, id: string, patchRow: Partial<EquipRow>) {
  patch(jobId, (j) => ({ ...j, equipment: j.equipment.map((e) => (e.id === id ? { ...e, ...patchRow } : e)) }));
}
export function toggleCheck(jobId: string, id: string) {
  patch(jobId, (j) => ({ ...j, checks: j.checks.map((c) => (c.id === id ? { ...c, on: !c.on } : c)) }));
}
export function addHours(jobId: string, who: string, hours: number, day: string) {
  if (!who.trim() || hours <= 0) return;
  patch(jobId, (j) => ({
    ...j,
    hours: [{ id: `HR-${Date.now()}`, who: who.trim(), hours, day: day.trim() || "Today" }, ...j.hours],
    labor: j.labor + Math.round(hours * 55),
  }));
}
export function setAccess(jobId: string, access: string) {
  patch(jobId, (j) => ({ ...j, access }));
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
