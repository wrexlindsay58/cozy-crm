import { money } from "@/lib/crm-data";
import { paperTone, customerOf, dayLabel, ageDays, installIso, inWindow, agreementsFor } from "./part-01";
import { place } from "./part-02";

export function prep_step_buildPaper(job: any, leads: any, year: any, todayKey: any, proposals: any, out: any, seeCost: any) {
    const customer = customerOf(job, leads);
    const liveJob = !job.cancelled && job.stage !== "Closed";
    const install = installIso(job, year);
    const windowed = liveJob && inWindow(install, todayKey);
    const found = agreementsFor(job.leadId || job.personId, proposals);
    const live = found.filter((row) => row.agreement.status !== "Void");
    const signed = live.some((row) => row.agreement.status === "Signed");
    const signedPrice = live.find((row) => row.agreement.status === "Signed")?.agreement.price ?? job.sold;
    let stuck = false;
    for (const { proposal, agreement } of found) {
      const status = agreement.status === "Partial" ? "Waiting on co-signer" : agreement.status;
      const rowStuck = agreement.status !== "Signed" && agreement.status !== "Void";
      if (rowStuck) stuck = true;
      const change = agreement.kind === "change";
      out.push(
        place(
          {
            id: `${job.jobId}-${agreement.id}`,
            kind: change ? "change" : "agreement",
            jobId: job.jobId,
            personId: job.personId,
            customer,
            title: customer,
            detail: change ? `Change · ${agreement.optionName}` : agreement.optionName,
            number: agreement.id,
            status,
            tone: paperTone(agreement.status === "Signed" ? "Signed" : agreement.status),
            stuck: rowStuck,
            amount: agreement.price,
            when: agreement.signedAt ? dayLabel(agreement.signedAt.slice(0, 10)) : "",
            fileUrl: agreement.fileUrl,
            fileName: agreement.fileName,
            oppId: proposal.oppId,
            rank: 1,
            ageDays: ageDays(agreement.sentAt || agreement.createdAt, todayKey, year),
          },
          job,
          windowed,
          install,
        ),
      );
    }
    if (!signed && live.length === 0) {
      out.push(
        place(
          {
            id: `missing-ag-${job.jobId}`,
            kind: "agreement",
            jobId: job.jobId,
            personId: job.personId,
            customer,
            title: customer,
            detail: "No signed agreement",
            number: "",
            status: "Not on file",
            tone: "alert",
            stuck: liveJob,
            rank: 1,
          },
          job,
          windowed,
          install,
        ),
      );
    }
    const signedCo = job.changeOrders.filter((c: any) => c.signed);
    const billed = job.invoices.filter((i: any) => i.party !== "pay" && i.kind !== "Commission" && i.kind !== "Piece" && i.status !== "Void").reduce((sum: any, i: any) => sum + i.amount, 0);
    const gap = signedPrice + signedCo.reduce((sum: any, c: any) => sum + c.amount, 0) - billed;
    if (liveJob && signedCo.length > 0 && billed > 0 && gap > 0) {
      out.push({
        id: `mismatch-${job.jobId}`,
        kind: "invoice",
        jobId: job.jobId,
        personId: job.personId,
        customer,
        title: money(gap),
        detail: "Signed change not billed",
        number: "",
        status: "Not billed",
        tone: "alert",
        stuck: true,
        amount: gap,
        rank: 0,
        stack: "collect",
        owner: "Office",
        mismatch: true,
        ageDays: ageDays(signedCo[0]?.since || signedCo[0]?.signedAt, todayKey, year),
        figure: ageDays(signedCo[0]?.since || signedCo[0]?.signedAt, todayKey, year) > 0 ? `${ageDays(signedCo[0]?.since || signedCo[0]?.signedAt, todayKey, year)}d` : "",
      });
    }
  return { stuck, customer, windowed, install, liveJob };
}
