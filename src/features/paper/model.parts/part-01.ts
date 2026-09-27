import type { Agreement, Proposal } from "@/features/opportunity/store";
import type { JobFile } from "@/features/job/types";
import type { Lead, Tone } from "@/lib/crm-data";
import { step_buildPaper } from "./part-03";

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

export const QUIET_INVOICE = new Set(["Paid", "Void", "Refunded"]);

export const COLLECT_STATUS = new Set(["Past due", "NSF", "Card declined", "Partial"]);

export const QUIET_WO = new Set(["Signed", "On truck", "Done"]);

export const QUIET_PO = new Set(["Received", "Closed"]);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function paperTone(status: string): Tone {
  if (["Paid", "Received", "Closed", "Signed", "Done", "Approved", "On truck"].includes(status)) return "up";
  if (["Past due", "NSF", "Card declined", "Declined", "Void", "Not on file", "Not billed"].includes(status)) return "alert";
  if (["Partial", "Acked", "Opened"].includes(status)) return "navy";
  return "navy";
}

export function customerOf(job: JobFile, leads: Lead[]) {
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

export function ageDays(since: string | undefined, today: string, year: number) {
  const iso = since ? isoOf(since, year) || (/^\d{4}-\d{2}-\d{2}/.test(since) ? since.slice(0, 10) : "") : "";
  if (!iso) return 0;
  return Math.max(0, dayNumber(today) - dayNumber(iso));
}

export function installIso(job: JobFile, year: number) {
  const raw = [...job.assignments.map((a) => a.day), ...job.events.map((e) => e.day), ...job.workOrders.map((w) => w.day), job.window];
  const isos = raw.map((d) => isoOf(d, year)).filter(Boolean);
  return isos.sort().at(-1) || "";
}

export function inWindow(install: string, today: string) {
  if (!install) return false;
  const diff = dayNumber(install) - dayNumber(today);
  return diff >= -2 && diff <= 2;
}

export function agreementsFor(personId: string, proposals: Proposal[]) {
  const rows: { proposal: Proposal; agreement: Agreement }[] = [];
  for (const proposal of proposals) {
    if (proposal.personId !== personId) continue;
    const list = proposal.agreements?.length ? proposal.agreements : proposal.agreement ? [proposal.agreement] : [];
    for (const agreement of list) rows.push({ proposal, agreement });
  }
  return rows;
}

export function buildPaper(jobs: JobFile[], proposals: Proposal[], leads: Lead[], seeCost: boolean, today = new Date()): PaperRow[] {
  const todayKey = todayIso(today);
  const year = Number(todayKey.slice(0, 4));
  const out: PaperRow[] = [];
  for (const job of jobs) {
    step_buildPaper(job, leads, year, todayKey, proposals, out, seeCost);
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

export const STACK_ORDER: Record<PaperStack, number> = { collect: 0, truck: 1, waiting: 2, send: 3 };
