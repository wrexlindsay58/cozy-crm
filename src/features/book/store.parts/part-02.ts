import { addHrs, durationHrs, isoOn } from "../time";
import { assignedIds, familyOf, mapType, type BookEvent, type BookStatus, type BookType } from "../types";
import { rid, officeFor, events, emit, upsertBook, overlaps, write_events } from "./part-01";

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
  source?: BookEvent["source"];
  sourceId?: string;
  visit?: BookEvent["visit"];
  visitWhy?: string;
  visitNote?: string;
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
    woSigned: input.type === "Membership" || familyOf(input.type) !== "production",
    hold: false,
    blank: Boolean(input.blank),
    links: input.links ?? [],
    source: input.source ?? (input.personId && !input.blank ? "appointment" : "shop"),
    sourceId: input.sourceId ?? "",
    visit: input.visit ?? "",
    visitWhy: input.visitWhy ?? "",
    visitNote: input.visitNote ?? "",
  };
  write_events([row, ...events]);
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
