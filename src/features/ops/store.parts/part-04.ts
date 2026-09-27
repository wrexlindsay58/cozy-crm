import type { Lead } from "@/lib/crm-data";
import { interestsLabel } from "@/features/lead/interests";
import type { PersonRef } from "@/lib/file-data";
import { logCallMessage } from "@/features/thread/store";
import { actingName } from "@/features/staff/store";
import { toneForStatus } from "@/lib/lead-status";
import type { ActionKind } from "@/features/action/types";
import { leads, followers, tagPool, flowPool, emit, type LeadDraft, type CallInput, write_tagPool, write_flowPool, write_followers, write_leads } from "./part-01";
import { addHistory } from "./part-02";
import { toggleLeadTag, addWorkflow } from "./part-03";

export function createTag(id: string, name: string) {
  const tag = name.trim();
  if (!tag) return;
  if (!tagPool.includes(tag)) write_tagPool([...tagPool, tag]);
  const lead = leads.find((l) => l.id === id);
  if (!(lead?.tags ?? []).includes(tag)) toggleLeadTag(id, tag);
  else emit();
}

export function createWorkflow(id: string, name: string) {
  const flow = name.trim();
  if (!flow) return;
  if (!flowPool.includes(flow)) write_flowPool([...flowPool, flow]);
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
    office: draft.office || "Phoenix",
    created: "now",
    next: "Qualify",
    product: interestsLabel(draft.interests ?? [], draft.otherInterest) || draft.product || "",
    value: Number(draft.value) || 0,
    notes: draft.notes || "",
    interests: draft.interests ?? [],
    otherInterest: draft.otherInterest || "",
    secondaryName: draft.secondaryName || "",
    secondaryPhone: draft.secondaryPhone || "",
    secondaryEmail: draft.secondaryEmail || "",
    referrerName: draft.referrerName || "",
    referrerPhone: draft.referrerPhone || "",
    yearBuilt: draft.yearBuilt || "",
    stories: draft.stories || "",
    sqft: draft.sqft || "",
    utility: draft.utility || "",
    hoa: draft.hoa || "",
    access: draft.access || "",
    bothHome: Boolean(draft.bothHome),
    finance: draft.finance || "",
    rebate: Boolean(draft.rebate),
    pain: draft.pain || "",
    hotRooms: draft.hotRooms || "",
    coldRooms: draft.coldRooms || "",
  } as Lead;
  write_leads([lead, ...leads]);
  write_followers({ ...followers, [id]: [{ name: lead.setter, role: "Setter" }] });
  addHistory(id, lead.setter, `Source in: ${lead.source}.`);
  return lead;
}

export function updateLead(id: string, patch: Partial<Lead> & LeadDraft) {
  const product =
    patch.interests && patch.interests.length
      ? interestsLabel(patch.interests, patch.otherInterest)
      : patch.product;
  write_leads(leads.map((l) => (l.id === id ? { ...l, ...patch, ...(product !== undefined ? { product } : {}) } : l)));
  addHistory(id, actingName(), "Details saved.");
}

export function dropLead(id: string, reason: string) {
  const why = reason.trim();
  if (!why) return;
  write_leads(leads.map((l) => (l.id === id ? { ...l, status: "Dropped", tone: "muted", next: "Dropped", dropReason: why } : l)));
  addHistory(id, actingName(), `Dropped. ${why}.`);
}

export function setLeadQualify(id: string, questionId: string, value: string) {
  write_leads(leads.map((l) => (l.id === id ? { ...l, qualify: { ...(l.qualify ?? {}), [questionId]: value } } : l)));
  emit();
}

export function setLeadRebate(id: string, rebate: boolean) {
  write_leads(leads.map((l) => (l.id === id ? { ...l, rebate } : l)));
  emit();
}

export function setLeadStatus(id: string, status: string) {
  const tone = toneForStatus(status);
  write_leads(leads.map((l) => (l.id === id ? { ...l, status, tone } : l)));
  addHistory(id, actingName(), `Disposition ${status}.`);
}

export function mergeLead(fromId: string, intoId: string) {
  if (fromId === intoId) return;
  const from = leads.find((l) => l.id === fromId);
  const into = leads.find((l) => l.id === intoId);
  if (!from || !into) return;
  write_leads(leads.map((l) => (l.id === fromId ? { ...l, status: "Merged", tone: "muted", next: `Merged into ${into.id}` } : l)));
  addHistory(intoId, actingName(), `Merged ${from.name} (${fromId}) into this file.`);
  addHistory(fromId, actingName(), `Merged into ${into.name} (${intoId}).`);
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
  addHistory(personId, actingName(), line);
}

export function addFollower(personId: string, person: PersonRef) {
  const cur = followers[personId] ?? [];
  if (cur.some((f) => f.name === person.name)) return;
  write_followers({ ...followers, [personId]: [...cur, person] });
  addHistory(personId, actingName(), `Follow ${person.name}.`);
}

export function removeFollower(personId: string, name: string) {
  write_followers({ ...followers, [personId]: (followers[personId] ?? []).filter((f) => f.name !== name) });
  addHistory(personId, actingName(), `Unfollow ${name}.`);
}

export function transferOwner(personId: string, toName: string, reason: string) {
  const why = reason.trim() || "No reason given";
  write_leads(leads.map((l) => (l.id === personId ? { ...l, closer: toName } : l)));
  addHistory(personId, actingName(), `Transfer to ${toName}. ${why}.`);
}
