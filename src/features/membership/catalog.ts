import { useSyncExternalStore } from "react";
import type { MemberPlan, PlanTerm, TermYears } from "./types";
import { TERMS } from "./types";

function terms(rows: [TermYears, number, number][]): PlanTerm[] {
  return rows.map(([years, prepaid, monthly]) => ({ years, prepaid, monthly }));
}

let plans: MemberPlan[] = [
  {
    id: "comfort",
    name: "Comfort",
    visitsPerYear: 2,
    continueMonthly: 39,
    included: ["Filter", "System check", "Drain"],
    repairDiscount: 10,
    terms: terms([
      [1, 348, 32],
      [2, 660, 30],
      [3, 936, 29],
      [5, 1500, 28],
      [7, 2016, 27],
      [10, 2760, 26],
    ]),
  },
  {
    id: "comfort-plus",
    name: "Comfort Plus",
    visitsPerYear: 2,
    continueMonthly: 59,
    included: ["Filter", "System check", "Drain", "Second filter"],
    repairDiscount: 15,
    terms: terms([
      [1, 588, 54],
      [2, 1104, 50],
      [3, 1584, 48],
      [5, 2520, 46],
      [7, 3360, 44],
      [10, 4560, 42],
    ]),
  },
];

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function snap() {
  return plans;
}

export function usePlans() {
  return useSyncExternalStore(subscribe, snap, snap);
}

export function planById(id: string) {
  return plans.find((p) => p.id === id) ?? plans[0];
}

export function termPrice(plan: MemberPlan, years: TermYears) {
  return plan.terms.find((t) => t.years === years) ?? plan.terms[0];
}

export function setRepairDiscount(planId: string, amount: number) {
  plans = plans.map((p) => (p.id === planId ? { ...p, repairDiscount: Math.min(100, Math.max(0, amount)) } : p));
  emit();
}

export function setIncluded(planId: string, text: string) {
  const included = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  plans = plans.map((p) => (p.id === planId ? { ...p, included } : p));
  emit();
}
export function setContinueRate(planId: string, amount: number) {
  plans = plans.map((p) => (p.id === planId ? { ...p, continueMonthly: Math.max(0, amount) } : p));
  emit();
}

export function setTermAmount(planId: string, years: TermYears, field: "prepaid" | "monthly", amount: number) {
  plans = plans.map((p) =>
    p.id === planId
      ? { ...p, terms: p.terms.map((t) => (t.years === years ? { ...t, [field]: Math.max(0, amount) } : t)) }
      : p,
  );
  emit();
}

export { TERMS };
