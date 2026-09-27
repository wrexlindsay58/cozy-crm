import { money } from "@/lib/crm-data";
import { QUIET_PO, paperTone, ageDays } from "./part-01";
import { invoiceRow, place } from "./part-02";
import { prep_step_buildPaper2 } from "./part-04";

export function step_buildPaper(job: any, leads: any, year: any, todayKey: any, proposals: any, out: any, seeCost: any) {
    const { stuck, customer, windowed, install, liveJob } = prep_step_buildPaper2(job, leads, year, todayKey, proposals, out, seeCost);

    for (const po of job.pos) {
      const stuck = !QUIET_PO.has(po.status);
      const left = Math.max(0, po.amount - (po.receivedAmount ?? 0));
      out.push(
        place(
          {
            id: `${job.jobId}-${po.id}`,
            kind: "purchase",
            jobId: job.jobId,
            personId: job.personId,
            customer,
            title: po.vendor,
            detail: po.what,
            number: po.id,
            status: po.status,
            tone: paperTone(po.status),
            stuck,
            action: !stuck ? undefined : po.status === "Draft" ? "Send" : "Mark received",
            run: !stuck ? undefined : po.status === "Draft" ? { type: "send-po", jobId: job.jobId, poId: po.id } : { type: "receive-po", jobId: job.jobId, poId: po.id },
            amount: left || po.amount,
            fileUrl: po.file?.url && po.file.url !== "#" ? po.file.url : undefined,
            fileName: po.file?.name,
            rank: 4,
            ageDays: ageDays(po.since, todayKey, year),
            batch: po.status === "Draft" ? "send-po" : undefined,
          },
          job,
          windowed,
          install,
        ),
      );
    }
    for (const inv of job.invoices) {
      const row = invoiceRow(job, inv, customer, seeCost, todayKey, year);
      if (row) out.push(place(row, job, windowed, install));
    }
    const loan = job.loan;
    const lenderOwes = loan.vendor === "GoodLeap" && loan.status !== "Funded" && loan.status !== "Cancelled" && loan.status !== "None" && loan.fundedAmount < loan.amount;
    if (liveJob && lenderOwes) {
      out.push({
        id: `lender-${job.jobId}`,
        kind: "invoice",
        jobId: job.jobId,
        personId: job.personId,
        customer,
        title: "GoodLeap",
        detail: "Waiting on funding",
        number: "",
        status: "Not funded",
        tone: "navy",
        stuck: true,
        action: "Mark funded",
        run: { type: "fund", jobId: job.jobId },
        amount: loan.amount - loan.fundedAmount,
        figure: money(loan.amount - loan.fundedAmount),
        rank: 6,
        stack: "waiting",
        owner: job.pm,
        lender: true,
        ageDays: ageDays(loan.paySentAt, todayKey, year),
      });
    }
}
