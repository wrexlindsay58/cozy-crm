import { useSyncExternalStore } from "react";

export type Financer = { id: string; name: string; feePct: number; active: boolean };
export type Term = { id: string; name: string; schedule: string };
export type FromNumber = { office: string; number: string };

let dealerFeePct = 5;
let commissionPct = 10;
let financers: Financer[] = [
  { id: "F-1", name: "GoodLeap", feePct: 5, active: true },
  { id: "F-2", name: "Cash", feePct: 0, active: true },
  { id: "F-3", name: "12-month in house", feePct: 0, active: true },
];
let terms: Term[] = [
  { id: "P-1", name: "Deposit", schedule: "10% at sign" },
  { id: "P-2", name: "Progress", schedule: "40% at start" },
  { id: "P-3", name: "Final", schedule: "50% at complete" },
];
let templates = ["Proposal", "Agreement", "Change order", "Work order"];
let notify = [
  { id: "booked", label: "Booked", on: true },
  { id: "ran", label: "Ran", on: true },
  { id: "sold", label: "Sold", on: true },
  { id: "install", label: "Install day", on: true },
];
let reminderMin = 20;
let numbers: FromNumber[] = [
  { office: "Phoenix", number: "(623) 555-0100" },
  { office: "Scottsdale", number: "(480) 555-0100" },
];

let snap = pack();
const listeners = new Set<() => void>();
function pack() {
  return { dealerFeePct, commissionPct, financers, terms, templates, notify, reminderMin, numbers };
}
function emit() {
  snap = pack();
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useMoneySettings() {
  return useSyncExternalStore(subscribe, () => snap, () => snap);
}

export function getDealerFeePct() {
  return dealerFeePct;
}

export function getCommissionPct() {
  return commissionPct;
}

export function setDealerFeePct(n: number) {
  dealerFeePct = Math.max(0, Math.min(20, n));
  financers = financers.map((f) => (f.name === "GoodLeap" ? { ...f, feePct: dealerFeePct } : f));
  emit();
}

export function setCommissionPct(n: number) {
  commissionPct = Math.max(0, Math.min(40, n));
  emit();
}

export function toggleFinancer(id: string) {
  financers = financers.map((f) => (f.id === id ? { ...f, active: !f.active } : f));
  emit();
}

export function addTerm(name: string, schedule: string) {
  if (!name.trim()) return;
  terms = [...terms, { id: `P-${terms.length + 1}`, name: name.trim(), schedule: schedule.trim() }];
  emit();
}

export function toggleNotify(id: string) {
  notify = notify.map((n) => (n.id === id ? { ...n, on: !n.on } : n));
  emit();
}

export function setReminderMin(n: number) {
  reminderMin = Math.max(5, Math.min(120, n));
  emit();
}

export function setOfficeNumber(office: string, number: string) {
  numbers = numbers.map((n) => (n.office === office ? { ...n, number } : n));
  emit();
}
