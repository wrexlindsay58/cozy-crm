import { useSyncExternalStore } from "react";
import { appointments as seedAppts } from "@/lib/crm-data";
import { addHrs, durationHrs, isoOn } from "../time";
import { CREW_RESOURCES, resourceIdFor, type Resource } from "../roster";
import { extraBook } from "../seed";
import { assignedIds, mapStatus, mapType, type BookEvent, type BookStatus } from "../types";

const ROSTER_SEED: Resource[] = [
  ...["Marco Velez", "Dana Ortiz", "Luis Haddad", "Priya Shah", "Cole Brennan", "Amber Quinn", "Nate Solis", "Wrex Lindsay", "Tasha Reed", "Evan Cole"].map((name) => ({
    id: name.split(" ")[0].toLowerCase(),
    name,
    kind: "closer" as const,
    office: "PHX" as const,
    role: "Closer",
  })),
  ...CREW_RESOURCES,
];

export function rid(name?: string) {
  return resourceIdFor(name ?? "", ROSTER_SEED);
}

export function officeFor(city: string): "PHX" | "DFW" {
  return /dallas|fort worth/i.test(city) ? "DFW" : "PHX";
}

function fromAppt(a: (typeof seedAppts)[number]): BookEvent {
  const type = mapType(a.kind);
  const start = isoOn(a.day, a.time);
  const hrs = durationHrs(a.duration);
  const resourceName = a.crew || a.closer;
  return {
    id: a.id,
    type,
    status: mapStatus(a.status),
    title: a.name.replace(/ install$/i, "").replace(/ proposal review$/i, ""),
    personId: a.leadId,
    jobId: a.leadId === "L-4788" ? "P-331" : "",
    href: a.leadId.startsWith("L-") ? `/leads/${a.leadId}` : `/projects/${a.leadId}`,
    resourceId: rid(resourceName),
    office: officeFor(a.city),
    start,
    end: addHrs(start, hrs),
    city: a.city,
    notes: a.notes ?? "",
    setBy: a.setBy ?? a.setter,
    scope: a.scope ?? a.product,
    leadSource: "",
    products: a.product ? [{ label: a.product, notes: a.notes ?? "", qty: 1 }] : [],
    internal: false,
    woSigned: type === "Install" && a.leadId === "L-4788" ? false : type !== "Install",
    hold: false,
    blank: false,
    crewId: a.crew ? rid(a.crew) : "",
    techId: "",
    assigneeId: rid(a.closer),
    links: [],
    source: "appointment",
    sourceId: a.id,
  };
}

export let events: BookEvent[] = [
  ...seedAppts.filter((a) => a.kind !== "Install" || a.leadId !== "L-4788").map(fromAppt),
  ...extraBook,
];

const listeners = new Set<() => void>();

export function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function snap() {
  return events;
}

export function useBook() {
  useSyncExternalStore(subscribe, snap, snap);
  return events;
}

export function bookEvents() {
  return events;
}

export function upsertBook(row: BookEvent) {
  const i = events.findIndex((e) => e.id === row.id || (e.source === row.source && e.sourceId && e.sourceId === row.sourceId));
  events = i >= 0 ? events.map((e, n) => (n === i ? { ...e, ...row, id: e.id } : e)) : [row, ...events];
  emit();
}

export function patchBook(id: string, row: Partial<BookEvent>) {
  events = events.map((e) => (e.id === id ? { ...e, ...row } : e));
  emit();
  return events.find((e) => e.id === id);
}

export function removeBook(id: string) {
  if (!events.some((e) => e.id === id)) return;
  events = events.filter((e) => e.id !== id);
  emit();
}

export function moveBook(id: string, start: string, end: string, resourceId: string) {
  const cur = events.find((e) => e.id === id);
  if (!cur) return;
  let status = cur.status;
  if (resourceId && status !== "Done" && status !== "No-run" && status !== "No-show") status = "Dispatched";
  if (!resourceId && status === "Dispatched") status = "Confirmed";
  return patchBook(id, resourceId ? { start, end, resourceId, status } : { start, end, resourceId: "", crewId: "", techId: "", assigneeId: "", status });
}

export function setBookStatus(id: string, status: BookStatus) {
  return patchBook(id, { status });
}

export function overlaps(a: BookEvent, b: BookEvent) {
  const share = assignedIds(a).some((id) => assignedIds(b).includes(id));
  if (a.id === b.id || !share) return false;
  return a.start < b.end && b.start < a.end;
}

export function loadHours(list: BookEvent[], resourceId: string, day: string) {
  return list.filter((e) => assignedIds(e).includes(resourceId) && e.start.slice(0, 10) === day).reduce((s, e) => {
    const hrs = (new Date(e.end).getTime() - new Date(e.start).getTime()) / 36e5;
    return s + Math.max(0, hrs);
  }, 0);
}

export function write_events(__v: any) { events = __v; }
