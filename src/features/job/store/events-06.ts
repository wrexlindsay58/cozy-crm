import { patch } from "./events-02";
import type { JobSurvey } from "../types";

export function addBom(jobId: string, scopeId: string, name: string, qty: number, unitCost: number, supplier = "", track?: "bulk" | "unit") {
  if (!name.trim() || qty <= 0) return;
  const kind = track ?? (unitCost >= 200 ? "unit" : "bulk");
  patch(jobId, (j) => ({
    ...j,
    scope: j.scope.map((s) =>
      s.id === scopeId
        ? {
            ...s,
            bom: [
              ...s.bom,
              {
                id: `B-${Date.now()}`,
                name: name.trim(),
                estQty: qty,
                usedQty: 0,
                unit: "ea",
                unitCost,
                supplier: supplier.trim(),
                ordered: false,
                received: false,
                ready: false,
                track: kind,
                orderQty: qty,
              },
            ],
          }
        : s,
    ),
  }));
}

export function attachPlanFile(jobId: string, scopeId: string, file: File) {
  const url = URL.createObjectURL(file);
  patch(jobId, (j) => ({
    ...j,
    scope: j.scope.map((s) =>
      s.id === scopeId
        ? {
            ...s,
            plan: { status: s.plan?.status ?? "Draft", approvedBy: s.plan?.approvedBy ?? "", file: { name: file.name, url } },
            media: [{ id: `M-${Date.now()}`, cat: "Design" as const, name: file.name, url, kind: file.type.startsWith("image/") ? ("photo" as const) : ("doc" as const) }, ...s.media],
          }
        : s,
    ),
  }));
}

export function setSurveyDone(jobId: string, scopeId: string, on: boolean) {
  patch(jobId, (j) => {
    if (j.scope.some((s) => s.id === scopeId)) return { ...j, scope: j.scope.map((s) => (s.id === scopeId ? { ...s, surveyDone: on } : s)) };
    return { ...j, surveys: (j.surveys ?? []).map((s) => (s.id === scopeId ? { ...s, surveyDone: on } : s)) };
  }, { nudge: false });
}

export function patchSurveyFact(jobId: string, scopeId: string, key: string, value: string) {
  patch(jobId, (j) => {
    if (j.scope.some((s) => s.id === scopeId)) {
      return { ...j, scope: j.scope.map((s) => (s.id === scopeId ? { ...s, surveyFacts: { ...s.surveyFacts, [key]: value } } : s)) };
    }
    return { ...j, surveys: (j.surveys ?? []).map((s) => (s.id === scopeId ? { ...s, surveyFacts: { ...s.surveyFacts, [key]: value } } : s)) };
  }, { nudge: false });
}

export function addSurveyRoom(jobId: string, scopeId: string) {
  const room = { id: `R-${Date.now()}`, name: "", area: "", registers: "" };
  patch(jobId, (j) => {
    if (j.scope.some((s) => s.id === scopeId)) {
      return { ...j, scope: j.scope.map((s) => (s.id === scopeId ? { ...s, surveyRooms: [...(s.surveyRooms ?? []), room] } : s)) };
    }
    return { ...j, surveys: (j.surveys ?? []).map((s) => (s.id === scopeId ? { ...s, surveyRooms: [...(s.surveyRooms ?? []), room] } : s)) };
  }, { nudge: false });
}

export function patchSurveyRoom(jobId: string, scopeId: string, roomId: string, row: Partial<import("../types").SurveyRoom>) {
  patch(jobId, (j) => {
    if (j.scope.some((s) => s.id === scopeId)) {
      return { ...j, scope: j.scope.map((s) => (s.id === scopeId ? { ...s, surveyRooms: (s.surveyRooms ?? []).map((r) => (r.id === roomId ? { ...r, ...row } : r)) } : s)) };
    }
    return { ...j, surveys: (j.surveys ?? []).map((s) => (s.id === scopeId ? { ...s, surveyRooms: (s.surveyRooms ?? []).map((r) => (r.id === roomId ? { ...r, ...row } : r)) } : s)) };
  }, { nudge: false });
}

export function removeJobSurvey(jobId: string, id: string) {
  patch(jobId, (j) => ({ ...j, surveys: (j.surveys ?? []).filter((s) => s.id !== id) }), { nudge: false });
}

export function skipSurvey(jobId: string, scopeId: string, why: string) {
  const reason = why.trim();
  if (!reason) return;
  patch(jobId, (j) => ({
    ...j,
    scope: j.scope.map((s) => (s.id === scopeId ? { ...s, surveySkip: reason, surveyDone: true } : s)),
  }), { nudge: false });
}

export function patchJobSurvey(jobId: string, id: string, row: Partial<JobSurvey>) {
  patch(jobId, (j) => ({
    ...j,
    surveys: (j.surveys ?? []).map((s) => (s.id === id ? { ...s, ...row } : s)),
  }), { nudge: false });
}

export function addJobSurvey(jobId: string, kind: import("../types").SurveyKind = "other", attachId?: string) {
  const label = { hvac: "HVAC", ducts: "Ducts", attic: "Attic", windows: "Windows", other: "Site survey" }[kind];
  patch(jobId, (j) => {
    if (attachId && j.scope.some((s) => s.id === attachId)) {
      return { ...j, scope: j.scope.map((s) => (s.id === attachId ? { ...s, surveyOn: true } : s)) };
    }
    const row: JobSurvey = { id: `SV-${Date.now()}`, kind, label, surveyDone: false, surveyFacts: {}, surveyRooms: kind === "ducts" ? [{ id: `R-${Date.now()}`, name: "", area: "", registers: "" }] : [], media: [] };
    return { ...j, surveys: [...(j.surveys ?? []), row] };
  });
}
