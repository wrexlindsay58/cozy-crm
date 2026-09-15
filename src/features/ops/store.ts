import { useSyncExternalStore } from "react";
import { appointments as seedAppts, leads as seedLeads, tickets as seedTickets, type Appointment, type Lead, type Ticket } from "@/lib/crm-data";

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
};
export type Task = { id: string; title: string; personId: string; owner: string; due: string; status: "Open" | "Done" };

let leads: Lead[] = [...seedLeads];
let appointments: Appointment[] = [...seedAppts];
let tickets: Ticket[] = [...seedTickets];
let tasks: Task[] = [];
let history: Record<string, { at: string; who: string; what: string }[]> = {};
let cached = pack();
const listeners = new Set<() => void>();
function pack() {
  return { leads, appointments, tickets, tasks, history };
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
  appointments = appointments.map((a) => (a.id === id ? { ...a, status } : a));
  emit();
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
export function createTicket(input: { personId: string; title: string; owner: string }) {
  if (!input.title.trim()) return;
  tickets = [
    {
      id: `T-${60 + tickets.length}`,
      title: input.title.trim(),
      related: input.personId,
      owner: input.owner,
      priority: "Normal",
      status: "Open",
      age: "now",
    } as Ticket,
    ...tickets,
  ];
  addHistory(input.personId, input.owner, `Ticket opened: ${input.title}.`);
}
export function createTask(input: { personId: string; title: string; owner: string; due: string }) {
  if (!input.title.trim()) return;
  tasks = [
    { id: `K-${20 + tasks.length}`, title: input.title.trim(), personId: input.personId, owner: input.owner, due: input.due || "Today", status: "Open" },
    ...tasks,
  ];
  addHistory(input.personId, input.owner, `Task opened: ${input.title}.`);
}
export function createLead(draft: LeadDraft) {
  if (!draft.name.trim() || !draft.phone.trim()) return null;
  const id = `L-${4822 + leads.length}`;
  const lead = {
    id,
    name: draft.name.trim(),
    phone: draft.phone.trim(),
    email: draft.email || "—",
    address: draft.address || "—",
    city: draft.city || "Surprise, AZ",
    source: draft.source || "Canvass",
    status: "Pending",
    tone: "muted",
    setter: draft.setter || "Priya Shah",
    closer: draft.closer || "Marco Velez",
    office: "Phoenix",
    created: "now",
    next: "Qualify",
    product: draft.product || "—",
    value: 0,
    notes: draft.notes || "",
  } as Lead;
  leads = [lead, ...leads];
  addHistory(id, lead.setter, `Source in: ${lead.source}.`);
  return lead;
}
export function useLead(id: string) {
  return useOps().leads.find((l) => l.id === id);
}
export function updateLead(id: string, patch: Partial<Lead>) {
  leads = leads.map((l) => (l.id === id ? { ...l, ...patch } : l));
  emit();
}
