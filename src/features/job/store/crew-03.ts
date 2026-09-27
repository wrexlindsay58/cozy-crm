import { patch } from "./events-02";
import { assignedCrews } from "./seed";
import { addHistory } from "@/features/ops/store";
import { actingName } from "@/features/staff/store";
import { putFromJob } from "@/features/book/store";
import { isAccepted, punchHours, type EquipRow, type JobEvent, type JobFile, type TimePunch } from "../types";

export function patchEvent(jobId: string, id: string, row: Partial<JobEvent>) {
  patch(jobId, (j) => {
    const cur = j.events.find((e) => e.id === id);
    const next = j.events.map((e) => (e.id === id ? { ...e, ...row } : e));
    if (cur && row.day && !cur.day) {
      const ev = next.find((e) => e.id === id);
      if (ev) {
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
        });
      }
    }
    return { ...j, events: next };
  });
}

export function removeEvent(jobId: string, id: string) {
  patch(jobId, (j) => ({ ...j, events: j.events.filter((e) => e.id !== id) }));
}

export function addPunch(jobId: string, item: string) {
  if (!item.trim()) return;
  patch(jobId, (j) => {
    if (!isAccepted(j)) return j;
    return { ...j, punch: [{ id: `PU-${Date.now()}`, item: item.trim(), owner: actingName(), status: "Open" }, ...j.punch] };
  });
}

export function togglePunch(jobId: string, id: string) {
  patch(jobId, (j) => {
    if (!isAccepted(j)) return j;
    return { ...j, punch: j.punch.map((p) => (p.id === id ? { ...p, status: p.status === "Open" ? "Done" : "Open" } : p)) };
  });
}

export function addEquip(jobId: string, name: string, eta: string) {
  if (!name.trim()) return;
  patch(jobId, (j) => ({
    ...j,
    equipment: [...j.equipment, { id: `EQ-${Date.now()}`, name: name.trim(), model: "", serial: "", ahri: "", eta: eta.trim() || "TBD", status: "Ordered", oldRecovered: false }],
  }));
}

export function setEquip(jobId: string, id: string, patchRow: Partial<EquipRow>) {
  patch(jobId, (j) => ({ ...j, equipment: j.equipment.map((e) => (e.id === id ? { ...e, ...patchRow } : e)) }));
}

export function crewsOnJob(j: JobFile) {
  const on = assignedCrews(j);
  return on.length ? on : [];
}

export function addTimePunch(jobId: string, who: string, day: string) {
  if (!who.trim() || !day.trim()) return;
  patch(jobId, (j) => {
    if (!isAccepted(j)) return j;
    if (j.punches.some((p) => p.who === who.trim() && p.day === day)) return j;
    addHistory(j.personId, actingName(), `Clock opened for ${who.trim()} on ${day}.`);
    const row: TimePunch = { id: `HR-${Date.now()}`, who: who.trim(), day, leftYard: "", onSite: "", complete: "", back: "" };
    return { ...j, punches: [row, ...j.punches] };
  });
}

export function patchPunchClock(jobId: string, id: string, row: Partial<TimePunch>) {
  patch(jobId, (j) => {
    if (!isAccepted(j)) return j;
    const prev = j.punches.find((p) => p.id === id);
    if (row.back && prev && !prev.back) addHistory(j.personId, actingName(), `${prev.who} back at the shop.`);
    const punches = j.punches.map((p) => (p.id === id ? { ...p, ...row } : p));
    const labor = punches.reduce((s, p) => s + Math.round(punchHours(p).total * 55), 0);
    return { ...j, punches, labor: labor || j.labor };
  });
}
