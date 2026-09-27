import { jobs, write_jobs, emit } from "./core";
import { syncPayInvoices } from "./seed";
import { addHistory } from "@/features/ops/store";
import { actingName } from "@/features/staff/store";
import { isAccepted, splitSoldNotes, inferStage, STAGES, type Acceptance, type Hold, type JobFile, type ScopeLine, type Stage } from "../types";

export function patch(jobId: string, fn: (j: JobFile) => JobFile, opts?: { nudge?: boolean }) {
  const cur = jobs[jobId];
  if (!cur) return;
  let next = syncPayInvoices(fn(cur));
  if (opts?.nudge !== false && next.stage !== "Closed") {
    const inferred = inferStage(next);
    if (STAGES.indexOf(inferred) > STAGES.indexOf(next.stage)) {
      addHistory(next.personId, next.pm, `Stage → ${inferred}.`);
      next = { ...next, stage: inferred };
    }
  }
  write_jobs({ ...jobs, [jobId]: next });
  emit();
}

export function setJobAccount(jobId: string, accountId: string) {
  patch(jobId, (j) => ({ ...j, accountId }), { nudge: false });
}

export function setStage(jobId: string, stage: Stage) {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, `Stage → ${stage}.`);
    return { ...j, stage };
  }, { nudge: false });
}

export function toggleHold(jobId: string, kind: Hold) {
  patch(jobId, (j) => {
    const on = j.holds.some((h) => h.kind === kind);
    addHistory(j.personId, j.pm, on ? `Hold cleared: ${kind}.` : `Hold set: ${kind}.`);
    return { ...j, holds: on ? j.holds.filter((h) => h.kind !== kind) : [...j.holds, { kind, note: "", at: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) }] };
  });
}

export function setHoldNote(jobId: string, kind: Hold, note: string) {
  patch(jobId, (j) => ({ ...j, holds: j.holds.map((h) => (h.kind === kind ? { ...h, note } : h)) }), { nudge: false });
}

export function patchScope(jobId: string, id: string, row: Partial<ScopeLine>) {
  patch(jobId, (j) => {
    const line = j.scope.find((s) => s.id === id);
    if (row.notes != null) addHistory(j.personId, j.pm, `Notes on ${line?.label ?? "scope"}: ${row.notes.trim() || "cleared"}.`);
    else if (row.qty != null) addHistory(j.personId, j.pm, `Qty ${line?.label ?? "scope"} → ${row.qty}.`);
    return { ...j, scope: j.scope.map((s) => (s.id === id ? { ...s, ...row } : s)) };
  }, { nudge: false });
}

export function setSoldNotes(jobId: string, soldNotes: string) {
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, "Sold notes updated.");
    return { ...j, soldNotes };
  }, { nudge: false });
}

export function ensureAcceptance(j: JobFile): Acceptance {
  return j.acceptance ?? { reviewed: [], notes: splitSoldNotes(j.soldNotes), discrepancies: [] };
}

export function syncAcceptance(jobId: string, rows: string[]) {
  patch(jobId, (j) => {
    const file = ensureAcceptance(j);
    if (file.rows?.join("|") === rows.join("|") && j.acceptance) return j;
    return { ...j, acceptance: { ...file, rows } };
  }, { nudge: false });
}

export function reviewLine(jobId: string, lineId: string) {
  patch(jobId, (j) => {
    if (isAccepted(j)) return j;
    const file = ensureAcceptance(j);
    if (file.reviewed.includes(lineId) || file.discrepancies.some((d) => d.lineId === lineId)) return j;
    addHistory(j.personId, actingName(), "Reviewed a sold line.");
    return { ...j, acceptance: { ...file, reviewed: [...file.reviewed, lineId] } };
  }, { nudge: false });
}

export function flagLine(jobId: string, lineId: string, what: string) {
  const text = what.trim();
  if (!text) return;
  patch(jobId, (j) => {
    if (isAccepted(j)) return j;
    const file = ensureAcceptance(j);
    addHistory(j.personId, actingName(), `Discrepancy. ${text}`);
    return { ...j, acceptance: { ...file, reviewed: file.reviewed.filter((id) => id !== lineId), discrepancies: [...file.discrepancies, { id: `D-${Date.now()}`, lineId, what: text, how: "open", note: "" }] } };
  }, { nudge: false });
}

export function resolveDiscrepancy(jobId: string, id: string, how: "clarified" | "as-is" | "co", note: string, amount = 0) {
  patch(jobId, (j) => {
    if (isAccepted(j)) return j;
    const file = ensureAcceptance(j);
    const disc = file.discrepancies.find((d) => d.id === id);
    if (!disc) return j;
    let coId = disc.coId;
    let changeOrders = j.changeOrders;
    if (how === "co" && !coId) {
      coId = `CO-${j.changeOrders.length + 1}`;
      changeOrders = [{ id: coId, why: note.trim() || disc.what, amount: amount || 0, cost: 0, status: "Draft", lane: "install", signed: false }, ...j.changeOrders];
    }
    addHistory(j.personId, actingName(), how === "co" ? "Discrepancy moved to a change order." : how === "as-is" ? "Discrepancy kept." : "Discrepancy clarified.");
    return { ...j, changeOrders, acceptance: { ...file, discrepancies: file.discrepancies.map((d) => (d.id === id ? { ...d, how, note: note.trim(), coId } : d)) } };
  }, { nudge: false });
}

export function setAcceptNote(jobId: string, id: string, row: Partial<Acceptance["notes"][number]>) {
  patch(jobId, (j) => {
    if (isAccepted(j)) return j;
    const file = ensureAcceptance(j);
    addHistory(j.personId, actingName(), row.state === "asked" ? `Asked the rep. ${row.question || ""}`.trim() : "Rep note cleared.");
    return { ...j, acceptance: { ...file, notes: file.notes.map((n) => (n.id === id ? { ...n, ...row } : n)) } };
  }, { nudge: false });
}
