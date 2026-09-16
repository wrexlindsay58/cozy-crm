import { useSyncExternalStore } from "react";
import { appointments as seedAppts } from "@/lib/crm-data";
import { addHrs, durationHrs, isoOn } from "./time";
import { CREW_RESOURCES, resourceIdFor, type Resource } from "./roster";
import { extraBook } from "./seed";
import { assignedIds, familyOf, mapStatus, mapType, type BookEvent, type BookStatus, type BookType } from "./types";

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

function rid(name?: string) {
  return resourceIdFor(name ?? "", ROSTER_SEED);
}

function officeFor(city: string): "PHX" | "DFW" {
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

let events: BookEvent[] = [
  ...seedAppts.filter((a) => a.kind !== "Install" || a.leadId !== "L-4788").map(fromAppt),
  ...extraBook,
];

const listeners = new Set<() => void>();
function emit() {
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
export function moveBook(id: string, start: string, end: string, resourceId: string) {
  return patchBook(id, { start, end, resourceId });
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
export function findSlot(opts: { resourceId: string; hrs: number; from: string; hours: number[] }) {
  const startDay = new Date(opts.from);
  for (let d = 0; d < 14; d += 1) {
    const day = new Date(startDay);
    day.setDate(day.getDate() + d);
    const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    const mine = events.filter((e) => assignedIds(e).includes(opts.resourceId) && e.start.slice(0, 10) === key);
    for (const h of opts.hours) {
      const start = `${key}T${String(Math.floor(h)).padStart(2, "0")}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;
      const end = addHrs(start, opts.hrs);
      const probe: BookEvent = { id: "tmp", resourceId: opts.resourceId, start, end } as BookEvent;
      if (!mine.some((e) => overlaps(probe, e))) return { start, end };
    }
  }
  return null;
}
export function createBook(input: {
  type: BookType;
  title: string;
  personId?: string;
  href?: string;
  resourceId: string;
  crewId?: string;
  techId?: string;
  assigneeId?: string;
  start: string;
  end: string;
  city?: string;
  notes?: string;
  setBy: string;
  internal?: boolean;
  office?: "PHX" | "DFW";
  blank?: boolean;
  links?: BookEvent["links"];
  status?: BookStatus;
  leadSource?: string;
  products?: BookEvent["products"];
  scope?: string;
  jobId?: string;
}) {
  const crewId = input.crewId ?? "";
  const techId = input.techId ?? "";
  const assigneeId = input.assigneeId ?? "";
  const resourceId = input.resourceId || crewId || techId || assigneeId;
  const row: BookEvent = {
    id: `BK-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: input.type,
    status: input.status ?? "Confirmed",
    title: input.blank ? input.title.trim() || "Open slot" : input.title.trim() || input.type,
    personId: input.blank ? "" : input.personId ?? "",
    jobId: input.jobId ?? "",
    href: input.blank ? "" : input.href ?? (input.personId ? `/leads/${input.personId}` : ""),
    resourceId,
    crewId,
    techId,
    assigneeId,
    office: input.office ?? "PHX",
    start: input.start,
    end: input.end,
    city: input.city ?? "",
    notes: input.notes ?? "",
    setBy: input.setBy,
    scope: input.scope ?? "",
    leadSource: input.leadSource ?? "",
    products: input.products ?? [],
    internal: Boolean(input.internal) || Boolean(input.blank) || familyOf(input.type) === "shop",
    woSigned: familyOf(input.type) !== "production",
    hold: false,
    blank: Boolean(input.blank),
    links: input.links ?? [],
    source: input.personId && !input.blank ? "appointment" : "shop",
    sourceId: "",
  };
  events = [row, ...events];
  emit();
  return row;
}

export function putFromAppointment(input: {
  id?: string;
  leadId: string;
  name: string;
  kind: string;
  day: number;
  time: string;
  assignee: string;
  setBy: string;
  notes?: string;
  crew?: string;
  duration?: string;
  scope?: string;
  city?: string;
}) {
  const start = isoOn(input.day, input.time);
  upsertBook({
    id: input.id ?? `BK-${Date.now()}`,
    type: mapType(input.kind),
    status: "Confirmed",
    title: input.name,
    personId: input.leadId,
    jobId: "",
    href: `/leads/${input.leadId}`,
    resourceId: rid(input.crew || input.assignee),
    crewId: input.crew ? rid(input.crew) : "",
    techId: "",
    assigneeId: rid(input.assignee),
    office: officeFor(input.city ?? ""),
    start,
    end: addHrs(start, durationHrs(input.duration)),
    city: input.city ?? "",
    notes: input.notes ?? "",
    setBy: input.setBy,
    scope: input.scope ?? "",
    leadSource: "",
    products: input.scope ? [{ label: input.scope, notes: input.notes ?? "", qty: 1 }] : [],
    internal: false,
    woSigned: mapType(input.kind) !== "Install",
    hold: false,
    blank: false,
    links: [],
    source: "appointment",
    sourceId: input.id ?? "",
  });
}

export function putFromJob(input: {
  jobId: string;
  personId: string;
  title: string;
  process: string;
  day: string;
  start: string;
  end: string;
  crew: string;
  sourceId: string;
  woSigned?: boolean;
  city?: string;
}) {
  if (!input.day) return;
  const start = `${input.day}T${input.start || "07:00"}`;
  const end = `${input.day}T${input.end || "15:00"}`;
  upsertBook({
    id: `BK-${input.jobId}-${input.sourceId}`,
    type: mapType(input.process),
    status: "Set",
    title: input.title,
    personId: input.personId,
    jobId: input.jobId,
    href: `/projects/${input.jobId}`,
    resourceId: rid(input.crew),
    crewId: rid(input.crew),
    techId: "",
    assigneeId: "",
    office: officeFor(input.city ?? ""),
    start,
    end,
    city: input.city ?? "",
    notes: "",
    setBy: input.crew,
    scope: input.process,
    leadSource: "",
    products: [{ label: input.process, notes: "", qty: 1 }],
    internal: false,
    woSigned: Boolean(input.woSigned),
    hold: false,
    blank: false,
    links: [],
    source: "job",
    sourceId: input.sourceId,
  });
}
