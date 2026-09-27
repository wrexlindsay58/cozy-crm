import { syncPayInvoices, laborFromCrew } from "./seed";
import { seedJobs } from "../seed";
import type { JobFile } from "../types";

export let jobs: Record<string, JobFile> = Object.fromEntries(seedJobs().map((j) => [j.jobId, syncPayInvoices(laborFromCrew(j))]));

export const listeners = new Set<() => void>();

export function emit() {
  listeners.forEach((l) => l());
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function snap() {
  return jobs;
}

export function write_jobs(next: typeof jobs) {
  jobs = next;
  return next;
}
