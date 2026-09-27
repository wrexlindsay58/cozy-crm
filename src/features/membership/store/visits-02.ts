import { files } from "./core";
import { visitEditable, mapVisit, syncVisitBook } from "./visits";
import { pretty } from "./events";
import { patchFile } from "./events-03";
import { addHistory } from "@/features/ops/store";
import { actingName, canOverrideFee } from "@/features/staff/store";
import { removeBook } from "@/features/book/store";
import type { MemberVisit, VisitPart, VisitRepair } from "../types";

export function amendVisit(
  id: string,
  visitId: string,
  why: string,
  patch: Partial<Pick<MemberVisit, "on" | "time" | "tech" | "did" | "customerNote" | "serviceNote" | "failing" | "checks" | "parts" | "repairs">>,
) {
  const file = files.find((m) => m.id === id);
  const visit = file?.visits?.find((row) => row.id === visitId);
  const reason = why.trim();
  if (!file || !visit || visitEditable(visit)) return "open";
  if (!canOverrideFee()) return "admin";
  if (!reason) return "why";
  const on = (patch.on ?? visit.on).trim();
  const tech = (patch.tech ?? visit.tech).trim();
  if (!on || !tech) return "missing";
  const repairs = (patch.repairs ?? visit.repairs).map((repair) => {
    const prev = visit.repairs.find((row) => row.id === repair.id);
    return prev?.status === "Paid" ? prev : repair;
  });
  const next: MemberVisit = {
    ...visit,
    ...patch,
    on,
    tech,
    repairs,
    status: "Done",
    edits: [...(visit.edits ?? []), { at: pretty(new Date()), by: actingName(), why: reason }],
  };
  mapVisit(id, visitId, () => next);
  if (next.bookId) syncVisitBook(next, true);
  addHistory(file.personId, actingName(), `Changed the posted visit on ${on}. ${reason}`);
  return "ok";
}

export function patchVisit(id: string, visitId: string, patch: Partial<Pick<MemberVisit, "on" | "tech" | "time" | "did" | "customerNote" | "serviceNote" | "failing">>) {
  const file = files.find((m) => m.id === id);
  const visit = file?.visits?.find((row) => row.id === visitId);
  if (!visit || !visitEditable(visit)) return;
  const next = { ...visit, ...patch };
  mapVisit(id, visitId, (row) => ({ ...row, ...patch }));
  if (visit.bookId && (patch.on !== undefined || patch.tech !== undefined || patch.time !== undefined)) syncVisitBook(next, false);
}

export function patchVisitCheck(id: string, visitId: string, checkId: string, done: boolean) {
  const visit = files.find((m) => m.id === id)?.visits?.find((row) => row.id === visitId);
  if (!visitEditable(visit)) return;
  mapVisit(id, visitId, (row) => ({
    ...row,
    checks: (row.checks ?? []).map((check) => (check.id === checkId ? { ...check, done } : check)),
  }));
}

export function setRepairCovered(id: string, visitId: string, repairId: string, covered: boolean) {
  const visit = files.find((m) => m.id === id)?.visits?.find((row) => row.id === visitId);
  if (!visitEditable(visit)) return;
  mapVisit(id, visitId, (row) => ({
    ...row,
    repairs: row.repairs.map((repair) => (repair.id === repairId && repair.status === "Open" ? { ...repair, covered } : repair)),
  }));
}

export function dropVisit(id: string, visitId: string) {
  const file = files.find((m) => m.id === id);
  const visit = file?.visits?.find((row) => row.id === visitId);
  if (!file || !visit || !visitEditable(visit) || visit.repairs.some((repair) => repair.status === "Paid")) return;
  if (visit.bookId) removeBook(visit.bookId);
  patchFile(id, (m) => ({ ...m, visits: (m.visits ?? []).filter((row) => row.id !== visitId) }));
  addHistory(file.personId, actingName(), "Removed a membership visit.");
}

export function addVisitPart(id: string, visitId: string) {
  const visit = files.find((m) => m.id === id)?.visits?.find((row) => row.id === visitId);
  if (!visitEditable(visit)) return;
  const part: VisitPart = { id: `VP-${Date.now()}`, name: "", qty: 1 };
  mapVisit(id, visitId, (row) => ({ ...row, parts: [...row.parts, part] }));
}

export function patchVisitPart(id: string, visitId: string, partId: string, patch: Partial<Pick<VisitPart, "name" | "qty">>) {
  const visit = files.find((m) => m.id === id)?.visits?.find((row) => row.id === visitId);
  if (!visitEditable(visit)) return;
  mapVisit(id, visitId, (row) => ({
    ...row,
    parts: row.parts.map((part) => (part.id === partId ? { ...part, ...patch } : part)),
  }));
}

export function dropVisitPart(id: string, visitId: string, partId: string) {
  const visit = files.find((m) => m.id === id)?.visits?.find((row) => row.id === visitId);
  if (!visitEditable(visit)) return;
  mapVisit(id, visitId, (row) => ({ ...row, parts: row.parts.filter((part) => part.id !== partId) }));
}

export function addVisitRepair(id: string, visitId: string) {
  const visit = files.find((m) => m.id === id)?.visits?.find((row) => row.id === visitId);
  if (!visitEditable(visit)) return;
  const repair: VisitRepair = { id: `VR-${Date.now()}`, name: "", amount: 0, status: "Open" };
  mapVisit(id, visitId, (row) => ({ ...row, repairs: [...row.repairs, repair] }));
}

export function patchVisitRepair(id: string, visitId: string, repairId: string, patch: Partial<Pick<VisitRepair, "name" | "amount">>) {
  const visit = files.find((m) => m.id === id)?.visits?.find((row) => row.id === visitId);
  if (!visitEditable(visit)) return;
  mapVisit(id, visitId, (row) => ({
    ...row,
    repairs: row.repairs.map((repair) => (repair.id === repairId && repair.status === "Open" ? { ...repair, ...patch } : repair)),
  }));
}

export function dropVisitRepair(id: string, visitId: string, repairId: string) {
  const visit = files.find((m) => m.id === id)?.visits?.find((row) => row.id === visitId);
  if (!visitEditable(visit)) return;
  mapVisit(id, visitId, (row) => ({
    ...row,
    repairs: row.repairs.filter((repair) => repair.id !== repairId || repair.status === "Paid"),
  }));
}
