import { useSyncExternalStore } from "react";

export type AssessField = { id: string; label: string };
export type AssessCategory = { id: string; label: string; fields: AssessField[]; on: boolean };

const seed: AssessCategory[] = [
  { id: "hvac", label: "HVAC", on: true, fields: ["Brand", "Model", "Age", "Tonnage", "Condition"].map((label, i) => ({ id: `hvac-${i}`, label })) },
  { id: "attic", label: "Attic", on: true, fields: ["Current depth", "Type", "Target", "Hatch"].map((label, i) => ({ id: `attic-${i}`, label })) },
  { id: "air-seal", label: "Air sealing", on: true, fields: ["Leak notes"].map((label, i) => ({ id: `air-${i}`, label })) },
  { id: "ducts", label: "Ducts", on: true, fields: ["Material", "Condition"].map((label, i) => ({ id: `ducts-${i}`, label })) },
  { id: "windows", label: "Windows", on: true, fields: ["Count", "Condition"].map((label, i) => ({ id: `win-${i}`, label })) },
];

let rows: AssessCategory[] = seed.map((c) => ({ ...c, fields: c.fields.map((f) => ({ ...f })) }));
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function snap() {
  return rows;
}

export function useAssessCategories() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    snap,
    snap,
  );
}

export function activeCategories() {
  return rows.filter((c) => c.on);
}

export function addCategory(label: string) {
  const name = label.trim();
  if (!name) return;
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `cat-${rows.length + 1}`;
  if (rows.some((c) => c.id === id)) return;
  rows = [...rows, { id, label: name, fields: [], on: true }];
  emit();
}

export function toggleCategory(id: string) {
  rows = rows.map((c) => (c.id === id ? { ...c, on: !c.on } : c));
  emit();
}

export function addField(catId: string, label: string) {
  const name = label.trim();
  if (!name) return;
  rows = rows.map((c) =>
    c.id === catId ? { ...c, fields: [...c.fields, { id: `${c.id}-${c.fields.length}`, label: name }] } : c,
  );
  emit();
}
