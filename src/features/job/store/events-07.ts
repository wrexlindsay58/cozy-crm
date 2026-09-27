import { patch } from "./events-02";
import { jobs } from "./core";
import { addEvent } from "./crew-02";
import { addHistory, createAction, setWorkStatus } from "@/features/ops/store";
import { kindFromFile, putPhoto } from "@/features/photos/store";
import { actingName } from "@/features/staff/store";
import { isAccepted, type JobFile, type MediaCat, type PurchaseOrder, type ScopeMedia } from "../types";

export function addSurveyMedia(jobId: string, surveyId: string, file: File, extra?: { caption?: string; purpose?: string; name?: string; cat?: MediaCat }) {
  const url = URL.createObjectURL(file);
  const kind: ScopeMedia["kind"] = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "photo" : "doc";
  const row: ScopeMedia = { id: `M-${Date.now()}`, cat: extra?.cat ?? "Other", name: extra?.name?.trim() || file.name, url, kind, caption: extra?.caption, purpose: extra?.purpose };
  patch(jobId, (j) => {
    addHistory(j.personId, j.pm, `Media ${row.name}${row.caption ? `. ${row.caption}` : ""}.`);
    putPhoto(j.personId, { id: row.id, personId: j.personId, caption: `${row.purpose || row.cat} · ${row.caption || row.name}`, tone: "info", src: url, kind: kindFromFile(file), name: row.name, pipeline: "Job", by: actingName() });
    if (j.scope.some((s) => s.id === surveyId)) {
      return { ...j, scope: j.scope.map((s) => (s.id === surveyId ? { ...s, media: [row, ...s.media] } : s)) };
    }
    return { ...j, surveys: (j.surveys ?? []).map((s) => (s.id === surveyId ? { ...s, media: [row, ...s.media] } : s)) };
  }, { nudge: false });
}

export function patchQcResult(jobId: string, key: string, result: "pass" | "fail") {
  const j = jobs[jobId];
  if (!j) return;
  const cur = j.testOut.results?.[key];
  if (cur === "fail" || cur === result) return;
  if (result === "fail") failQc(jobId, key);
  patch(jobId, (job) => {
    addHistory(job.personId, actingName(), `${qcLabel(job, key)} ${result}.`);
    return {
      ...job,
      testOut: {
        ...job.testOut,
        results: { ...job.testOut.results, [key]: result },
        by: { ...job.testOut.by, [key]: actingName() },
      },
    };
  }, { nudge: false });
}

export function qcLabel(j: JobFile, key: string) {
  if (key === "blower") return "Blower door";
  if (key === "duct") return "Duct tester";
  return j.scope.find((s) => s.id === key)?.label ?? "QC";
}

export function failQc(jobId: string, key: string) {
  const j = jobs[jobId];
  if (!j) return;
  if (j.testOut.fixes?.[key]?.ticketId) return;
  const label = qcLabel(j, key);
  const ticket = createAction({
    kind: "ticket",
    personId: j.personId,
    title: `QC fail · ${label}`,
    owner: j.pm,
    description: `${label} failed QC on ${j.jobId}. ${j.name}. Schedule the fix or mark corrected by QC.`,
    category: "QC",
    priority: "High",
  });
  const scopeId = j.scope.some((s) => s.id === key) ? key : j.scope[0]?.id ?? "";
  const eventId = addEvent(jobId, "Go-back", scopeId, "", "07:00", "15:00", j.crew, `QC fail · ${label}`);
  patch(jobId, (job) => ({
    ...job,
    testOut: {
      ...job.testOut,
      fixes: { ...job.testOut.fixes, [key]: { ticketId: ticket?.id, eventId, correctedByQc: false } },
    },
  }), { nudge: false });
}

export function setQcCorrected(jobId: string, key: string, on: boolean) {
  patch(jobId, (j) => {
    if (j.testOut.results?.[key] !== "fail") return j;
    const fix = j.testOut.fixes?.[key] ?? {};
    addHistory(j.personId, actingName(), on ? `${qcLabel(j, key)} failed and corrected on site.` : `${qcLabel(j, key)} still needs a fix.`);
    if (fix.ticketId) setWorkStatus("ticket", fix.ticketId, on ? "Complete" : "Open");
    return {
      ...j,
      events: j.events.map((e) => {
        if (e.id !== fix.eventId) return e;
        if (on) return { ...e, status: "Done" as const, why: `${(e.why ?? "QC fail").replace(/ · corrected by QC$/, "")} · corrected by QC` };
        return { ...e, status: "Set" as const, why: (e.why ?? "QC fail").replace(/ · corrected by QC$/, "") };
      }),
      testOut: { ...j.testOut, fixes: { ...j.testOut.fixes, [key]: { ...fix, correctedByQc: on } } },
    };
  }, { nudge: false });
}

export function patchQcFact(jobId: string, key: string, value: string) {
  patch(jobId, (j) => ({ ...j, testOut: { ...j.testOut, facts: { ...j.testOut.facts, [key]: value } } }), { nudge: false });
}

export function patchQcCheck(jobId: string, key: string, on: boolean) {
  patch(jobId, (j) => ({ ...j, testOut: { ...j.testOut, checks: { ...j.testOut.checks, [key]: on } } }), { nudge: false });
}

export function orderBom(jobId: string, scopeId: string) {
  patch(jobId, (j) => {
    if (!isAccepted(j)) return j;
    const sc = j.scope.find((s) => s.id === scopeId);
    if (!sc) return j;
    const amount = sc.bom.reduce((n, b) => n + b.estQty * b.unitCost, 0);
    const supplier = sc.bom[0]?.supplier || "Supplier";
    addHistory(j.personId, actingName(), `PO ${supplier} ${amount}.`);
    const po: PurchaseOrder = { id: `PO-${60 + j.pos.length}`, vendor: supplier, amount, status: "Sent", what: sc.label, scopeId, file: { name: `${supplier}.pdf`, url: "#" } };
    return {
      ...j,
      pos: [po, ...j.pos],
      scope: j.scope.map((s) => (s.id === scopeId ? { ...s, bom: s.bom.map((b) => ({ ...b, ordered: true })) } : s)),
    };
  });
}
