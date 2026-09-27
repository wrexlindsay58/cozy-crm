import { useSyncExternalStore } from "react";
import { addHistory, createTicket } from "@/features/ops/store";
import { putFromAppointment } from "@/features/book/store";
import { actingName } from "@/features/staff/store";
import { accounts, type Account } from "@/lib/crm-data";
import { whitaker, blank, extraAccounts, photoRows, listeners, type VisitKind, type Visit, type IssueStatus, type AccountIssue, type AccountFile, write_extraAccounts } from "./part-01";

function choFile(): AccountFile {
  return {
    ...blank("A-204"),
    leadId: "L-4788",
    warrantyStart: "Sep 22, 2026",
    warrantyUntil: "Sep 22, 2027",
    reviews: [
      { id: "RV-cho-g", platform: "Google", status: "Left", source: "api", rating: 5, text: "Crew was clean and the upstairs finally cools.", at: "Sep 28", author: "Alyssa Cho" },
      { id: "RV-cho-f", platform: "Facebook", status: "Left", source: "api", rating: 5, text: "Would use Cozy again. On time, and the attic looks finished.", at: "Sep 29", author: "Ben Cho" },
    ],
  };
}

function seedFiles() {
  const out: Record<string, AccountFile> = { "A-198": whitaker, "A-204": choFile() };
  for (const a of accounts) if (!out[a.id]) out[a.id] = blank(a.id);
  return out;
}

export let files: Record<string, AccountFile> = seedFiles();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function patch(accountId: string, next: AccountFile) {
  files = { ...files, [accountId]: next };
  emit();
}

export function useAccount(accountId: string) {
  useSyncExternalStore(subscribe, () => files, () => files);
  return files[accountId] ?? blank(accountId);
}

export function useAccountFiles() {
  return useSyncExternalStore(subscribe, () => files, () => files);
}

export function useAccountRows() {
  useAccountFiles();
  return [...accounts, ...extraAccounts];
}

export function openAccountForJob(input: { leadId: string; name: string; city: string; owner: string; amount: number; existingId?: string }) {
  const found =
    [...accounts, ...extraAccounts].find((a) => a.id === input.existingId) ??
    [...accounts, ...extraAccounts].find((a) => a.name === input.name);
  if (found) return found;
  const row: Account = {
    id: `A-${320 + extraAccounts.length}`,
    name: input.name,
    type: "New",
    city: input.city,
    owner: input.owner,
    jobs: 1,
    lifetime: input.amount,
    last: "Today",
  };
  write_extraAccounts([...extraAccounts, row]);
  patch(row.id, {
    ...blank(row.id),
    accountId: row.id,
    leadId: input.leadId,
    name: input.name,
    city: input.city,
    owner: input.owner,
  });
  return row;
}

export function useAccountPhotos(accountId: string) {
  useSyncExternalStore(subscribe, () => photoRows, () => photoRows);
  return photoRows.filter((p) => p.personId === accountId);
}

export function defaultsFor(kind: VisitKind) {
  if (kind === "Service") return { fee: 189, cost: 75 };
  if (kind === "Warranty") return { fee: 0, cost: 180 };
  if (kind === "Go-back") return { fee: 0, cost: 120 };
  if (kind === "QC") return { fee: 0, cost: 90 };
  return { fee: 0, cost: 0 };
}

export function scheduleVisit(input: { accountId: string; kind: VisitKind; closer: string; day: number; hour: string; fee: number; cost: number; why?: string }) {
  const file = files[input.accountId];
  if (!file) return;
  const row: Visit = {
    id: `V-${20 + file.visits.length}`,
    accountId: input.accountId,
    kind: input.kind,
    day: `Sep ${input.day} ${input.hour}`,
    who: input.closer,
    fee: input.fee,
    cost: input.cost,
    status: "Booked",
    why: input.why?.trim() || input.kind,
  };
  patch(input.accountId, { ...file, visits: [row, ...file.visits] });
  putFromAppointment({
    leadId: file.leadId,
    name: file.name,
    kind: input.kind === "QC" ? "Service" : input.kind,
    day: input.day,
    time: input.hour,
    assignee: input.closer,
    setBy: input.closer,
    city: file.city,
  });
  addHistory(file.leadId, actingName(), `Booked ${input.kind.toLowerCase()} ${row.day}. ${row.why}`);
}

export function addIssue(accountId: string, title: string, detail: string) {
  const file = files[accountId];
  const name = title.trim();
  if (!file || !name) return;
  const ticket = createTicket({ personId: file.leadId, title: name, owner: file.owner, description: detail.trim() });
  const row: AccountIssue = { id: `IS-${file.issues.length + 2}`, title: name, detail: detail.trim(), status: "Open", at: "Today", ticketId: ticket?.id };
  patch(accountId, { ...file, issues: [row, ...file.issues] });
  addHistory(file.leadId, actingName(), `Issue opened: ${name}.`);
}

export function setIssueStatus(accountId: string, id: string, status: IssueStatus) {
  const file = files[accountId];
  if (!file) return;
  patch(accountId, { ...file, issues: file.issues.map((i) => (i.id === id ? { ...i, status } : i)) });
  addHistory(file.leadId, actingName(), `Issue ${status.toLowerCase()}.`);
}

export function setWarranty(accountId: string, warrantyStart: string, warrantyUntil: string) {
  const file = files[accountId];
  if (!file) return;
  patch(accountId, { ...file, warrantyStart: warrantyStart.trim(), warrantyUntil: warrantyUntil.trim() });
  addHistory(file.leadId, actingName(), `Warranty expires ${warrantyUntil.trim() || "cleared"}.`);
}
