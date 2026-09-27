import { useSyncExternalStore } from "react";
import type { Appointment, EventKind } from "@/lib/crm-data";
import { putFromAppointment } from "@/features/book/store";
import { actingName, logEmployeeAct } from "@/features/staff/store";
import type { ActionKind, ShopAction } from "@/features/action/types";
import { leads, appointments, actions, history, cached, listeners, emit, type Disposition, write_history, write_actions, write_appointments } from "./part-01";

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

export function leadById(id: string) {
  return leads.find((l) => l.id === id);
}

export function addHistory(personId: string, who: string, what: string) {
  const row = { at: new Date().toLocaleString(), who, what };
  write_history({ ...history, [personId]: [row, ...(history[personId] ?? [])] });
  logEmployeeAct(personId, who, what);
  emit();
}

export function setDisposition(id: string, status: Disposition) {
  const appt = appointments.find((a) => a.id === id);
  write_appointments(appointments.map((a) => (a.id === id ? { ...a, status } : a)));
  if (appt) addHistory(appt.leadId, actingName(), `Disposition ${status}.`);
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
  pipeline?: string;
}) {
  const lead = leads.find((l) => l.id === input.leadId);
  if (!lead) return;
  const id = `AP-${80 + appointments.length}`;
  write_appointments([
    {
      id,
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
      pipeline: input.pipeline,
    } as Appointment,
    ...appointments,
  ]);
  putFromAppointment({
    id,
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
  category?: string;
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
    category: input.category?.trim() || "",
    followers: [],
    age: "now",
  };
  write_actions([row, ...actions]);
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
