import { useSyncExternalStore } from "react";

export type BomSeed = { name: string; qty: number; unit: string; unitCost: number };
export type ProdProfile = {
  id: string;
  label: string;
  on: boolean;
  needsPlan: boolean;
  planCustomerApproval: boolean;
  needsUtility: boolean;
  needsPermit: boolean;
  needsSerial: boolean;
  needsTestOut: boolean;
  unit: "sqft" | "each";
  supplier: string;
  process: string;
  bom: BomSeed[];
};

const seed: ProdProfile[] = [
  {
    id: "attic",
    label: "Attic",
    on: true,
    needsPlan: false,
    planCustomerApproval: false,
    needsUtility: false,
    needsPermit: false,
    needsSerial: false,
    needsTestOut: false,
    unit: "sqft",
    supplier: "Cameron Ashley",
    process: "Attic blow",
    bom: [
      { name: "Cellulose bag", qty: 42, unit: "bag", unitCost: 14 },
      { name: "Baffle", qty: 24, unit: "ea", unitCost: 3.2 },
    ],
  },
  {
    id: "hvac",
    label: "HVAC",
    on: true,
    needsPlan: false,
    planCustomerApproval: false,
    needsUtility: false,
    needsPermit: true,
    needsSerial: true,
    needsTestOut: true,
    unit: "each",
    supplier: "WinSupply",
    process: "HVAC set",
    bom: [
      { name: "4-ton condenser", qty: 1, unit: "ea", unitCost: 6200 },
      { name: "Coil", qty: 1, unit: "ea", unitCost: 2100 },
      { name: "Pad", qty: 1, unit: "ea", unitCost: 85 },
      { name: "Whip / disconnect", qty: 1, unit: "ea", unitCost: 120 },
    ],
  },
  {
    id: "ducts",
    label: "Ducts",
    on: true,
    needsPlan: true,
    planCustomerApproval: false,
    needsUtility: false,
    needsPermit: false,
    needsSerial: false,
    needsTestOut: true,
    unit: "each",
    supplier: "WinSupply",
    process: "Ducts",
    bom: [
      { name: '8" trunk 10\'', qty: 4, unit: "ea", unitCost: 38 },
      { name: '6" run 10\'', qty: 12, unit: "ea", unitCost: 18 },
      { name: "Boot", qty: 10, unit: "ea", unitCost: 9 },
      { name: "Collar", qty: 10, unit: "ea", unitCost: 4.5 },
    ],
  },
  {
    id: "solar",
    label: "Solar",
    on: true,
    needsPlan: true,
    planCustomerApproval: true,
    needsUtility: true,
    needsPermit: true,
    needsSerial: true,
    needsTestOut: true,
    unit: "each",
    supplier: "Solar distributor",
    process: "Solar set",
    bom: [
      { name: "Module", qty: 20, unit: "ea", unitCost: 280 },
      { name: "Inverter", qty: 1, unit: "ea", unitCost: 1800 },
    ],
  },
];

let rows = seed.map((p) => ({ ...p, bom: p.bom.map((b) => ({ ...b })) }));
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function snap() {
  return rows;
}
export function useProdProfiles() {
  return useSyncExternalStore((cb) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }, snap, snap);
}
export function profileById(id: string) {
  return rows.find((p) => p.id === id);
}
export function guessProfile(label: string) {
  const t = label.toLowerCase();
  if (t.includes("solar") || t.includes("pv")) return profileById("solar");
  if (t.includes("duct") || t.includes("aero")) return profileById("ducts");
  if (t.includes("hvac") || t.includes("ton") || t.includes("condenser")) return profileById("hvac");
  if (t.includes("attic") || t.includes("insul") || t.includes("r-")) return profileById("attic");
  return rows.find((p) => p.on);
}
export function toggleProfile(id: string) {
  rows = rows.map((p) => (p.id === id ? { ...p, on: !p.on } : p));
  emit();
}
export function patchProfile(id: string, row: Partial<ProdProfile>) {
  rows = rows.map((p) => (p.id === id ? { ...p, ...row } : p));
  emit();
}
export function addProfile(label: string) {
  const name = label.trim();
  if (!name) return;
  rows = [...rows, { id: `p-${Date.now()}`, label: name, on: true, needsPlan: false, planCustomerApproval: false, needsUtility: false, needsPermit: false, needsSerial: false, needsTestOut: false, unit: "each", supplier: "", process: `Install · ${name}`, bom: [] }];
  emit();
}
