import { patch } from "./events-02";
import { eventsFromAssign } from "./crew";
import { jobs } from "./core";
import { addHistory } from "@/features/ops/store";
import { actingName } from "@/features/staff/store";
import { putFromJob } from "@/features/book/store";
import { prepClear } from "../prep";
import type { JobEvent, WorkOrder } from "../types";

export function sendAssignWo(jobId: string, assignId: string) {
  patch(jobId, (j) => {
    const a = j.assignments.find((x) => x.id === assignId);
    if (!a) return j;
    const who = a.kind === "sub" ? a.company || a.crew : a.crew;
    const row: WorkOrder = {
      id: a.woId ?? `WO-${10 + j.workOrders.length}`,
      assignId: a.id,
      status: "Sent",
      day: a.day || j.window,
      crew: who,
      notes: a.scopes.map((id) => j.scope.find((s) => s.id === id)?.label ?? id).join(", "),
      file: { name: `${a.woId ?? "WO"}.pdf`, url: "#" },
    };
    addHistory(j.personId, j.pm, `Work order ${row.id} sent to ${who}.`);
    const workOrders = a.woId ? j.workOrders.map((w) => (w.id === a.woId ? { ...w, ...row } : w)) : [row, ...j.workOrders];
    const fresh = eventsFromAssign(j, a);
    const events = [...j.events.filter((e) => e.assignId !== a.id), ...fresh];
    const next = { ...j, workOrders, events, assignments: j.assignments.map((x) => (x.id === assignId ? { ...x, woId: row.id } : x)) };
    fresh.forEach((ev) =>
      putFromJob({
        jobId: j.jobId,
        personId: j.personId,
        title: `${j.name} · ${ev.process}`,
        process: ev.process,
        day: ev.day,
        start: ev.start,
        end: ev.end,
        crew: ev.crew,
        sourceId: ev.id,
        woSigned: false,
      }),
    );
    return next;
  });
}

export function ackWo(jobId: string, woId: string, who = actingName()) {
  patch(jobId, (j) => {
    addHistory(j.personId, who, `WO ${woId} acknowledged.`);
    return { ...j, workOrders: j.workOrders.map((w) => (w.id === woId ? { ...w, status: "Acked", ackedAt: "Now", ackedBy: who } : w)) };
  });
}

export function signWo(jobId: string, woId: string, who = actingName()) {
  patch(jobId, (j) => {
    addHistory(j.personId, who, `WO ${woId} signed.`);
    const assign = j.assignments.find((a) => a.woId === woId);
    j.events.filter((e) => e.assignId === assign?.id).forEach((ev) =>
      putFromJob({
        jobId: j.jobId,
        personId: j.personId,
        title: `${j.name} · ${ev.process}`,
        process: ev.process,
        day: ev.day,
        start: ev.start,
        end: ev.end,
        crew: ev.crew,
        sourceId: ev.id,
        woSigned: true,
      }),
    );
    return { ...j, workOrders: j.workOrders.map((w) => (w.id === woId ? { ...w, status: "Signed", signedAt: "Now", signedBy: who } : w)) };
  });
}

export function issueWo(jobId: string) {
  const j = jobs[jobId];
  if (j?.assignments[0]) sendAssignWo(jobId, j.assignments[0].id);
}

export function setEventStatus(jobId: string, id: string, status: JobEvent["status"]) {
  patch(jobId, (j) => {
    const event = j.events.find((e) => e.id === id);
    if (status === "Dispatched" && event && !prepClear(j, event.day)) return j;
    return { ...j, events: j.events.map((e) => (e.id === id ? { ...e, status } : e)) };
  });
}

export function addEvent(jobId: string, process: string, scopeId: string, day: string, start = "07:00", end = "15:00", crew?: string, why?: string) {
  const id = `EV-${Date.now()}`;
  patch(jobId, (j) => {
    const scope = j.scope.find((s) => s.id === scopeId);
    const who = crew || j.crew;
    const row: JobEvent = { id, scopeId, process, day: day.trim(), start, end, crew: who, why: why?.trim() || undefined, status: "Set" };
    addHistory(j.personId, j.pm, `${process} · ${scope?.label ?? ""} ${row.day || "needs a day"}${why ? ` · ${why}` : ""}.`);
    if (row.day) {
      putFromJob({
        jobId: j.jobId,
        personId: j.personId,
        title: `${j.name} · ${process}`,
        process,
        day: row.day,
        start: row.start,
        end: row.end,
        crew: row.crew,
        sourceId: row.id,
      });
    }
    return { ...j, events: [...j.events, row] };
  });
  return id;
}
