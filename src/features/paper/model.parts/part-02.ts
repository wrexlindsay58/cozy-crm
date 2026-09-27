import type { Proposal } from "@/features/opportunity/store";
import type { JobFile, JobInvoice } from "@/features/job/types";
import { money } from "@/lib/crm-data";
import { QUIET_INVOICE, COLLECT_STATUS, QUIET_WO, paperTone, dayLabel, ageDays, agreementsFor, STACK_ORDER, type PaperStack, type PaperRow } from "./part-01";

export function invoiceRow(job: JobFile, inv: JobInvoice, customer: string, seeCost: boolean, today: string, year: number): PaperRow | null {
  const internal = inv.party === "pay" || inv.kind === "Commission" || inv.kind === "Piece";
  if (internal && !seeCost) return null;
  const owed = Math.max(0, inv.amount - inv.paid);
  const stuck = !QUIET_INVOICE.has(inv.status);
  const due = COLLECT_STATUS.has(inv.status);
  return {
    id: `${job.jobId}-${inv.id}`,
    kind: "invoice",
    jobId: job.jobId,
    personId: job.personId,
    customer,
    title: internal ? inv.who || customer : customer,
    detail: internal ? `${inv.kind} pay` : `${inv.kind} invoice`,
    number: inv.id,
    status: inv.status,
    tone: due ? "alert" : paperTone(inv.status),
    stuck,
    action: !stuck ? undefined : inv.status === "Draft" ? "Send" : internal ? "Mark paid" : "Record payment",
    run: !stuck
      ? undefined
      : inv.status === "Draft"
        ? { type: "send-invoice", jobId: job.jobId, invoiceId: inv.id }
        : { type: "pay", jobId: job.jobId, invoiceId: inv.id },
    amount: owed || inv.amount,
    internal,
    fileUrl: internal ? undefined : inv.file?.url,
    fileName: inv.file?.name,
    rank: due ? 0 : 5,
    ageDays: ageDays(inv.since, today, year),
    batch: inv.status === "Draft" && !internal ? "send-invoice" : undefined,
  };
}

export function place(row: PaperRow, job: JobFile, windowed: boolean, install: string): PaperRow {
  if (row.internal || row.lender || row.mismatch) return { ...row, stuck: Boolean(row.stack) };
  let stack: PaperStack | undefined;
  let owner = job.pm;
  let action = row.action;
  let run = row.run;
  let title = row.title;
  let figure = "";
  const age = row.ageDays ?? 0;
  const ageFigure = age > 0 ? `${age}d` : "";

  if (row.kind === "invoice") {
    if (COLLECT_STATUS.has(row.status)) {
      stack = "collect";
      owner = "Office";
      title = money(row.amount ?? 0);
      figure = ageFigure;
    } else if (row.status === "Draft") {
      stack = "send";
      owner = "Office";
      figure = row.amount != null ? money(row.amount) : "";
    } else if (row.status === "Sent") {
      stack = "waiting";
      owner = "Office";
      figure = row.amount != null ? money(row.amount) : ageFigure;
    }
  } else if (row.kind === "agreement") {
    owner = job.closer;
    action = undefined;
    run = undefined;
    if (row.status !== "Signed" && row.status !== "Void") {
      if (windowed) stack = "truck";
      else if (row.status === "Waiting on co-signer" || row.status === "Sent" || row.status === "Opened") stack = "waiting";
    }
    figure = windowed ? dayLabel(install) : ageFigure;
  } else if (row.kind === "change") {
    owner = job.closer;
    if (row.stuck) {
      stack = windowed ? "truck" : "waiting";
      figure = windowed ? dayLabel(install) : row.amount != null ? money(row.amount) : ageFigure;
    }
  } else if (row.kind === "work") {
    owner = job.pm;
    if (row.stuck && windowed) {
      stack = "truck";
      figure = dayLabel(install);
    } else if (row.stuck) {
      action = undefined;
      run = undefined;
    }
  } else if (row.kind === "purchase") {
    owner = job.pm;
    if (row.stuck && row.status === "Draft") {
      stack = "send";
      figure = row.amount != null ? money(row.amount) : "";
    } else if (row.stuck && windowed) {
      stack = "truck";
      figure = dayLabel(install);
    } else if (row.stuck) {
      stack = "waiting";
      figure = row.amount != null ? money(row.amount) : ageFigure;
    }
  }

  return { ...row, stack, owner: stack ? owner : row.owner, action, run, title, figure, stuck: Boolean(stack) };
}

export function blockedJobs(rows: PaperRow[]) {
  return new Set(rows.filter((r) => r.stack === "truck").map((r) => r.jobId)).size;
}

export function byQueue(a: PaperRow, b: PaperRow) {
  const as = a.stack ? STACK_ORDER[a.stack] : 9;
  const bs = b.stack ? STACK_ORDER[b.stack] : 9;
  if (as !== bs) return as - bs;
  const aHot = (a.ageDays ?? 0) >= 3 ? 1 : 0;
  const bHot = (b.ageDays ?? 0) >= 3 ? 1 : 0;
  if (aHot !== bHot) return bHot - aHot;
  if ((b.ageDays ?? 0) !== (a.ageDays ?? 0)) return (b.ageDays ?? 0) - (a.ageDays ?? 0);
  return (b.amount ?? 0) - (a.amount ?? 0);
}

export function jobReady(job: JobFile, proposals: Proposal[]) {
  const found = agreementsFor(job.leadId || job.personId, proposals);
  const signed = found.some((row) => row.agreement.status === "Signed");
  const openPos = job.pos.filter((p) => p.status !== "Received" && p.status !== "Closed");
  const woOk = job.workOrders.length > 0 && job.workOrders.every((w) => QUIET_WO.has(w.status));
  const balance = job.invoices
    .filter((i) => i.party !== "pay" && i.kind !== "Commission" && i.kind !== "Piece" && !QUIET_INVOICE.has(i.status))
    .reduce((sum, i) => sum + Math.max(0, i.amount - i.paid), 0);
  const lender =
    job.loan.vendor === "GoodLeap" && job.loan.status !== "Funded" && job.loan.status !== "Cancelled" && job.loan.status !== "None"
      ? Math.max(0, job.loan.amount - job.loan.fundedAmount)
      : 0;
  return {
    agreement: signed ? "Signed" : "Not signed",
    agreementOk: signed,
    materials: job.pos.length === 0 ? "None yet" : openPos.length === 0 ? "In" : `${openPos.length} not in`,
    materialsOk: openPos.length === 0,
    work: job.workOrders.length === 0 ? "None yet" : woOk ? "Signed" : "Not signed",
    workOk: woOk,
    balance,
    lender,
  };
}
