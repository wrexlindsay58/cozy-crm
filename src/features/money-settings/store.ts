import { useSyncExternalStore } from "react";

export type PayMethodKind = "cash" | "card" | "ach" | "finance";
export type FinancePlan = { months: number; apr: number; feePct: number };
export type Financer = {
  id: string;
  name: string;
  feePct: number;
  active: boolean;
  kind: PayMethodKind;
  terms: number[];
  plans?: FinancePlan[];
};
export type Term = { id: string; name: string; schedule: string };
export type FromNumber = { office: string; number: string };
export type FromEmail = { office: string; email: string };

let dealerFeePct = 5;
let commissionPct = 10;
let financers: Financer[] = [
  { id: "F-cash", name: "Cash", feePct: 0, active: true, kind: "cash", terms: [] },
  { id: "F-card", name: "Card", feePct: 2.9, active: true, kind: "card", terms: [] },
  { id: "F-ach", name: "ACH", feePct: 0, active: true, kind: "ach", terms: [] },
  { id: "F-1", name: "GoodLeap", feePct: 12.5, active: true, kind: "finance", terms: [60, 120, 144, 180], plans: [
    { months: 60, apr: 9.99, feePct: 4.5 },
    { months: 60, apr: 6.99, feePct: 8 },
    { months: 120, apr: 9.99, feePct: 7.5 },
    { months: 120, apr: 6.99, feePct: 12.5 },
    { months: 120, apr: 3.99, feePct: 17.9 },
    { months: 144, apr: 8.99, feePct: 11 },
    { months: 144, apr: 5.99, feePct: 16.5 },
    { months: 180, apr: 9.99, feePct: 13 },
    { months: 180, apr: 6.99, feePct: 18.5 },
  ] },
  { id: "F-3", name: "12-month in house", feePct: 0, active: true, kind: "finance", terms: [12], plans: [{ months: 12, apr: 0, feePct: 0 }] },
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
  { office: "Dallas", number: "(214) 555-0100" },
  { office: "Fort Worth", number: "(817) 555-0100" },
];
let emails: FromEmail[] = [
  { office: "Phoenix", email: "phoenix@cozyhome.com" },
  { office: "Scottsdale", email: "scottsdale@cozyhome.com" },
  { office: "Dallas", email: "dallas@cozyhome.com" },
];

let snap = pack();
const listeners = new Set<() => void>();
function pack() {
  return { dealerFeePct, commissionPct, financers, terms, templates, notify, reminderMin, numbers, emails };
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

export function activePayMethods() {
  return financers.filter((f) => f.active);
}

export function payMethod(idOrName: string) {
  return financers.find((f) => f.id === idOrName || f.name === idOrName);
}

export function setMethodFee(id: string, n: number) {
  const feePct = Math.max(0, Math.min(20, n));
  financers = financers.map((f) => (f.id === id ? { ...f, feePct } : f));
  const good = financers.find((f) => f.name === "GoodLeap");
  if (good) dealerFeePct = good.feePct;
  emit();
}

export function setMethodPlans(id: string, plans: FinancePlan[]) {
  const next = plans
    .filter((p) => p.months > 0 && p.months <= 360 && p.apr >= 0 && p.apr <= 40)
    .map((p) => ({ months: p.months, apr: Math.round(p.apr * 100) / 100, feePct: Math.max(0, Math.min(40, p.feePct)) }))
    .sort((a, b) => a.months - b.months || a.apr - b.apr);
  const terms = [...new Set(next.map((p) => p.months))];
  financers = financers.map((f) => (f.id === id ? { ...f, plans: next, terms } : f));
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

export function getFromNumbers() {
  return numbers;
}

export function getFromEmails() {
  return emails;
}
