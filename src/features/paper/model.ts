import type { Agreement, Proposal } from "@/features/opportunity/store";
import type { JobFile, JobInvoice } from "@/features/job/types";
import type { Lead, Tone } from "@/lib/crm-data";
import { money } from "@/lib/crm-data";

export const PAPER_KINDS = ["agreement", "change", "work", "purchase", "invoice"] as const;
export type PaperKind = (typeof PAPER_KINDS)[number];
export type PaperStack = "collect" | "truck" | "waiting" | "send";

export type PaperAction =
  | { type: "sign-wo"; jobId: string; woId: string; who: string }
  | { type: "receive-po"; jobId: string; poId: string }
  | { type: "send-po"; jobId: string; poId: string }
  | { type: "pay"; jobId: string; invoiceId: string }
  | { type: "send-invoice"; jobId: string; invoiceId: string }
  | { type: "sign-co"; jobId: string; coId: string }
  | { type: "issue-wo"; jobId: string }
  | { type: "fund"; jobId: string };

export type PaperRow = {
  id: string;
  kind: PaperKind;
  jobId: string;
  personId: string;
  customer: string;
  title: string;
  detail: string;
  number: string;
  status: string;
  tone: Tone;
  stuck: boolean;
  action?: string;
  run?: PaperAction;
  amount?: number;
  when?: string;
  figure?: string;
  internal?: boolean;
  fileUrl?: string;
  fileName?: string;
  oppId?: string;
  rank: number;
  stack?: PaperStack;
  ageDays?: number;
  owner?: string;
  lender?: boolean;
  mismatch?: boolean;
  batch?: string;
};

const QUIET_INVOICE = new Set(["Paid", "Void", "Refunded"]);
const COLLECT_STATUS = new Set(["Past due", "NSF", "Card declined", "Partial"]);
const QUIET_WO = new Set(["Signed", "On truck", "Done"]);
const QUIET_PO = new Set(["Received", "Closed"]);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function paperTone(status: string): Tone {
  if (["Paid", "Received", "Closed", "Signed", "Done", "Approved", "On truck"].includes(status)) return "up";
  if (["Past due", "NSF", "Card declined", "Declined", "Void", "Not on file", "Not billed"].includes(status)) return "alert";
  if (["Partial", "Acked", "Opened"].includes(status)) return "navy";
  return "navy";
}

function customerOf(job: JobFile, leads: Lead[]) {
  return leads.find((l) => l.id === job.leadId)?.name || job.name.split("—")[0]?.trim() || job.name;
}

export function dayLabel(day: string) {
  if (!day) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    const [y, m, d] = day.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return day;
}

function isoOf(raw: string, year: number) {
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const named = raw.match(/^([A-Za-z]+)\s+(\d{1,2})$/);
  if (!named) return "";
  const month = MONTHS.findIndex((m) => named[1].toLowerCase().startsWith(m.toLowerCase()));
  if (month < 0) return "";
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(Number(named[2])).padStart(2, "0")}`;
}

function todayIso(today: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Phoenix", year: "numeric", month: "2-digit", day: "2-digit" }).format(today);
}

function dayNumber(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

function ageDays(since: string | undefined, today: string, year: number) {
  const iso = since ? isoOf(since, year) || (/^\d{4}-\d{2}-\d{2}/.test(since) ? since.slice(0, 10) : "") : "";
  if (!iso) return 0;
  return Math.max(0, dayNumber(today) - dayNumber(iso));
}

function installIso(job: JobFile, year: number) {
  const raw = [...job.assignments.map((a) => a.day), ...job.events.map((e) => e.day), ...job.workOrders.map((w) => w.day), job.window];
  const isos = raw.map((d) => isoOf(d, year)).filter(Boolean);
  return isos.sort().at(-1) || "";
}

function inWindow(install: string, today: string) {
  if (!install) return false;
  const diff = dayNumber(install) - dayNumber(today);
  return diff >= -2 && diff <= 2;
}

function agreementsFor(personId: string, proposals: Proposal[]) {
  const rows: { proposal: Proposal; agreement: Agreement }[] = [];
  for (const proposal of proposals) {
    if (proposal.personId !== personId) continue;
    const list = proposal.agreements?.length ? proposal.agreements : proposal.agreement ? [proposal.agreement] : [];
    for (const agreement of list) rows.push({ proposal, agreement });
  }
  return rows;
}

function invoiceRow(job: JobFile, inv: JobInvoice, customer: string, seeCost: boolean, today: string, year: number): PaperRow | null {
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

function place(row: PaperRow, job: JobFile, windowed: boolean, install: string): PaperRow {
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

export function buildPaper(jobs: JobFile[], proposals: Proposal[], leads: Lead[], seeCost: boolean, today = new Date()): PaperRow[] {
  const todayKey = todayIso(today);
  const year = Number(todayKey.slice(0, 4));
  const out: PaperRow[] = [];
  for (const job of jobs) {
    const customer = customerOf(job, leads);
    const liveJob = !job.cancelled && job.stage !== "Closed";
    const install = installIso(job, year);
    const windowed = liveJob && inWindow(install, todayKey);
    const found = agreementsFor(job.leadId || job.personId, proposals);
    const live = found.filter((row) => row.agreement.status !== "Void");
    const signed = live.some((row) => row.agreement.status === "Signed");
    const signedPrice = live.find((row) => row.agreement.status === "Signed")?.agreement.price ?? job.sold;
    for (const { proposal, agreement } of found) {
      const status = agreement.status === "Partial" ? "Waiting on co-signer" : agreement.status;
      const stuck = agreement.status !== "Signed" && agreement.status !== "Void";
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
            stuck,
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
    const signedCo = job.changeOrders.filter((c) => c.signed);
    const billed = job.invoices.filter((i) => i.party !== "pay" && i.kind !== "Commission" && i.kind !== "Piece" && i.status !== "Void").reduce((sum, i) => sum + i.amount, 0);
    const gap = signedPrice + signedCo.reduce((sum, c) => sum + c.amount, 0) - billed;
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
  return out;
}

export function paperAlertCount(jobs: JobFile[], proposals: Proposal[], leads: Lead[]) {
  const rows = buildPaper(jobs, proposals, leads, true);
  const pastDue = rows.filter((r) => r.stack === "collect" && !r.mismatch).length;
  const blocked = new Set(rows.filter((r) => r.stack === "truck").map((r) => r.jobId)).size;
  return pastDue + blocked;
}

export function uncollected(rows: PaperRow[]) {
  return rows.filter((r) => r.stack === "collect").reduce((sum, r) => sum + (r.amount ?? 0), 0);
}

export function blockedJobs(rows: PaperRow[]) {
  return new Set(rows.filter((r) => r.stack === "truck").map((r) => r.jobId)).size;
}

const STACK_ORDER: Record<PaperStack, number> = { collect: 0, truck: 1, waiting: 2, send: 3 };

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
