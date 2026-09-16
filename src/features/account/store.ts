import { useSyncExternalStore } from "react";
import { addHistory, createLead } from "@/features/ops/store";
import { putFromAppointment } from "@/features/book/store";
import { photosByPerson, type Photo } from "@/lib/file-data";
import type { Activity } from "@/lib/crm-data";

export const VISIT_KINDS = ["Sales", "Go-back", "Warranty", "Service"] as const;
export type VisitKind = (typeof VISIT_KINDS)[number];
export type Visit = { id: string; accountId: string; kind: VisitKind; day: string; who: string; fee: number; cost: number; status: string };
export type Membership = { plan: string; cadence: string; amount: number; next: string };
export type JobLane = { id: string; label: string; history: Activity[] };
export type AccountFile = {
  accountId: string; leadId: string; name: string; city: string; owner: string;
  visits: Visit[]; membership: Membership | null; photos: Photo[]; lanes: JobLane[]; childLeads: { id: string; name: string }[];
};

const whitaker: AccountFile = {
  accountId: "A-198", leadId: "L-4761", name: "The Whitakers", city: "Scottsdale, AZ", owner: "Dana Ortiz",
  visits: [
    { id: "V-12", accountId: "A-198", kind: "Service", day: "Aug 9", who: "Crew 2", fee: 189, cost: 62, status: "Done" },
    { id: "V-9", accountId: "A-198", kind: "Warranty", day: "Mar 2", who: "Crew 1", fee: 0, cost: 140, status: "Done" },
  ],
  membership: { plan: "Comfort", cadence: "Monthly", amount: 29, next: "Oct 1" },
  photos: photosByPerson["A-198"] ?? [],
  lanes: [{ id: "P-328", label: "Envelope 2026", history: [{ at: "Sep 6", who: "Dana Ortiz", what: "Sold envelope package." }] }],
  childLeads: [],
};
let files: Record<string, AccountFile> = { "A-198": whitaker };
let photoRows: Photo[] = [...(photosByPerson["A-198"] ?? [])];
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }
function subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb); }
export function useAccount(accountId: string) {
  useSyncExternalStore(subscribe, () => files, () => files);
  return files[accountId];
}
export function useAccountPhotos(accountId: string) {
  useSyncExternalStore(subscribe, () => photoRows, () => photoRows);
  return photoRows.filter((p) => p.personId === accountId);
}
export function defaultsFor(kind: VisitKind) {
  if (kind === "Service") return { fee: 189, cost: 75 };
  if (kind === "Warranty") return { fee: 0, cost: 180 };
  if (kind === "Go-back") return { fee: 0, cost: 120 };
  return { fee: 0, cost: 0 };
}
export function scheduleVisit(input: { accountId: string; kind: VisitKind; closer: string; day: number; hour: string; fee: number; cost: number }) {
  const file = files[input.accountId]; if (!file) return;
  const row: Visit = { id: `V-${20 + file.visits.length}`, accountId: input.accountId, kind: input.kind, day: `Sep ${input.day} ${input.hour}`, who: input.closer, fee: input.fee, cost: input.cost, status: "Booked" };
  files = { ...files, [input.accountId]: { ...file, visits: [row, ...file.visits] } };
  putFromAppointment({
    leadId: file.leadId,
    name: file.name,
    kind: input.kind,
    day: input.day,
    time: input.hour,
    assignee: input.closer,
    setBy: input.closer,
    city: file.city,
  });
  emit();
}
export function addPhoto(accountId: string, caption: string) {
  const trimmed = caption.trim(); if (!trimmed) return false;
  const row: Photo = { id: `PH-${10 + photoRows.length}`, personId: accountId, caption: trimmed, tone: "info" };
  photoRows = [row, ...photoRows];
  const file = files[accountId];
  if (file) files = { ...files, [accountId]: { ...file, photos: [row, ...file.photos] } };
  addHistory(accountId, "File", `Photo: ${trimmed}.`); emit(); return true;
}
export function spawnLead(accountId: string, product: string) {
  const file = files[accountId]; if (!file) return null;
  const lead = createLead({ name: file.name, phone: "(480) 555-0121", city: file.city, source: "Account follow-up", product, closer: file.owner });
  if (lead) files = { ...files, [accountId]: { ...file, childLeads: [{ id: lead.id, name: product }, ...file.childLeads] } };
  emit(); return lead;
}
