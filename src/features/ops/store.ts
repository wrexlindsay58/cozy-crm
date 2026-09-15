import { useSyncExternalStore } from "react";
import { activities, appointments as seedAppts, leads as seedLeads, tickets as seedTickets, type Appointment, type DndChannel, type Lead, type Ticket } from "@/lib/crm-data";
import { interestsLabel } from "@/features/lead/interests";
import { followersByPerson, type PersonRef } from "@/lib/file-data";
import { logCallMessage, sendMessage } from "@/features/thread/store";
import { type WorkStatus } from "@/lib/chrome";

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

let leads: Lead[] = [...seedLeads];
let appointments: Appointment[] = [...seedAppts];
let tickets: Ticket[] = [...seedTickets];
let tasks: Task[] = [
  { id: "K-1", title: "Photo of approved baffle", personId: "L-4821", owner: "Priya Shah", due: "Sep 17", status: "Open", ticketId: "T-91", followers: [] },
];
let history: Record<string, { at: string; who: string; what: string }[]> = Object.fromEntries(
  Object.entries(activities).map(([id, rows]) => [id, rows.map((r) => ({ ...r }))]),
);
let followers: Record<string, PersonRef[]> = Object.fromEntries(Object.entries(followersByPerson).map(([k, v]) => [k, [...v]]));
let cached = pack();
const listeners = new Set<() => void>();
function pack() {
  return { leads, appointments, tickets, tasks, history, followers };
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
export function bookAppointment(leadId: string, closer: string, day: number, hour: string) {
  const lead = leads.find((l) => l.id === leadId);
  if (!lead) return;
  appointments = [
    {
      id: `AP-${80 + appointments.length}`,
      leadId,
      name: lead.name,
      day,
      time: hour,
      status: "Confirmed",
      tone: "navy",
      setter: lead.setter,
      closer,
      product: lead.product,
      city: lead.city,
    } as Appointment,
    ...appointments,
  ];
  addHistory(leadId, closer, `Booked Sep ${day} ${hour}.`);
}
export function createTicket(input: { personId: string; title: string; owner: string; description?: string; due?: string }) {
  if (!input.title.trim()) return;
  const row: Ticket = {
    id: `T-${60 + tickets.length}`,
    title: input.title.trim(),
    related: input.personId,
    owner: input.owner,
    priority: "Normal",
    status: "Open",
    age: "now",
    description: input.description?.trim() || "",
    due: input.due?.trim() || "",
    followers: [],
  };
  tickets = [row, ...tickets];
  addHistory(input.personId, input.owner, `Ticket opened: ${input.title}.`);
  return row;
}
export function createTask(input: { personId: string; title: string; owner: string; due: string; ticketId?: string; description?: string }) {
  if (!input.title.trim()) return;
  tasks = [
    {
      id: `K-${20 + tasks.length}`,
      title: input.title.trim(),
      personId: input.personId,
      owner: input.owner,
      due: input.due || "Today",
      status: "Open",
      ticketId: input.ticketId,
      description: input.description?.trim() || "",
      followers: [],
    },
    ...tasks,
  ];
  addHistory(input.personId, input.owner, input.ticketId ? `Task on ${input.ticketId}: ${input.title}.` : `Task opened: ${input.title}.`);
  return tasks[0];
}
export function patchTicket(id: string, patch: Partial<Ticket>) {
  const t = tickets.find((x) => x.id === id);
  tickets = tickets.map((x) => (x.id === id ? { ...x, ...patch } : x));
  if (t) addHistory(t.related, ACTOR, `Ticket ${id} updated.`);
}
export function setWorkStatus(kind: "ticket" | "task", id: string, status: WorkStatus) {
  if (kind === "ticket") {
    const t = tickets.find((x) => x.id === id);
    tickets = tickets.map((x) => (x.id === id ? { ...x, status } : x));
    if (t) {
      sendMessage(t.related, `Status → ${status}.`, "internal", { nest: { kind: "ticket", id: t.id, title: t.title } });
      addHistory(t.related, ACTOR, `Ticket ${status}: ${t.title}.`);
    }
    return;
  }
  const k = tasks.find((x) => x.id === id);
  tasks = tasks.map((x) => (x.id === id ? { ...x, status } : x));
  if (k) {
    sendMessage(k.personId, `Status → ${status}.`, "internal", { nest: { kind: "task", id: k.id, title: k.title } });
    addHistory(k.personId, ACTOR, `Task ${status}: ${k.title}.`);
  }
}
export function deleteTicket(id: string) {
  const t = tickets.find((x) => x.id === id);
  tickets = tickets.filter((x) => x.id !== id);
  if (t) addHistory(t.related, ACTOR, `Ticket deleted: ${t.title}.`);
  else emit();
}
export function deleteTask(id: string) {
  const k = tasks.find((x) => x.id === id);
  tasks = tasks.filter((x) => x.id !== id);
  if (k) addHistory(k.personId, ACTOR, `Task deleted: ${k.title}.`);
  else emit();
}
export function addTicketFollower(id: string, name: string) {
  tickets = tickets.map((t) => {
    if (t.id !== id) return t;
    if ((t.followers ?? []).includes(name)) return t;
    return { ...t, followers: [...(t.followers ?? []), name] };
  });
  const t = tickets.find((x) => x.id === id);
  if (t) addHistory(t.related, ACTOR, `Follow ticket ${id}: ${name}.`);
}
export function removeTicketFollower(id: string, name: string) {
  tickets = tickets.map((t) => (t.id === id ? { ...t, followers: (t.followers ?? []).filter((n) => n !== name) } : t));
  emit();
}
export function patchTask(id: string, patch: Partial<Task>) {
  const k = tasks.find((x) => x.id === id);
  tasks = tasks.map((x) => (x.id === id ? { ...x, ...patch } : x));
  if (k) addHistory(k.personId, ACTOR, `Task updated: ${k.title}.`);
}
export function addTaskFollower(id: string, name: string) {
  tasks = tasks.map((t) => {
    if (t.id !== id) return t;
    if ((t.followers ?? []).includes(name)) return t;
    return { ...t, followers: [...(t.followers ?? []), name] };
  });
  emit();
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
export function mergeLead(fromId: string, intoId: string) {
  if (fromId === intoId) return;
  const from = leads.find((l) => l.id === fromId);
  const into = leads.find((l) => l.id === intoId);
  if (!from || !into) return;
  leads = leads.map((l) => (l.id === fromId ? { ...l, status: "Merged", tone: "muted", next: `Merged into ${into.id}` } : l));
  addHistory(intoId, ACTOR, `Merged ${from.name} (${fromId}) into this file.`);
  addHistory(fromId, ACTOR, `Merged into ${into.name} (${intoId}).`);
}
export function logCall(personId: string, input: CallInput) {
  const mins = input.duration.trim() ? ` · ${input.duration} min` : "";
  const note = input.note.trim() ? `. ${input.note.trim()}` : ".";
  const line = `Call ${input.direction} · ${input.result}${mins}${note}`;
  const durationSec = input.duration.trim() ? Math.round(Number(input.duration) * 60) : undefined;
  logCallMessage(personId, line, {
    durationSec: Number.isFinite(durationSec) ? durationSec : undefined,
    direction: input.direction,
    result: input.result,
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
