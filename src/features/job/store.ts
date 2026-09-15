import { useSyncExternalStore } from "react";
import { addHistory } from "@/features/ops/store";
import { seedJobs } from "./seed";
import type { ChangeOrder, Hold, JobFile, JobInvoice, PurchaseOrder, Stage, WorkOrder } from "./types";

export type { ChangeOrder, Hold, JobFile, JobInvoice, PurchaseOrder, Stage, WorkOrder } from "./types";
export { HOLDS, STAGES } from "./types";

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
function patch(jobId: string, fn: (j: JobFile) => JobFile) {
  const cur = jobs[jobId];
  if (!cur) return;
  jobs = { ...jobs, [jobId]: fn(cur) };
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
  });
}
export function toggleHold(jobId: string, hold: Hold) {
  patch(jobId, (j) => {
    const on = j.holds.includes(hold);
    addHistory(j.personId, j.pm, on ? `Hold cleared: ${hold}.` : `Hold set: ${hold}.`);
    return { ...j, holds: on ? j.holds.filter((h) => h !== hold) : [...j.holds, hold] };
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
  });
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
