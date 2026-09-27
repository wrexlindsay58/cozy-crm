import { patch } from "./events-02";
import { assignedCrews } from "./seed";
import { addHistory } from "@/features/ops/store";
import { membersOf, actingName } from "@/features/staff/store";
import { isAccepted, type FieldIssue, type JobFile, type PermitFile, type RebateFile, type TestOut } from "../types";

export function signCo(jobId: string, id: string) {
  patch(jobId, (j) => ({
    ...j,
    changeOrders: j.changeOrders.map((c) => (c.id === id ? { ...c, signed: true, signedAt: "Now", status: "Approved" } : c)),
  }));
}

export function signFinanceCo(jobId: string) {
  patch(jobId, (j) => ({ ...j, financeRev: j.installRev }), { nudge: false });
}

export function sendCompletionCert(jobId: string) {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, "Completion cert sent to GoodLeap.");
    return { ...j, loan: { ...j.loan, status: j.loan.status === "NTP" || j.loan.status === "Received" ? "Complete" : j.loan.status, notes: [j.loan.notes, "Completion cert sent."].filter(Boolean).join(" ") } };
  }, { nudge: false });
}

export function receivePoAmount(jobId: string, poId: string, amount: number, who: string) {
  patch(jobId, (j) => {
    const po = j.pos.find((p) => p.id === poId);
    const got = Math.min(po?.amount ?? amount, (po?.receivedAmount ?? 0) + amount);
    const done = Boolean(po && got >= po.amount);
    addHistory(j.personId, who || j.pm, done ? `PO ${poId} received.` : `PO ${poId} received short.`);
    return {
      ...j,
      pos: j.pos.map((p) => (p.id === poId ? { ...p, receivedAmount: got, status: done ? "Received" : "Partial" } : p)),
    };
  });
}

export function toggleCheck(jobId: string, id: string) {
  patch(jobId, (j) => ({ ...j, checks: j.checks.map((c) => (c.id === id ? { ...c, on: !c.on } : c)) }));
}

export function handsOnJob(j: JobFile) {
  const crews = assignedCrews(j);
  const names = crews.length ? crews.flatMap((c) => membersOf(c)) : [];
  return [...new Set(names.filter(Boolean))];
}

export function addFieldIssue(jobId: string, type: FieldIssue["type"], note: string) {
  const text = note.trim();
  if (!text) return;
  patch(jobId, (j) => {
    if (!isAccepted(j)) return j;
    const row: FieldIssue = { id: `IS-${Date.now()}`, type, note: text, by: actingName(), at: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
    addHistory(j.personId, actingName(), `${type}. ${text}`);
    return { ...j, issues: [row, ...(j.issues ?? [])] };
  }, { nudge: false });
}

export function setAccess(jobId: string, access: string) {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, "Access notes updated.");
    return { ...j, access };
  }, { nudge: false });
}

export function patchPermit(jobId: string, row: Partial<PermitFile>) {
  patch(jobId, (j) => ({ ...j, permit: { ...j.permit, ...row } }));
}

export function patchRebate(jobId: string, row: Partial<RebateFile>) {
  patch(jobId, (j) => ({ ...j, rebate: { ...j.rebate, ...row } }), { nudge: false });
}

export function patchTest(jobId: string, row: Partial<TestOut>) {
  patch(jobId, (j) => ({ ...j, testOut: { ...j.testOut, ...row } }));
}

export function togglePre(jobId: string, id: string) {
  patch(jobId, (j) => {
    if (!isAccepted(j)) return j;
    const items = j.preCheck.items.map((i) => (i.id === id ? { ...i, on: !i.on, by: !i.on ? actingName() : undefined } : i));
    const row = items.find((i) => i.id === id);
    addHistory(j.personId, actingName(), `Pre-install ${row?.label ?? id} ${row?.on ? "checked" : "cleared"}.`);
    return { ...j, preCheck: { ...j.preCheck, items } };
  }, { nudge: false });
}

export function togglePost(jobId: string, id: string) {
  patch(jobId, (j) => {
    if (!isAccepted(j)) return j;
    const items = j.postCheck.items.map((i) => (i.id === id ? { ...i, on: !i.on, by: !i.on ? actingName() : undefined } : i));
    const row = items.find((i) => i.id === id);
    addHistory(j.personId, actingName(), `Post-install ${row?.label ?? id} ${row?.on ? "checked" : "cleared"}.`);
    return { ...j, postCheck: { ...j.postCheck, items } };
  }, { nudge: false });
}

export function setCheckCallout(jobId: string, which: "pre" | "post", id: string, callout: string) {
  patch(jobId, (j) => {
    if (!isAccepted(j)) return j;
    const key = which === "pre" ? "preCheck" : "postCheck";
    const pack = j[key];
    const items = pack.items.map((i) => (i.id === id ? { ...i, callout } : i));
    const row = items.find((i) => i.id === id);
    addHistory(j.personId, actingName(), `${which === "pre" ? "Pre" : "Post"}-install call-out · ${row?.label ?? id}: ${callout.trim() || "cleared"}.`);
    return { ...j, [key]: { ...pack, items } };
  }, { nudge: false });
}

export function signPre(jobId: string, input: { name: string; signature: string; relation?: string }) {
  const name = input.name.trim();
  if (name.length < 3 || !input.signature.startsWith("data:image")) return;
  patch(jobId, (j) => {
    if (!isAccepted(j)) return j;
    addHistory(j.personId, actingName(), `Pre-install signed in person by ${name}${input.relation ? ` (${input.relation})` : ""}. Collected by ${actingName()}.`);
    return { ...j, preCheck: { ...j.preCheck, signedBy: name, collectedBy: actingName(), signedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), signature: input.signature, relation: input.relation } };
  }, { nudge: false });
}
