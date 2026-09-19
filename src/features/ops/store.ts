import { useSyncExternalStore } from "react";
import { activities, appointments as seedAppts, leads as seedLeads, tickets as seedTickets, type Appointment, type DndChannel, type EventKind, type Lead, type Ticket } from "@/lib/crm-data";
import { interestsLabel } from "@/features/lead/interests";
import { followersByPerson, type PersonRef } from "@/lib/file-data";
import { logCallMessage, sendMessage } from "@/features/thread/store";
import { putFromAppointment } from "@/features/book/store";
import { type WorkStatus } from "@/lib/chrome";
import { toneForStatus } from "@/lib/lead-status";
import type { ActionKind, ShopAction } from "@/features/action/types";

export type Disposition = string;
export const DISPOSITIONS = ["Unmarked", "Confirmed", "No sit", "Missed", "One legger", "Ran"] as const;
export type LeadDraft = {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  source?: string;
  product?: string;
  notes?: string;
  setter?: string;
  closer?: string;
  interests?: string[];
  otherInterest?: string;
  secondaryName?: string;
  secondaryPhone?: string;
  secondaryEmail?: string;
  referrerName?: string;
  referrerPhone?: string;
};
export type { ActionKind, ShopAction } from "@/features/action/types";
export type Task = {
  id: string;
  title: string;
  personId: string;
  owner: string;
  due: string;
  status: WorkStatus;
  ticketId?: string;
  description?: string;
  followers?: string[];
};
export type CallInput = { direction: "Out" | "In"; result: "Answered" | "VM" | "No answer"; duration: string; note: string };

const ACTOR = "Wrex Lindsay";

function toTicket(a: ShopAction): Ticket {
  return {
    id: a.id,
    title: a.title,
    related: a.personId,
    owner: a.owner,
    priority: a.priority ?? "Normal",
    status: a.status,
    age: a.age ?? "",
    description: a.description,
    due: a.due,
    followers: a.followers,
  };
}
function toTask(a: ShopAction): Task {
  return {
    id: a.id,
    title: a.title,
    personId: a.personId,
    owner: a.owner,
    due: a.due ?? "",
    status: a.status,
    ticketId: a.parentId,
    description: a.description,
    followers: a.followers,
  };
}

let leads: Lead[] = [...seedLeads];
let appointments: Appointment[] = [...seedAppts];
let actions: ShopAction[] = [
  ...seedTickets.map((t) => ({
    id: t.id,
    kind: "ticket" as const,
    title: t.title,
    personId: t.related,
    owner: t.owner,
    status: t.status,
    priority: t.priority,
    due: t.due,
    description: t.description,
    followers: t.followers,
    age: t.age,
  })),
  { id: "K-1", kind: "task", title: "Photo of approved baffle", personId: "L-4821", parentId: "T-91", owner: "Priya Shah", due: "Sep 17", status: "Open", followers: [], age: "1d" },
  { id: "R-12", kind: "request", title: "HOA architectural form", personId: "L-4821", parentId: "T-91", owner: "Priya Shah", due: "Sep 20", status: "Open", description: "Board packet before they paint.", followers: [], age: "1d" },
  { id: "K-2", kind: "task", title: "Email the board", personId: "L-4821", parentId: "R-12", owner: "Priya Shah", due: "Sep 19", status: "Open", followers: [], age: "1d" },
  { id: "K-3", kind: "task", title: "Send Hale financing recap", personId: "L-4819", owner: "Dana Ortiz", due: "Sep 18", status: "Open", description: "Cash vs 12-month. No ticket.", followers: [], age: "8h" },
];
let history: Record<string, { at: string; who: string; what: string }[]> = Object.fromEntries(
  Object.entries(activities).map(([id, rows]) => [id, rows.map((r) => ({ ...r }))]),
);
let followers: Record<string, PersonRef[]> = Object.fromEntries(Object.entries(followersByPerson).map(([k, v]) => [k, [...v]]));
let tagPool = ["HOA", "Rebate", "Renter", "Spanish", "Veteran", "Callback", "Air seal"];
let flowPool = ["New lead drip", "No-sit follow-up", "Ran, no decision", "Review ask"];
let cached = pack();
const listeners = new Set<() => void>();
function pack() {
  const tickets = actions.filter((a) => a.kind === "ticket").map(toTicket);
  const tasks = actions.filter((a) => a.kind === "task").map(toTask);
  return { leads, appointments, tickets, tasks, actions, history, followers, tagPool, flowPool };
}
function emit() {
  cached = pack();
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function snap() {
  return cached;
}
export function useOps() {
  return useSyncExternalStore(subscribe, snap, snap);
}
export function addHistory(personId: string, who: string, what: string) {
  const row = { at: new Date().toLocaleString(), who, what };
  history = { ...history, [personId]: [row, ...(history[personId] ?? [])] };
  emit();
}
export function setDisposition(id: string, status: Disposition) {
  const appt = appointments.find((a) => a.id === id);
  appointments = appointments.map((a) => (a.id === id ? { ...a, status } : a));
  if (appt) addHistory(appt.leadId, ACTOR, `Disposition ${status}.`);
  else emit();
}
export function bookAppointment(input: {
  leadId: string;
  kind: EventKind;
  day: number;
  time: string;
  assignee: string;
  setBy: string;
  notes?: string;
  crew?: string;
  duration?: string;
  scope?: string;
}) {
  const lead = leads.find((l) => l.id === input.leadId);
  if (!lead) return;
  appointments = [
    {
      id: `AP-${80 + appointments.length}`,
      leadId: input.leadId,
      name: lead.name,
      day: input.day,
      time: input.time,
      status: "Confirmed",
      tone: "navy",
      setter: lead.setter,
      closer: input.assignee,
      product: lead.product,
      city: lead.city,
      kind: input.kind,
      notes: input.notes,
      setBy: input.setBy,
      crew: input.crew,
      duration: input.duration,
      scope: input.scope,
    } as Appointment,
    ...appointments,
  ];
  putFromAppointment({
    leadId: input.leadId,
    name: lead.name,
    kind: input.kind,
    day: input.day,
    time: input.time,
    assignee: input.assignee,
    setBy: input.setBy,
    notes: input.notes,
    crew: input.crew,
    duration: input.duration,
    scope: input.scope,
    city: lead.city,
  });
  addHistory(
    input.leadId,
    input.setBy,
    `Scheduled ${input.kind}: Sep ${input.day} ${input.time} · ${input.assignee}${input.crew ? ` · ${input.crew}` : ""}.`,
  );
}
export function nextActionId(kind: ActionKind) {
  const prefix = kind === "ticket" ? "T" : kind === "request" ? "R" : "K";
  const n = actions.filter((a) => a.kind === kind).length;
  return `${prefix}-${20 + n + Math.floor(Math.random() * 9)}`;
}

export function descendantsOf(id: string, rows: ShopAction[] = actions): string[] {
  const kids = rows.filter((a) => a.parentId === id);
  return kids.flatMap((k) => [k.id, ...descendantsOf(k.id, rows)]);
}

export function createAction(input: {
  kind: ActionKind;
  personId: string;
  title: string;
  owner: string;
  description?: string;
  due?: string;
  parentId?: string;
  priority?: "High" | "Normal" | "Low";
}) {
  if (!input.title.trim()) return;
  const row: ShopAction = {
    id: nextActionId(input.kind),
    kind: input.kind,
    title: input.title.trim(),
    personId: input.personId,
    parentId: input.parentId,
    owner: input.owner,
    status: "Open",
    priority: input.kind === "ticket" ? (input.priority ?? "Normal") : undefined,
    due: input.due?.trim() || "",
    description: input.description?.trim() || "",
    followers: [],
    age: "now",
  };
  actions = [row, ...actions];
  const word = input.kind;
  addHistory(
    input.personId,
    input.owner,
    input.parentId ? `${word[0].toUpperCase()}${word.slice(1)} on ${input.parentId}: ${input.title}.` : `${word[0].toUpperCase()}${word.slice(1)} opened: ${input.title}.`,
  );
  return row;
}
export function createTicket(input: { personId: string; title: string; owner: string; description?: string; due?: string }) {
  return createAction({ ...input, kind: "ticket" });
}
export function createTask(input: { personId: string; title: string; owner: string; due: string; ticketId?: string; description?: string }) {
  return createAction({ ...input, kind: "task", parentId: input.ticketId });
}
export function createRequest(input: { personId: string; title: string; owner: string; due?: string; parentId?: string; description?: string }) {
  return createAction({ ...input, kind: "request" });
}
export function patchTicket(id: string, patch: Partial<Ticket>) {
  const mapped: Partial<ShopAction> = {
    title: patch.title,
    description: patch.description,
    due: patch.due,
    owner: patch.owner,
    status: patch.status,
    priority: patch.priority,
    followers: patch.followers,
    personId: patch.related,
  };
  patchAction(id, mapped);
}
export function patchAction(id: string, patch: Partial<ShopAction>) {
  const t = actions.find((x) => x.id === id);
  actions = actions.map((x) => (x.id === id ? { ...x, ...patch } : x));
  if (t) addHistory(t.personId, ACTOR, `${t.kind[0].toUpperCase()}${t.kind.slice(1)} ${id} updated.`);
}
export function setWorkStatus(kind: "ticket" | "task" | "request" | ActionKind, id: string, status: WorkStatus) {
  const t = actions.find((x) => x.id === id);
  actions = actions.map((x) => (x.id === id ? { ...x, status } : x));
  if (t) {
    sendMessage(t.personId, `Status → ${status}.`, "internal", {
      nest: { kind: t.kind, id: t.id, title: t.title },
      actionId: t.id,
      actionKind: t.kind,
    });
    addHistory(t.personId, ACTOR, `${t.kind[0].toUpperCase()}${t.kind.slice(1)} ${status}: ${t.title}.`);
  }
  void kind;
}
export function deleteTicket(id: string) {
  deleteAction(id);
}
export function deleteTask(id: string) {
  deleteAction(id);
}
export function deleteAction(id: string) {
  const t = actions.find((x) => x.id === id);
  actions = actions.map((x) => (x.parentId === id ? { ...x, parentId: undefined } : x)).filter((x) => x.id !== id);
  if (t) addHistory(t.personId, ACTOR, `${t.kind[0].toUpperCase()}${t.kind.slice(1)} deleted: ${t.title}. Children kept on the file.`);
  else emit();
}
export function addTicketFollower(id: string, name: string) {
  addActionFollower(id, name);
}
export function addActionFollower(id: string, name: string) {
  actions = actions.map((t) => {
    if (t.id !== id) return t;
    if ((t.followers ?? []).includes(name)) return t;
    return { ...t, followers: [...(t.followers ?? []), name] };
  });
  const t = actions.find((x) => x.id === id);
  if (t) addHistory(t.personId, ACTOR, `Follow ${t.kind} ${id}: ${name}.`);
}
export function removeTicketFollower(id: string, name: string) {
  actions = actions.map((t) => (t.id === id ? { ...t, followers: (t.followers ?? []).filter((n) => n !== name) } : t));
  emit();
}
export function patchTask(id: string, patch: Partial<Task>) {
  patchAction(id, {
    title: patch.title,
    description: patch.description,
    due: patch.due,
    owner: patch.owner,
    status: patch.status,
    followers: patch.followers,
    parentId: patch.ticketId,
  });
}
export function addTaskFollower(id: string, name: string) {
  addActionFollower(id, name);
}
export function toggleLeadTag(id: string, tag: string) {
  leads = leads.map((l) => {
    if (l.id !== id) return l;
    const tags = l.tags ?? [];
    return { ...l, tags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag] };
  });
  addHistory(id, ACTOR, `Tag ${tag}.`);
}
export function dndOn(lead: { dnd?: DndChannel[] } | undefined, channel: DndChannel) {
  const d = lead?.dnd ?? [];
  return d.includes(channel);
}
export function setLeadDnd(id: string, next: DndChannel[]) {
  leads = leads.map((l) => (l.id === id ? { ...l, dnd: next } : l));
  const label = next.length === 3 ? "all" : next.length === 0 ? "off" : next.join(", ");
  addHistory(id, ACTOR, `DND ${label}.`);
}
export function toggleLeadDnd(id: string, which: DndChannel | "all") {
  const lead = leads.find((l) => l.id === id);
  const cur = lead?.dnd ?? [];
  let next: DndChannel[] = cur;
  if (which === "all") {
    next = cur.length === 3 ? [] : ["text", "call", "email"];
  } else {
    next = cur.includes(which) ? cur.filter((c) => c !== which) : [...cur, which];
  }
  setLeadDnd(id, next);
}
export function addWorkflow(id: string, name: string) {
  leads = leads.map((l) => {
    if (l.id !== id) return l;
    const w = l.workflows ?? [];
    if (w.includes(name)) return l;
    return { ...l, workflows: [...w, name] };
  });
  addHistory(id, ACTOR, `Workflow on: ${name}.`);
}
export function stopWorkflow(id: string, name: string) {
  leads = leads.map((l) => (l.id === id ? { ...l, workflows: (l.workflows ?? []).filter((n) => n !== name) } : l));
  addHistory(id, ACTOR, `Workflow off: ${name}.`);
}
export function createTag(id: string, name: string) {
  const tag = name.trim();
  if (!tag) return;
  if (!tagPool.includes(tag)) tagPool = [...tagPool, tag];
  const lead = leads.find((l) => l.id === id);
  if (!(lead?.tags ?? []).includes(tag)) toggleLeadTag(id, tag);
  else emit();
}
export function createWorkflow(id: string, name: string) {
  const flow = name.trim();
  if (!flow) return;
  if (!flowPool.includes(flow)) flowPool = [...flowPool, flow];
  addWorkflow(id, flow);
}
export function createLead(draft: LeadDraft) {
  if (!draft.name.trim() || !draft.phone.trim()) return null;
  const id = `L-${4822 + leads.length}`;
  const lead = {
    id,
    name: draft.name.trim(),
    phone: draft.phone.trim(),
    email: draft.email || "",
    address: draft.address || "",
    city: draft.city || "Surprise, AZ",
    source: draft.source || "Canvass",
    status: "Pending",
    tone: "muted",
    setter: draft.setter || "Priya Shah",
    closer: draft.closer || "Marco Velez",
    office: "Phoenix",
    created: "now",
    next: "Qualify",
    product: interestsLabel(draft.interests ?? [], draft.otherInterest) || draft.product || "",
    value: 0,
    notes: draft.notes || "",
    interests: draft.interests ?? [],
    otherInterest: draft.otherInterest || "",
    secondaryName: draft.secondaryName || "",
    secondaryPhone: draft.secondaryPhone || "",
    secondaryEmail: draft.secondaryEmail || "",
    referrerName: draft.referrerName || "",
    referrerPhone: draft.referrerPhone || "",
  } as Lead;
  leads = [lead, ...leads];
  followers = { ...followers, [id]: [{ name: lead.setter, role: "Setter" }] };
  addHistory(id, lead.setter, `Source in: ${lead.source}.`);
  return lead;
}
export function useLead(id: string) {
  return useOps().leads.find((l) => l.id === id);
}
export function updateLead(id: string, patch: Partial<Lead> & LeadDraft) {
  const product =
    patch.interests && patch.interests.length
      ? interestsLabel(patch.interests, patch.otherInterest)
      : patch.product;
  leads = leads.map((l) => (l.id === id ? { ...l, ...patch, ...(product !== undefined ? { product } : {}) } : l));
  addHistory(id, ACTOR, "Details saved.");
}
export function dropLead(id: string, reason: string) {
  const why = reason.trim();
  if (!why) return;
  leads = leads.map((l) => (l.id === id ? { ...l, status: "Dropped", tone: "muted", next: "Dropped", dropReason: why } : l));
  addHistory(id, ACTOR, `Dropped. ${why}.`);
}
export function setLeadStatus(id: string, status: string) {
  const tone = toneForStatus(status);
  leads = leads.map((l) => (l.id === id ? { ...l, status, tone } : l));
  addHistory(id, ACTOR, `Disposition ${status}.`);
}
export function mergeLead(fromId: string, intoId: string) {
  if (fromId === intoId) return;
  const from = leads.find((l) => l.id === fromId);
  const into = leads.find((l) => l.id === intoId);
  if (!from || !into) return;
  leads = leads.map((l) => (l.id === fromId ? { ...l, status: "Merged", tone: "muted", next: `Merged into ${into.id}` } : l));
  addHistory(intoId, ACTOR, `Merged ${from.name} (${fromId}) into this file.`);
  addHistory(fromId, ACTOR, `Merged into ${into.name} (${intoId}).`);
}
export function logCall(personId: string, input: CallInput, extra?: { actionId?: string; actionKind?: ActionKind }) {
  const mins = input.duration.trim() ? ` · ${input.duration} min` : "";
  const note = input.note.trim() ? `. ${input.note.trim()}` : ".";
  const line = `Call ${input.direction} · ${input.result}${mins}${note}`;
  const durationSec = input.duration.trim() ? Math.round(Number(input.duration) * 60) : undefined;
  logCallMessage(personId, line, {
    durationSec: Number.isFinite(durationSec) ? durationSec : undefined,
    direction: input.direction,
    result: input.result,
    actionId: extra?.actionId,
    actionKind: extra?.actionKind,
  });
  addHistory(personId, ACTOR, line);
}
export function addFollower(personId: string, person: PersonRef) {
  const cur = followers[personId] ?? [];
  if (cur.some((f) => f.name === person.name)) return;
  followers = { ...followers, [personId]: [...cur, person] };
  addHistory(personId, ACTOR, `Follow ${person.name}.`);
}
export function removeFollower(personId: string, name: string) {
  followers = { ...followers, [personId]: (followers[personId] ?? []).filter((f) => f.name !== name) };
  addHistory(personId, ACTOR, `Unfollow ${name}.`);
}
export function transferOwner(personId: string, toName: string, reason: string) {
  const why = reason.trim() || "No reason given";
  leads = leads.map((l) => (l.id === personId ? { ...l, closer: toName } : l));
  addHistory(personId, ACTOR, `Transfer to ${toName}. ${why}.`);
}
