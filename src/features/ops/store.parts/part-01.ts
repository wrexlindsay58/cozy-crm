import { activities, appointments as seedAppts, leads as seedLeads, tickets as seedTickets, type Appointment, type DndChannel, type Lead, type Ticket } from "@/lib/crm-data";
import { followersByPerson, type PersonRef } from "@/lib/file-data";
import type { WorkStatus } from "@/lib/chrome";
import type { ShopAction } from "@/features/action/types";
export type Disposition = string;
export const DISPOSITIONS = ["Unmarked", "Confirmed", "No run", "Missed", "One legger", "Ran"] as const;
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
  office?: string;
  value?: number;
  yearBuilt?: string;
  stories?: string;
  sqft?: string;
  utility?: string;
  hoa?: string;
  access?: string;
  bothHome?: boolean;
  finance?: string;
  rebate?: boolean;
  pain?: string;
  hotRooms?: string;
  coldRooms?: string;
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
const TICKET_CAT: Record<string, string> = {
  "T-91": "HOA",
  "T-88": "Callback",
  "T-86": "HOA",
  "T-84": "Permit",
  "T-81": "Callback",
  "T-79": "Material",
  "T-74": "Callback",
  "T-70": "Material",
  "T-66": "Warranty",
};
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
export let leads: Lead[] = [...seedLeads];
export let appointments: Appointment[] = [...seedAppts];
export let actions: ShopAction[] = [
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
    category: TICKET_CAT[t.id] ?? "Callback",
    followers: t.followers,
    age: t.age,
  })),
  { id: "K-1", kind: "task", title: "Photo of approved baffle", personId: "L-4821", parentId: "T-91", owner: "Priya Shah", due: "Sep 17", status: "Open", category: "HOA", followers: [], age: "1d" },
  { id: "R-12", kind: "request", title: "HOA architectural form", personId: "L-4821", parentId: "T-91", owner: "Priya Shah", due: "Sep 20", status: "Open", description: "Board packet before they paint.", category: "HOA", followers: [], age: "1d" },
  { id: "K-2", kind: "task", title: "Email the board", personId: "L-4821", parentId: "R-12", owner: "Priya Shah", due: "Sep 19", status: "Open", category: "HOA", followers: [], age: "1d" },
  { id: "K-3", kind: "task", title: "Send Hale financing recap", personId: "L-4819", owner: "Dana Ortiz", due: "Sep 18", status: "Open", description: "Cash vs 12-month. No ticket.", category: "Callback", followers: [], age: "8h" },
];
export let history: Record<string, { at: string; who: string; what: string }[]> = Object.fromEntries(
  Object.entries(activities).map(([id, rows]) => [id, rows.map((r) => ({ ...r }))]),
);
export let followers: Record<string, PersonRef[]> = Object.fromEntries(Object.entries(followersByPerson).map(([k, v]) => [k, [...v]]));
export let tagPool = ["HOA", "Rebate", "Renter", "Spanish", "Veteran", "Callback", "Air seal"];
export let flowPool = ["New lead drip", "No-run follow-up", "Ran, no decision", "Review ask"];
export let personDnd: Record<string, DndChannel[] | undefined> = {};
export let cached = pack();
export const listeners = new Set<() => void>();
function pack() {
  const tickets = actions.filter((a) => a.kind === "ticket").map(toTicket);
  const tasks = actions.filter((a) => a.kind === "task").map(toTask);
  return { leads, appointments, tickets, tasks, actions, history, followers, tagPool, flowPool, personDnd };
}
export function emit() {
  cached = pack();
  listeners.forEach((l) => l());
}
export function write_actions(__v: any) { actions = __v; }
export function write_history(__v: any) { history = __v; }
export function write_followers(__v: any) { followers = __v; }
export function write_tagPool(__v: any) { tagPool = __v; }
export function write_flowPool(__v: any) { flowPool = __v; }
export function write_appointments(__v: any) { appointments = __v; }
export function write_leads(__v: any) { leads = __v; }
export function write_personDnd(__v: any) { personDnd = __v; }
