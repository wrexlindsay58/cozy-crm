import type { SalesBoard } from "./types";

export function memberSales(t: Pick<SalesBoard, "jobs" | "priorJobs">) {
  const members = Math.max(0, Math.round(t.jobs * 0.42));
  const priorMembers = Math.max(0, Math.round(t.priorJobs * 0.36));
  const attached = Math.min(members, Math.max(0, Math.round(t.jobs * 0.38)));
  const priorAttached = Math.min(priorMembers, Math.max(0, Math.round(t.priorJobs * 0.33)));
  return {
    members,
    priorMembers,
    total: members * 864,
    priorTotal: priorMembers * 820,
    rate: t.jobs ? Math.round((attached / t.jobs) * 100) : 0,
    priorRate: t.priorJobs ? Math.round((priorAttached / t.priorJobs) * 100) : 0,
    attached,
    jobs: t.jobs,
  };
}
