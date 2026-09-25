import { profileById } from "./profiles";
import type { JobFile } from "./types";

export type PrepLine = { id: string; label: string };

function blob(job: JobFile) {
  return [job.soldNotes, job.access, ...job.scope.map((s) => `${s.label} ${s.notes}`), ...job.holds.map((h) => `${h.kind} ${h.note}`)].join(" ");
}

export function prepLines(job: JobFile, day?: string): PrepLine[] {
  const text = blob(job);
  const has = (re: RegExp) => re.test(text);
  const lines: PrepLine[] = [];
  if (has(/dump/i)) lines.push({ id: "dumpster", label: "Dumpster delivered, placement allowed" });
  if (has(/\bhoa\b/i) || job.holds.some((h) => h.kind === "HOA")) lines.push({ id: "hoa", label: "HOA approval on file" });
  if (has(/dog|pet|cat/i)) lines.push({ id: "pets", label: "Dogs and other pets addressed" });
  if (has(/gate|lockbox|code|garage/i)) lines.push({ id: "gate", label: "Gate, lockbox, or garage code" });
  if (job.access.trim() || has(/attic entry|lockout|nobody home|access/i)) lines.push({ id: "access", label: "Someone home, or the attic and the equipment are accessible" });
  if (job.permit.number || job.scope.some((s) => profileById(s.categoryId)?.needsPermit)) lines.push({ id: "permit", label: "Permit posted on site" });
  if (has(/day-of|call ahead|call before|confirm contact/i)) lines.push({ id: "contact", label: "Day-of contact confirmed" });
  if (job.holds.some((h) => h.kind === "weather" || h.kind === "customer")) lines.push({ id: "hold", label: "Weather or customer hold cleared" });
  const subs = job.assignments.filter((a) => a.kind === "sub" && (!day || a.day === day));
  if (subs.length) lines.push({ id: "sub", label: "Sub material confirmed on site" });
  return lines;
}

export function prepDays(job: JobFile) {
  const days = new Set<string>();
  job.assignments.forEach((a) => {
    if (a.day) days.add(a.day);
  });
  job.events.forEach((e) => {
    if (e.day) days.add(e.day);
  });
  return [...days].sort();
}

export function prepClear(job: JobFile, day: string) {
  if (!day) return false;
  return prepLines(job, day).every((line) => {
    const mark = job.prep?.[day]?.[line.id];
    return Boolean(mark?.scheduled && mark.confirmed);
  });
}

/** A scheduled install day stays off the calendar until prep for that day is confirmed. */
export function rollsOn(job: JobFile | undefined, day: string) {
  if (!job || !day) return true;
  const scheduled = job.events.some((e) => e.day === day) || job.assignments.some((a) => a.day === day);
  if (!scheduled) return true;
  return prepClear(job, day);
}

export function prepDone(job: JobFile) {
  const days = prepDays(job);
  return days.length > 0 && days.every((day) => prepClear(job, day));
}
