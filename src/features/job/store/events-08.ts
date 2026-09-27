import { jobs, write_jobs, emit } from "./core";
import { patch } from "./events-02";
import { addHistory, dropLatestHistory } from "@/features/ops/store";
import { actingName, dropLatestEmployeeAct } from "@/features/staff/store";
import { closeBlockers } from "../closeout";
import { undoToast } from "@/lib/undo-toast";

export function cancelJob(jobId: string, why = "") {
  const snapshot = jobs[jobId];
  if (!snapshot || snapshot.cancelled) return;
  const what = why.trim() ? `Job cancelled. ${why.trim()}` : "Job cancelled.";
  patch(jobId, (j) => {
    if (j.cancelled) return j;
    addHistory(j.personId, actingName(), what);
    return { ...j, cancelled: true, cancelWhy: why.trim(), cancelledAt: "Now" };
  }, { nudge: false });
  undoToast("Job canceled", () => {
    write_jobs({ ...jobs, [jobId]: snapshot });
    emit();
    dropLatestHistory(snapshot.personId, what);
    dropLatestEmployeeAct(snapshot.personId, what);
  });
}

export function completeJob(jobId: string) {
  const j = jobs[jobId];
  if (!j) return;
  if (closeBlockers(j).length) return;
  patch(jobId, (cur) => {
    addHistory(cur.personId, cur.pm, cur.warranty ? "Job closed. Warranty opened." : "Job closed.");
    return { ...cur, stage: "Closed" };
  }, { nudge: false });
}

export function dispatched() {
  return Object.values(jobs).filter((j) => j.stage !== "Closed" && !j.cancelled && j.crew);
}
