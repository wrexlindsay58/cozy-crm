import { QUIET_WO, paperTone, dayLabel, ageDays } from "./part-01";
import { place } from "./part-02";
import { prep_step_buildPaper } from "./part-05";

export function prep_step_buildPaper2(job: any, leads: any, year: any, todayKey: any, proposals: any, out: any, seeCost: any) {
    const { stuck, customer, windowed, install, liveJob } = prep_step_buildPaper(job, leads, year, todayKey, proposals, out, seeCost);
    for (const co of job.changeOrders) {
      const stuck = !co.signed && co.status !== "Declined";
      out.push(
        place(
          {
            id: `${job.jobId}-${co.id}`,
            kind: "change",
            jobId: job.jobId,
            personId: job.personId,
            customer,
            title: customer,
            detail: co.why,
            number: co.id,
            status: co.signed ? "Signed" : co.status,
            tone: co.signed ? "up" : paperTone(co.status),
            stuck,
            action: stuck ? "Mark signed" : undefined,
            run: stuck ? { type: "sign-co", jobId: job.jobId, coId: co.id } : undefined,
            amount: co.amount,
            when: co.signedAt,
            rank: 2,
            ageDays: ageDays(co.since || co.signedAt, todayKey, year),
          },
          job,
          windowed,
          install,
        ),
      );
    }
    if (job.workOrders.length === 0 && job.assignments.length > 0) {
      out.push(
        place(
          {
            id: `missing-wo-${job.jobId}`,
            kind: "work",
            jobId: job.jobId,
            personId: job.personId,
            customer,
            title: job.assignments[0]?.crew || "Crew",
            detail: "No work order",
            number: "",
            status: "Not on file",
            tone: "alert",
            stuck: liveJob,
            action: liveJob ? "Create" : undefined,
            run: liveJob ? { type: "issue-wo", jobId: job.jobId } : undefined,
            rank: 3,
          },
          job,
          windowed,
          install,
        ),
      );
    }
    for (const wo of job.workOrders) {
      const stuck = !QUIET_WO.has(wo.status);
      out.push(
        place(
          {
            id: `${job.jobId}-${wo.id}`,
            kind: "work",
            jobId: job.jobId,
            personId: job.personId,
            customer,
            title: wo.crew,
            detail: wo.notes || "Work order",
            number: wo.id,
            status: wo.status,
            tone: paperTone(wo.status),
            stuck,
            action: stuck ? "Sign" : undefined,
            run: stuck ? { type: "sign-wo", jobId: job.jobId, woId: wo.id, who: job.pm } : undefined,
            when: dayLabel(wo.day),
            fileUrl: wo.file?.url && wo.file.url !== "#" ? wo.file.url : undefined,
            fileName: wo.file?.name,
            rank: 3,
            ageDays: ageDays(wo.since || wo.day, todayKey, year),
          },
          job,
          windowed,
          install,
        ),
      );
    }
  return { stuck, customer, windowed, install, liveJob };
}
