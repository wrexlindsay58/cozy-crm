import { useStaff } from "@/features/staff/store";
import { tally } from "../store";
import type { JobFile } from "../store";

export function useMoneyBlock({ job }: { job: JobFile }) {
useStaff();

const t = tally(job);

const installCos = job.changeOrders.filter((c) => c.lane !== "finance");

const financeCos = job.changeOrders.filter((c) => c.lane === "finance");
  return { job, t, installCos, financeCos };
}
