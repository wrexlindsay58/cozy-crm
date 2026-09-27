import { patch, ensureAcceptance } from "./events-02";
import { addHistory } from "@/features/ops/store";
import { kindFromFile, putPhoto } from "@/features/photos/store";
import { actingName } from "@/features/staff/store";
import { isAccepted, type ChangeOrder, type MediaCat, type ScopeMedia } from "../types";
import { prepClear } from "../prep";

export function answerAcceptNote(jobId: string, id: string, answer: string) {
  const text = answer.trim();
  if (!text) return;
  patch(jobId, (j) => {
    const file = ensureAcceptance(j);
    addHistory(j.personId, actingName(), `Rep answered. ${text}`);
    return { ...j, acceptance: { ...file, notes: file.notes.map((n) => (n.id === id ? { ...n, answer: text } : n)) } };
  }, { nudge: false });
}

export function requestSurvey(jobId: string) {
  patch(jobId, (j) => {
    if (isAccepted(j)) return j;
    const file = ensureAcceptance(j);
    addHistory(j.personId, actingName(), "Site survey requested before acceptance.");
    return { ...j, acceptance: { ...file, surveyAsked: true } };
  }, { nudge: false });
}

export function acceptJob(jobId: string) {
  patch(jobId, (j) => {
    if (isAccepted(j)) return j;
    const file = ensureAcceptance(j);
    addHistory(j.personId, actingName(), "Job accepted.");
    return { ...j, acceptance: { ...file, by: actingName(), at: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) } };
  }, { nudge: false });
}

export function setPrep(jobId: string, day: string, itemId: string, row: { scheduled?: boolean; confirmed?: boolean }) {
  patch(jobId, (j) => {
    if (!isAccepted(j) || !day) return j;
    const cur = j.prep?.[day]?.[itemId] ?? {};
    const nextMark = { ...cur, ...row, by: actingName() };
    if (row.scheduled === false) nextMark.confirmed = false;
    addHistory(j.personId, actingName(), `Prep ${itemId} on ${day}. ${nextMark.confirmed ? "Confirmed" : nextMark.scheduled ? "Scheduled" : "Open"}.`);
    const next = { ...j, prep: { ...j.prep, [day]: { ...j.prep?.[day], [itemId]: nextMark } } };
    if (!prepClear(next, day)) {
      next.events = next.events.map((e) => (e.day === day && e.status === "Dispatched" ? { ...e, status: "Set" as const } : e));
    }
    return next;
  }, { nudge: false });
}

export function toggleInventory(jobId: string, assignId: string, lineId: string) {
  patch(jobId, (j) => {
    const assign = j.assignments.find((a) => a.id === assignId);
    if (!assign || assign.inventory?.signedAt || !isAccepted(j) || !prepClear(j, assign.day)) return j;
    addHistory(j.personId, actingName(), `Inventory check on ${assign.crew}.`);
    return {
      ...j,
      assignments: j.assignments.map((a) => {
        if (a.id !== assignId) return a;
        const checked = new Set(a.inventory?.checked ?? []);
        const checkedBy = { ...(a.inventory?.checkedBy ?? {}) };
        if (checked.has(lineId)) {
          checked.delete(lineId);
          delete checkedBy[lineId];
        } else {
          checked.add(lineId);
          checkedBy[lineId] = actingName();
        }
        return { ...a, inventory: { ...a.inventory, checked: [...checked], checkedBy } };
      }),
    };
  }, { nudge: false });
}

export function signInventory(jobId: string, assignId: string, signature: string) {
  if (!signature) return;
  patch(jobId, (j) => {
    const assign = j.assignments.find((a) => a.id === assignId);
    if (!assign || !isAccepted(j) || !prepClear(j, assign.day)) return j;
    addHistory(j.personId, actingName(), `Inventory signed for ${assign.crew || "crew"}.`);
    return {
      ...j,
      assignments: j.assignments.map((a) =>
        a.id === assignId
          ? { ...a, inventory: { checked: a.inventory?.checked ?? [], checkedBy: a.inventory?.checkedBy, signedBy: actingName(), signedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), signature } }
          : a,
      ),
    };
  }, { nudge: false });
}

export function addScopeMedia(jobId: string, scopeId: string, file: File, cat: MediaCat, extra?: { caption?: string; purpose?: string; name?: string }) {
  const url = URL.createObjectURL(file);
  const kind: ScopeMedia["kind"] = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "photo" : "doc";
  const row: ScopeMedia = { id: `M-${Date.now()}`, cat, name: extra?.name?.trim() || file.name, url, kind, caption: extra?.caption, purpose: extra?.purpose };
  patch(jobId, (j) => {
    const line = j.scope.find((s) => s.id === scopeId);
    addHistory(j.personId, actingName(), `Media ${row.name} on ${line?.label ?? "job"}${row.caption ? `. ${row.caption}` : ""}.`);
    putPhoto(j.personId, { id: row.id, personId: j.personId, caption: `${row.purpose || cat} · ${row.caption || row.name}`, tone: "info", src: url, kind: kindFromFile(file), name: row.name, pipeline: "Job", by: actingName() });
    return { ...j, scope: j.scope.map((s) => (s.id === scopeId ? { ...s, media: [row, ...s.media] } : s)) };
  }, { nudge: false });
}

export function addChangeOrder(jobId: string, why: string, amount: number, cost: number, lane: ChangeOrder["lane"] = "install") {
  if (!why.trim() || amount <= 0) return;
  patch(jobId, (j) => {
    if (!isAccepted(j)) return j;
    const row: ChangeOrder = { id: `CO-${j.changeOrders.length + 1}`, why: why.trim(), amount, cost, status: "Approved", lane, signed: false };
    addHistory(j.personId, actingName(), `${lane === "finance" ? "GoodLeap" : "Install"} change order ${why.trim()} +$${amount}.`);
    return {
      ...j,
      changeOrders: [row, ...j.changeOrders],
      extras: lane === "install" ? j.extras + cost : j.extras,
      installRev: lane === "install" ? j.installRev + 1 : j.installRev,
      financeRev: lane === "finance" ? j.financeRev + 1 : j.financeRev,
      scope:
        lane === "install"
          ? [...j.scope, { id: `SC-${Date.now()}`, label: why.trim(), kind: "adder", categoryId: j.scope[0]?.categoryId ?? "attic", amount, qty: 1, notes: "", quotedCost: cost, estHours: 2, media: [], owner: "", promiseDone: false, bom: [] }]
          : j.scope,
    };
  });
}
