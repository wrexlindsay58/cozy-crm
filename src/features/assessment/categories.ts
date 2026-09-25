import { useSyncExternalStore } from "react";

export type AssessFieldKind = "text" | "number" | "select" | "multi" | "pick";
export type AssessField = { id: string; label: string; kind: AssessFieldKind; options?: string[]; wide?: boolean };
export type AssessCategory = { id: string; label: string; fields: AssessField[]; on: boolean };

const YN = ["Yes", "No"];
const HVAC_BRANDS = ["Goodman", "Carrier", "Trane", "Lennox", "Rheem", "Ruud", "York", "Daikin", "Mitsubishi", "American Standard"];
const FILTERS = ["14x14", "14x20", "16x20", "16x25", "20x20", "20x25", "20x30"];
const HATCHES = ["Hall closet", "Garage", "Laundry", "Bedroom closet", "Ceiling", "Gable"];

function f(id: string, label: string, kind: AssessFieldKind, options?: string[], wide?: boolean): AssessField {
  return { id, label, kind, options, wide };
}

export function fieldCaption(field: { label: string; kind: AssessFieldKind }) {
  return field.kind === "multi" ? `${field.label} (select all)` : field.label;
}

const seed: AssessCategory[] = [
  {
    id: "attic",
    label: "Attic & insulation",
    on: true,
    fields: [
      f("attic-0", "Hatch location", "multi", HATCHES),
      f("attic-2", "Insulation type", "multi", ["Blown cellulose", "Fiberglass blown", "Fiberglass batts", "Spray foam", "None"]),
      f("attic-3", "Depth (in)", "number"),
      f("attic-4", "Coverage", "select", ["Complete", "Joists visible", "Bare", "Mixed"]),
      f("attic-5", "Baffles", "select", ["Yes", "No", "Partial"]),
      f("attic-6", "Can lights (count)", "number"),
      f("attic-7", "Knee walls", "select", YN),
      f("attic-8", "Roof deck", "select", ["OSB", "Plywood", "Skip sheathing", "Plank"]),
      f("attic-9", "Attic storage", "select", YN),
      f("air-0", "Top plates open", "select", YN),
      f("air-1", "Chimney chase", "select", YN),
      f("air-2", "Unsealed cans (count)", "number"),
      f("air-3", "Plumbing penetrations (count)", "number"),
      f("air-4", "Hatch weatherstrip", "select", YN),
      f("air-5", "Electrical penetrations (count)", "number"),
    ],
  },
  {
    id: "hvac",
    label: "HVAC",
    on: true,
    fields: [
      f("hvac-0", "System type", "select", ["Split", "Package", "Heat pump", "Dual fuel", "Mini-split"]),
      f("hvac-1", "Brand", "pick", HVAC_BRANDS),
      f("hvac-2", "Outdoor model", "text"),
      f("hvac-3", "Indoor model", "text"),
      f("hvac-4", "Serial", "text"),
      f("hvac-5", "Manufacture year", "number"),
      f("hvac-6", "Tonnage", "select", ["1.5", "2", "2.5", "3", "3.5", "4", "5"]),
      f("hvac-7", "Listed SEER", "number"),
      f("hvac-8", "Refrigerant", "select", ["R-22", "R-410A", "R-32", "R-454B"]),
      f("hvac-9", "Filter size", "pick", FILTERS),
      f("hvac-10", "Filter location", "multi", ["Wall", "Ceiling", "Return drop", "Air handler"]),
      f("hvac-11", "Return temp (°F)", "number"),
      f("hvac-12", "Supply temp (°F)", "number"),
      f("hvac-13", "Delta T (°F)", "number"),
      f("hvac-14", "Return static (in WC)", "number"),
      f("hvac-15", "Supply static (in WC)", "number"),
      f("hvac-16", "Breaker (A)", "select", ["15", "20", "30", "40", "50", "60"]),
      f("hvac-17", "Disconnect present", "select", YN),
    ],
  },
  {
    id: "ducts",
    label: "Ducts & airflow",
    on: true,
    fields: [
      f("ducts-0", "Material", "multi", ["Flex", "Rigid metal", "Duct board"]),
      f("ducts-1", "Location", "multi", ["Attic", "Crawl", "Conditioned", "Garage"]),
      f("ducts-2", "Supply registers (count)", "number"),
      f("ducts-3", "Return registers (count)", "number"),
      f("ducts-5", "Duct insulation (R)", "select", ["None", "R-4", "R-6", "R-8"]),
      f("ducts-6", "Disconnected runs (count)", "number"),
      f("ducts-7", "Boot leaks (count)", "number"),
      f("ducts-8", "Return CFM", "number"),
      f("ducts-9", "Supply CFM", "number"),
      f("ducts-10", "Condition", "multi", ["Kinked", "Sagging", "Crushed", "On the deck"]),
      f("ducts-11", "Jump ducts", "number"),
      f("ducts-12", "Transfer grilles", "number"),
    ],
  },
  {
    id: "windows",
    label: "Windows",
    on: true,
    fields: [
      f("win-0", "Count", "number"),
      f("win-6", "Window temperature (°F)", "number"),
      f("win-1", "Glazing", "select", ["Single", "Double", "Triple"]),
      f("win-2", "Frame", "multi", ["Vinyl", "Aluminum", "Wood", "Fiberglass"]),
      f("win-3", "U-factor (if labeled)", "text"),
      f("win-4", "Failed seals (count)", "number"),
      f("win-5", "Won't operate (count)", "number"),
    ],
  },
];

let rows: AssessCategory[] = seed.map((c) => ({ ...c, fields: c.fields.map((f) => ({ ...f, options: f.options ? [...f.options] : undefined })) }));
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
    c.id === catId ? { ...c, fields: [...c.fields, { id: `${c.id}-${c.fields.length}`, label: name, kind: "text" as const }] } : c,
  );
  emit();
}