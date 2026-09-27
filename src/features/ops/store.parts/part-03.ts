import type { DndChannel, Ticket } from "@/lib/crm-data";
import { sendMessage } from "@/features/thread/store";
import type { WorkStatus } from "@/lib/chrome";
import { actingName } from "@/features/staff/store";
import type { ActionKind, ShopAction } from "@/features/action/types";
import { leads, actions, emit, personDnd, type Task, write_actions, write_leads, write_personDnd } from "./part-01";
import { useOps, addHistory, createAction } from "./part-02";

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
  write_actions(actions.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  if (t) addHistory(t.personId, actingName(), `${t.kind[0].toUpperCase()}${t.kind.slice(1)} ${id} updated.`);
}

export function setWorkStatus(kind: "ticket" | "task" | "request" | ActionKind, id: string, status: WorkStatus) {
  const t = actions.find((x) => x.id === id);
  write_actions(actions.map((x) => (x.id === id ? { ...x, status } : x)));
  if (t) {
    sendMessage(t.personId, `Status → ${status}.`, "internal", {
      nest: { kind: t.kind, id: t.id, title: t.title },
      actionId: t.id,
      actionKind: t.kind,
    });
    addHistory(t.personId, actingName(), `${t.kind[0].toUpperCase()}${t.kind.slice(1)} ${status}: ${t.title}.`);
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
  write_actions(actions.map((x) => (x.parentId === id ? { ...x, parentId: undefined } : x)).filter((x) => x.id !== id));
  if (t) addHistory(t.personId, actingName(), `${t.kind[0].toUpperCase()}${t.kind.slice(1)} deleted: ${t.title}. Children kept on the file.`);
  else emit();
}

export function addTicketFollower(id: string, name: string) {
  addActionFollower(id, name);
}

export function addActionFollower(id: string, name: string) {
  write_actions(actions.map((t) => {
    if (t.id !== id) return t;
    if ((t.followers ?? []).includes(name)) return t;
    return { ...t, followers: [...(t.followers ?? []), name] };
  }));
  const t = actions.find((x) => x.id === id);
  if (t) addHistory(t.personId, actingName(), `Follow ${t.kind} ${id}: ${name}.`);
}

export function removeTicketFollower(id: string, name: string) {
  write_actions(actions.map((t) => (t.id === id ? { ...t, followers: (t.followers ?? []).filter((n) => n !== name) } : t)));
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
  write_leads(leads.map((l) => {
    if (l.id !== id) return l;
    const tags = l.tags ?? [];
    return { ...l, tags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag] };
  }));
  addHistory(id, actingName(), `Tag ${tag}.`);
}

export function dndOn(lead: { dnd?: DndChannel[] } | undefined, channel: DndChannel) {
  const d = lead?.dnd ?? [];
  return d.includes(channel);
}

export function dndFor(id: string) {
  return leads.find((l) => l.id === id)?.dnd ?? personDnd[id] ?? [];
}

export function setLeadDnd(id: string, next: DndChannel[]) {
  if (leads.some((l) => l.id === id)) write_leads(leads.map((l) => (l.id === id ? { ...l, dnd: next } : l)));
  else write_personDnd({ ...personDnd, [id]: next });
  const label = next.length === 3 ? "all" : next.length === 0 ? "off" : next.join(", ");
  addHistory(id, actingName(), `DND ${label}.`);
}

export function toggleLeadDnd(id: string, which: DndChannel | "all") {
  const cur = dndFor(id);
  const next = which === "all" ? (cur.length === 3 ? [] : (["text", "call", "email"] as DndChannel[])) : cur.includes(which) ? cur.filter((c) => c !== which) : [...cur, which];
  setLeadDnd(id, next);
}

export function addWorkflow(id: string, name: string) {
  write_leads(leads.map((l) => {
    if (l.id !== id) return l;
    const w = l.workflows ?? [];
    if (w.includes(name)) return l;
    return { ...l, workflows: [...w, name] };
  }));
  addHistory(id, actingName(), `Workflow on: ${name}.`);
}

export function stopWorkflow(id: string, name: string) {
  write_leads(leads.map((l) => (l.id === id ? { ...l, workflows: (l.workflows ?? []).filter((n) => n !== name) } : l)));
  addHistory(id, actingName(), `Workflow off: ${name}.`);
}

export function useLead(id: string) {
  return useOps().leads.find((l) => l.id === id);
}
