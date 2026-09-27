import { files } from "./core";
import { patchFile, techColumn } from "./events-03";
import { pretty } from "./events";
import { addHistory } from "@/features/ops/store";
import { actingName } from "@/features/staff/store";
import { createBook, patchBook } from "@/features/book/store";
import { addHrs } from "@/features/book/time";
import type { MemberVisit } from "../types";

export function mapVisit(id: string, visitId: string, fn: (visit: MemberVisit) => MemberVisit) {
  const file = files.find((m) => m.id === id);
  if (!file) return;
  patchFile(id, (m) => ({ ...m, visits: (m.visits ?? []).map((visit) => (visit.id === visitId ? fn(visit) : visit)) }));
}

export function addVisit(id: string, tech: string) {
  const file = files.find((m) => m.id === id);
  if (!file || (file.status !== "Active" && file.status !== "Continued")) return;
  const visit: MemberVisit = {
    id: `V-${Date.now()}`,
    on: new Date().toISOString().slice(0, 10),
    tech,
    did: "",
    checks: (file.included ?? []).map((label, index) => ({ id: `VC-${Date.now()}-${index}`, label, done: false })),
    parts: [],
    customerNote: "",
    serviceNote: "",
    failing: "",
    repairs: [],
    status: "Open",
  };
  patchFile(id, (m) => ({ ...m, visits: [visit, ...(m.visits ?? [])] }));
  addHistory(file.personId, actingName(), `Opened a membership visit${tech ? ` for ${tech}` : ""}.`);
}

export function bookMembershipVisit(id: string, input: { on: string; time: string; tech: string }) {
  const file = files.find((m) => m.id === id);
  const tech = input.tech.trim();
  if (!file || (file.status !== "Active" && file.status !== "Continued")) return "closed";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.on) || !/^\d{2}:\d{2}$/.test(input.time) || !tech) return "missing";
  const start = `${input.on}T${input.time}`;
  const visitId = `V-${Date.now()}`;
  const resourceId = tech.toLowerCase().split(" ")[0] ?? "";
  const booked = createBook({
    type: "Membership",
    title: file.name.replace(/^The\s+/i, ""),
    personId: file.personId,
    href: `/memberships/${file.id}`,
    resourceId,
    techId: resourceId,
    start,
    end: addHrs(start, 1),
    city: file.city,
    notes: file.included.length ? file.included.join(", ") : "Membership visit",
    setBy: actingName(),
    scope: file.planName,
    office: /dallas|fort worth/i.test(file.office + file.city) ? "DFW" : "PHX",
    status: "Confirmed",
    source: "visit",
    sourceId: visitId,
  });
  const visit: MemberVisit = {
    id: visitId,
    on: input.on,
    time: input.time,
    tech,
    did: "",
    checks: (file.included ?? []).map((label, index) => ({ id: `VC-${Date.now()}-${index}`, label, done: false })),
    parts: [],
    customerNote: "",
    serviceNote: "",
    failing: "",
    repairs: [],
    status: "Set",
    bookId: booked.id,
  };
  patchFile(id, (m) => ({ ...m, visits: [visit, ...(m.visits ?? [])] }));
  addHistory(file.personId, actingName(), `Booked a membership visit for ${tech} on ${input.on} at ${input.time}.`);
  return "ok";
}

export function visitEditable(visit?: MemberVisit) {
  return visit?.status === "Set" || visit?.status === "Open";
}

export function syncVisitBook(visit: MemberVisit, done: boolean) {
  if (!visit.bookId || !/^\d{4}-\d{2}-\d{2}$/.test(visit.on) || !/^\d{2}:\d{2}$/.test(visit.time ?? "")) return;
  const start = `${visit.on}T${visit.time}`;
  const resourceId = techColumn(visit.tech);
  patchBook(visit.bookId, { start, end: addHrs(start, 1), resourceId, techId: resourceId, status: done ? "Done" : "Confirmed" });
}

export function postVisit(id: string, visitId: string) {
  const file = files.find((m) => m.id === id);
  const visit = file?.visits?.find((row) => row.id === visitId);
  if (!file || !visit || !visitEditable(visit)) return "closed";
  if (!visit.on) return "date";
  if (!visit.tech.trim()) return "tech";
  const at = pretty(new Date());
  const by = actingName();
  mapVisit(id, visitId, (row) => ({ ...row, status: "Done", postedAt: at, postedBy: by }));
  if (visit.bookId) patchBook(visit.bookId, { status: "Done" });
  addHistory(file.personId, by, `Posted the membership visit for ${visit.tech} on ${visit.on}.`);
  return "ok";
}
