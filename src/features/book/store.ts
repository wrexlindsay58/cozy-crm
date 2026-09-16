import { useSyncExternalStore } from "react";
import { appointments as seedAppts } from "@/lib/crm-data";
import { addHrs, durationHrs, isoOn } from "./time";
import { CREW_RESOURCES, resourceIdFor, type Resource } from "./roster";
import { familyOf, mapStatus, mapType, type BookEvent, type BookStatus, type BookType } from "./types";

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
    internal: false,
    woSigned: type === "Install" && a.leadId === "L-4788" ? false : type !== "Install",
    hold: false,
    source: "appointment",
    sourceId: a.id,
  };
}

const choDays: BookEvent[] = [
  {
    id: "BK-CHO-1",
    type: "Install",
    status: "Set",
    title: "Cho · Attic blow",
    personId: "L-4788",
    jobId: "P-331",
    href: "/projects/P-331",
    resourceId: "crew-tasha",
    office: "PHX",
    start: "2026-09-22T07:00",
    end: "2026-09-22T15:00",
    city: "Scottsdale",
    notes: "Hatch in the hall.",
    setBy: "Tasha Reed",
    scope: "Attic R-49",
    internal: false,
    woSigned: false,
    hold: false,
    source: "job",
    sourceId: "EV-1",
  },
  {
    id: "BK-CHO-2",
    type: "Install",
    status: "Set",
    title: "Cho · Ducts",
    personId: "L-4788",
    jobId: "P-331",
    href: "/projects/P-331",
    resourceId: "crew-tasha",
    office: "PHX",
    start: "2026-09-22T07:00",
    end: "2026-09-22T15:00",
    city: "Scottsdale",
    notes: "",
    setBy: "Tasha Reed",
    scope: "Ducts",
    internal: false,
    woSigned: false,
    hold: false,
    source: "job",
    sourceId: "EV-2",
  },
  {
    id: "BK-SHOP",
    type: "Office",
    status: "Confirmed",
    title: "Dumpster — Cho HOA",
    personId: "",
    jobId: "P-331",
    href: "/projects/P-331",
    resourceId: "priya",
    office: "PHX",
    start: "2026-09-21T09:00",
    end: "2026-09-21T09:30",
    city: "Scottsdale",
    notes: "Off the street.",
    setBy: "Tasha Reed",
    scope: "",
    internal: true,
    woSigned: true,
    hold: false,
    source: "shop",
    sourceId: "SHOP-1",
  },
];

let events: BookEvent[] = [
  ...seedAppts.filter((a) => a.kind !== "Install" || a.leadId !== "L-4788").map(fromAppt),
  ...choDays,
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
  if (a.id === b.id || a.resourceId !== b.resourceId || !a.resourceId) return false;
  return a.start < b.end && b.start < a.end;
}
export function loadHours(list: BookEvent[], resourceId: string, day: string) {
  return list.filter((e) => e.resourceId === resourceId && e.start.slice(0, 10) === day).reduce((s, e) => {
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
    const mine = events.filter((e) => e.resourceId === opts.resourceId && e.start.slice(0, 10) === key);
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
  start: string;
  end: string;
  city?: string;
  notes?: string;
  setBy: string;
  internal?: boolean;
  office?: "PHX" | "DFW";
}) {
  const row: BookEvent = {
    id: `BK-${Date.now()}`,
    type: input.type,
    status: "Confirmed",
    title: input.title.trim() || input.type,
    personId: input.personId ?? "",
    jobId: "",
    href: input.href ?? (input.personId ? `/leads/${input.personId}` : ""),
    resourceId: input.resourceId,
    office: input.office ?? "PHX",
    start: input.start,
    end: input.end,
    city: input.city ?? "",
    notes: input.notes ?? "",
    setBy: input.setBy,
    scope: "",
    internal: Boolean(input.internal) || familyOf(input.type) === "shop",
    woSigned: familyOf(input.type) !== "production",
    hold: false,
    source: input.personId ? "appointment" : "shop",
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
    office: officeFor(input.city ?? ""),
    start,
    end: addHrs(start, durationHrs(input.duration)),
    city: input.city ?? "",
    notes: input.notes ?? "",
    setBy: input.setBy,
    scope: input.scope ?? "",
    internal: false,
    woSigned: mapType(input.kind) !== "Install",
    hold: false,
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
    office: officeFor(input.city ?? ""),
    start,
    end,
    city: input.city ?? "",
    notes: "",
    setBy: input.crew,
    scope: input.process,
    internal: false,
    woSigned: Boolean(input.woSigned),
    hold: false,
    source: "job",
    sourceId: input.sourceId,
  });
}
