import { useSyncExternalStore } from "react";

type Flag = { id: string; label: string; on: boolean };
type Row = { id: string; name: string; note: string };

let flags: Flag[] = [
  { id: "two-party", label: "Require both spouses on the run", on: true },
  { id: "dealer-fee-on-proposal", label: "Show dealer fee on proposal", on: true },
  { id: "hide-cost-crew", label: "Hide cost from crew by default", on: true },
];
let dealers: Row[] = [
  { id: "D-1", name: "Cozy Home Performance", note: "Phoenix + Scottsdale" },
  { id: "D-2", name: "Cozy Texas", note: "Dallas + Fort Worth" },
];
let discounts: Row[] = [
  { id: "C-1", name: "Veteran", note: "$500 off" },
  { id: "C-2", name: "Same-day close", note: "$250 off" },
];
let rebates: Row[] = [
  { id: "R-1", name: "APS attic", note: "Up to $250" },
  { id: "R-2", name: "Oncor air seal", note: "Utility paperwork" },
];
let extraCosts: Row[] = [
  { id: "X-1", name: "Permit", note: "Pass-through" },
  { id: "X-2", name: "Dump run", note: "Job extra" },
];
let productTypes: Row[] = [
  { id: "PT-1", name: "HVAC", note: "Equipment" },
  { id: "PT-2", name: "Envelope", note: "Attic / air seal" },
];
let makers: Row[] = [
  { id: "M-1", name: "Goodman", note: "HVAC" },
  { id: "M-2", name: "CertainTeed", note: "Insulation" },
];
let utilities: Row[] = [
  { id: "U-1", name: "APS", note: "Phoenix" },
  { id: "U-2", name: "Oncor", note: "Dallas" },
];
let taskCats: Row[] = [
  { id: "TC-1", name: "Follow-up", note: "Sales" },
  { id: "TC-2", name: "HOA packet", note: "Production" },
];
let stages: Row[] = [
  { id: "NS-1", name: "Booked", note: "Setter + closer" },
  { id: "NS-2", name: "Sold", note: "PM + owner" },
];
let workflows: Row[] = [
  { id: "W-1", name: "Attic assessment", note: "R-value, baffles, photos" },
  { id: "W-2", name: "HVAC assessment", note: "Tonnage, ducts, photos" },
];
let forms: Row[] = [
  { id: "F-1", name: "Start job", note: "Installation" },
  { id: "F-2", name: "Completion", note: "Installation" },
];
let crews: Row[] = [
  { id: "CR-1", name: "Crew A", note: "Truck 12 · Phoenix" },
  { id: "CR-2", name: "Crew B", note: "Truck 4 · Scottsdale" },
];
let positions: Row[] = [
  { id: "P-1", name: "Closer", note: "Can take card" },
  { id: "P-2", name: "PM", note: "Sees cost" },
];
let points: Row[] = [
  { id: "LB-1", name: "Sold", note: "10 pts" },
  { id: "LB-2", name: "Set that ran", note: "2 pts" },
];
let buckets: Row[] = [
  { id: "B-1", name: "Needs disposition", note: "Appointments" },
  { id: "B-2", name: "Proposal out", note: "Opportunities" },
];
let plans: Row[] = [
  { id: "RP-1", name: "Comfort", note: "$29 / mo" },
  { id: "RP-2", name: "Comfort Plus", note: "$49 / mo · 1 visit" },
];
let salesforce = { org: "", on: false };
let departments: Row[] = [
  { id: "DP-1", name: "Sales", note: "Setters + closers" },
  { id: "DP-2", name: "Production", note: "PMs + crews" },
];
let myTeam: Row[] = [
  { id: "MT-1", name: "Wrex Lindsay", note: "Sees Phoenix + Scottsdale" },
  { id: "MT-2", name: "Dana Ortiz", note: "Sees Scottsdale closers" },
];
let calFilters: Row[] = [
  { id: "CF-1", name: "My book", note: "Default tab" },
  { id: "CF-2", name: "Office", note: "Phoenix tab" },
];
let goals: Row[] = [
  { id: "G-1", name: "Phoenix sold", note: "12 / week" },
  { id: "G-2", name: "Sets that run", note: "80%" },
];
let installers: Row[] = [
  { id: "IN-1", name: "In-house Crew A", note: "Attic + HVAC" },
  { id: "IN-2", name: "Sub — Desert Air", note: "Overflow HVAC" },
];
let sections: Row[] = [
  { id: "S-1", name: "Property", note: "Assessment file" },
  { id: "S-2", name: "Qualifying", note: "Assessment file" },
];
let qualify: Row[] = [
  { id: "Q-1", name: "Credit pre-qualified", note: "Soft pull or verbal" },
  { id: "Q-2", name: "All owners will be there", note: "One-legger if no" },
  { id: "Q-3", name: "Homeowner or renter", note: "Who can sign" },
  { id: "Q-4", name: "In area", note: "We run this turf" },
  { id: "Q-5", name: "Pay", note: "Cash or finance" },
];
let notifyTemplates: Row[] = [
  { id: "NT-1", name: "Booked SMS", note: "You're on the book {day} {time}" },
  { id: "NT-2", name: "Sold SMS", note: "Welcome. PM will text next." },
];
let reduction: Row[] = [
  { id: "RI-1", name: "Attic install", note: "Baffles → blow → photos" },
  { id: "RI-2", name: "Air seal install", note: "Can lights → top plates" },
];
let pins: Row[] = [
  { id: "PN-1", name: "Home", note: "Canvass pin" },
  { id: "PN-2", name: "Not home", note: "Canvass pin" },
  { id: "PN-3", name: "Not interested", note: "Canvass pin" },
];
let dealership: Row[] = [
  { id: "DS-1", name: "Cozy Home Performance", note: "License · hours · logo later" },
];

let snap = pack();
const listeners = new Set<() => void>();
function pack() {
  return {
    flags, dealers, discounts, rebates, extraCosts, productTypes, makers, utilities,
    taskCats, stages, workflows, forms, crews, positions, points, buckets, plans, salesforce,
    departments, myTeam, calFilters, goals, installers, sections, qualify, notifyTemplates, reduction, pins, dealership,
  };
}
function emit() {
  snap = pack();
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useAdminSettings() {
  return useSyncExternalStore(subscribe, () => snap, () => snap);
}
export function toggleFlag(id: string) {
  flags = flags.map((f) => (f.id === id ? { ...f, on: !f.on } : f));
  emit();
}
export function addRow(bucket: keyof ReturnType<typeof pack>, name: string, note: string) {
  const n = name.trim();
  if (!n || bucket === "flags" || bucket === "salesforce") return;
  const list = snap[bucket] as Row[];
  const next = [...list, { id: `${bucket}-${list.length + 1}`, name: n, note: note.trim() }];
  if (bucket === "dealers") dealers = next;
  if (bucket === "discounts") discounts = next;
  if (bucket === "rebates") rebates = next;
  if (bucket === "extraCosts") extraCosts = next;
  if (bucket === "productTypes") productTypes = next;
  if (bucket === "makers") makers = next;
  if (bucket === "utilities") utilities = next;
  if (bucket === "taskCats") taskCats = next;
  if (bucket === "stages") stages = next;
  if (bucket === "workflows") workflows = next;
  if (bucket === "forms") forms = next;
  if (bucket === "crews") crews = next;
  if (bucket === "positions") positions = next;
  if (bucket === "points") points = next;
  if (bucket === "buckets") buckets = next;
  if (bucket === "plans") plans = next;
  if (bucket === "departments") departments = next;
  if (bucket === "myTeam") myTeam = next;
  if (bucket === "calFilters") calFilters = next;
  if (bucket === "goals") goals = next;
  if (bucket === "installers") installers = next;
  if (bucket === "sections") sections = next;
  if (bucket === "qualify") qualify = next;
  if (bucket === "notifyTemplates") notifyTemplates = next;
  if (bucket === "reduction") reduction = next;
  if (bucket === "pins") pins = next;
  if (bucket === "dealership") dealership = next;
  emit();
}
export function setSalesforce(org: string, on: boolean) {
  salesforce = { org, on };
  emit();
}
