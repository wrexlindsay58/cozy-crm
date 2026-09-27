import { subscribe, snap, jobs, write_jobs, emit } from "./core";
import { patch } from "./events-02";
import { isPayBill } from "./seed";
import { useSyncExternalStore } from "react";
import { addHistory } from "@/features/ops/store";
import { actingName } from "@/features/staff/store";
import { cashLoan, defaultChecks, defaultPacket, defaultPost, defaultPre, emptyPermit, emptyRebate, emptyTest, type JobFile, type ScopeLine } from "../types";

export function useJobs() {
  useSyncExternalStore(subscribe, snap, snap);
  return jobs;
}

export function applyRemoteJobPatch(id: string, patch: Record<string, unknown>) {
  const current = jobs[id];
  if (!current) return;
  const next = { ...current };
  for (const [key, value] of Object.entries(patch)) {
    if (key === "jobId" || !(key in current)) continue;
    (next as Record<string, unknown>)[key] = value;
  }
  write_jobs({ ...jobs, [id]: next });
  emit();
}

export function applyRemoteJobDelete(id: string) {
  if (!jobs[id]) return;
  const next = { ...jobs };
  delete next[id];
  write_jobs(next);
  emit();
}

export function useJob(jobId: string) {
  return useJobs()[jobId];
}

export function jobForLead(leadId: string) {
  return Object.values(jobs).find((j) => j.leadId === leadId);
}

export function openSoldJob(input: { leadId: string; personId: string; name: string; product: string; closer: string; sold: number; accountId?: string }) {
  const existing = jobForLead(input.leadId);
  if (existing) return existing;
  const jobId = `P-${320 + Object.keys(jobs).length}`;
  const scope: ScopeLine = {
    id: `SC-${jobId}`,
    label: input.product,
    kind: "product",
    categoryId: "hvac",
    amount: input.sold,
    qty: 1,
    notes: "",
    quotedCost: 0,
    estHours: 0,
    media: [],
    owner: input.closer,
    promiseDone: false,
    bom: [],
  };
  const row: JobFile = {
    jobId,
    personId: input.personId,
    leadId: input.leadId,
    accountId: input.accountId ?? "",
    name: input.name,
    product: input.product,
    pm: input.closer,
    closer: input.closer,
    stage: "Sold",
    holds: [],
    sold: input.sold,
    soldAt: "Today",
    labor: 0,
    commission: 0,
    commissions: [],
    extras: 0,
    crew: "",
    truck: "",
    window: "",
    assignments: [],
    soldNotes: "",
    scope: [scope],
    warranty: false,
    loan: cashLoan(),
    workOrders: [],
    pos: [],
    changeOrders: [],
    invoices: [],
    events: [],
    punch: [],
    equipment: [],
    checks: defaultChecks(),
    punches: [],
    access: "",
    permit: emptyPermit(),
    rebate: emptyRebate(),
    testOut: emptyTest(),
    preCheck: defaultPre(),
    postCheck: defaultPost(),
    packet: defaultPacket(),
    installRev: 1,
    financeRev: 1,
  };
  write_jobs({ ...jobs, [jobId]: row });
  addHistory(input.personId, actingName(), `Job ${jobId} opened.`);
  emit();
  return row;
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

export function paid(job: JobFile) {
  return job.invoices.filter((i) => !isPayBill(i) && i.status !== "Void" && i.status !== "Refunded").reduce((s, i) => s + i.paid, 0);
}
