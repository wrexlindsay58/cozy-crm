import { useSyncExternalStore } from "react";
import { reps } from "@/lib/crm-data";

export type PayKind = "Hourly" | "Piece" | "Salary";
export type Person = {
  name: string;
  role: string;
  office: string;
  active: boolean;
  sold: number;
  payKind: PayKind;
  rate: number;
  pieceRates?: Record<string, number>;
};

export const VEHICLE_KINDS = ["Box Truck", "Van", "Van and Trailer", "Pickup and Trailer", "Pickup", "Trailer"] as const;
export type VehicleKind = (typeof VEHICLE_KINDS)[number];
export type CrewVehicle = { kind: VehicleKind; number: string; trailer?: string };
export type ShopCrew = { name: string; members: string[]; vehicle: CrewVehicle };

export function needsTrailerNo(kind: string) {
  return kind === "Van and Trailer" || kind === "Pickup and Trailer";
}
export function vehicleLabel(kind: string, number: string, trailer?: string) {
  if (needsTrailerNo(kind)) {
    const head = kind.replace(" and Trailer", "");
    return `${head} ${number || "—"}${trailer ? ` + Trailer ${trailer}` : ""}`;
  }
  return `${kind} ${number || "—"}`;
}
export function vehicleMissing(kind: string, number: string, trailer?: string) {
  if (!number.trim()) return true;
  if (kind === "Pickup and Trailer" && !trailer?.trim()) return true;
  if (needsTrailerNo(kind) && !trailer?.trim()) return true;
  return false;
}

export const SHOP_CREWS: ShopCrew[] = [
  { name: "Crew 1 — Evan", members: ["Evan Cole", "Luis Cruz"], vehicle: { kind: "Van", number: "2" } },
  { name: "Crew 2 — Tasha", members: ["Tasha Reed", "Omar Diaz"], vehicle: { kind: "Box Truck", number: "4" } },
  { name: "Crew 3 — Marco", members: ["Rico Marquez", "Sam Patel"], vehicle: { kind: "Pickup and Trailer", number: "7", trailer: "3" } },
];

export type PermKey = "seeCost" | "takeCard" | "editCatalog";
export type RolePerms = Record<string, Record<PermKey, boolean>>;

function seedPay(role: string, name: string): { payKind: PayKind; rate: number; pieceRates?: Record<string, number> } {
  if (name === "Omar Diaz") {
    return {
      payKind: "Piece",
      rate: 185,
      pieceRates: { "Attic blow": 185, "Attic removal": 210, "HVAC set": 450, "Ducts": 275, "Test-out": 90 },
    };
  }
  if (name === "Tasha Reed") return { payKind: "Hourly", rate: 32 };
  if (role === "Crew") return { payKind: "Hourly", rate: 28 };
  if (role === "PM") return { payKind: "Salary", rate: 240 };
  return { payKind: "Salary", rate: 0 };
}

const seedPeople: Person[] = [
  ...reps.map((r) => ({
    name: r.name,
    role: r.role,
    office: r.office,
    active: true,
    sold: r.sold,
    ...seedPay(r.role, r.name),
  })),
  { name: "Tasha Reed", role: "PM", office: "Scottsdale", active: true, sold: 0, ...seedPay("PM", "Tasha Reed") },
  { name: "Evan Cole", role: "PM", office: "Phoenix", active: true, sold: 0, ...seedPay("PM", "Evan Cole") },
  { name: "Omar Diaz", role: "Crew", office: "Phoenix", active: true, sold: 0, ...seedPay("Crew", "Omar Diaz") },
  { name: "Luis Cruz", role: "Crew", office: "Phoenix", active: true, sold: 0, ...seedPay("Crew", "Luis Cruz") },
  { name: "Rico Marquez", role: "Crew", office: "Dallas", active: true, sold: 0, ...seedPay("Crew", "Rico Marquez") },
  { name: "Sam Patel", role: "Crew", office: "Dallas", active: true, sold: 0, ...seedPay("Crew", "Sam Patel") },
];

const seedPerms: RolePerms = {
  Owner: { seeCost: true, takeCard: true, editCatalog: true },
  Closer: { seeCost: true, takeCard: true, editCatalog: false },
  Setter: { seeCost: false, takeCard: false, editCatalog: false },
  PM: { seeCost: true, takeCard: false, editCatalog: false },
  Crew: { seeCost: false, takeCard: false, editCatalog: false },
};

let people = seedPeople.map((p) => ({ ...p }));
let perms: RolePerms = Object.fromEntries(Object.entries(seedPerms).map(([k, v]) => [k, { ...v }]));
let viewAs = "Owner";
let sources = ["Canvass", "Google", "Website", "Referral", "Partner"];
let dispositions = ["Unmarked", "No sit", "One legger", "Sold", "Confirmed"];
let ticketCats = ["Permit", "HOA", "Material", "Callback", "Warranty"];
let territories = [
  { id: "T-PHX", name: "West Valley", zips: "85388, 85374, 85379" },
  { id: "T-SCT", name: "Scottsdale", zips: "85258, 85259, 85260, 85254" },
  { id: "T-DAL", name: "Dallas core", zips: "75204, 75205, 75246" },
];
let departments = ["Closers", "Setters", "Production", "Phoenix office", "Scottsdale office", "Dallas office"];

const listeners = new Set<() => void>();
let snap = pack();
function pack() {
  return { people, perms, viewAs, sources, dispositions, ticketCats, territories, departments };
}
function emit() {
  snap = pack();
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useStaff() {
  return useSyncExternalStore(subscribe, () => snap, () => snap);
}
export function namesIn(...roles: string[]) {
  return people.filter((p) => p.active && roles.includes(p.role)).map((p) => p.name);
}
export function activeClosers() {
  return namesIn("Closer", "Owner");
}
export function canSeeCost(role = viewAs) {
  return Boolean(perms[role]?.seeCost);
}
export function patchPerson(name: string, patch: Partial<Person>) {
  people = people.map((p) => (p.name === name ? { ...p, ...patch } : p));
  emit();
}
export function setPerm(role: string, key: PermKey, on: boolean) {
  perms = { ...perms, [role]: { ...perms[role], [key]: on } };
  emit();
}
export function setViewAs(role: string) {
  viewAs = role;
  emit();
}
export function addSource(name: string) {
  const n = name.trim();
  if (!n || sources.includes(n)) return;
  sources = [...sources, n];
  emit();
}
export function addDisposition(name: string) {
  const n = name.trim();
  if (!n || dispositions.includes(n)) return;
  dispositions = [...dispositions, n];
  emit();
}
export function addTicketCat(name: string) {
  const n = name.trim();
  if (!n || ticketCats.includes(n)) return;
  ticketCats = [...ticketCats, n];
  emit();
}
export function addTerritory(name: string, zips: string) {
  const n = name.trim();
  if (!n) return;
  territories = [...territories, { id: `T-${territories.length + 1}`, name: n, zips }];
  emit();
}
export function addDepartment(name: string) {
  const n = name.trim();
  if (!n || departments.includes(n)) return;
  departments = [...departments, n];
  emit();
}
export function payFor(name: string, service = "") {
  const p = people.find((r) => r.name === name);
  const kind = p?.payKind ?? "Hourly";
  if (kind === "Piece") {
    const rate = (service && p?.pieceRates?.[service]) || p?.rate || 185;
    return { kind, rate };
  }
  return { kind, rate: p?.rate ?? 28 };
}
export function crewOf(name: string) {
  return SHOP_CREWS.find((c) => c.members.includes(name))?.name ?? "";
}
export function membersOf(crew: string) {
  return SHOP_CREWS.find((c) => c.name === crew)?.members ?? [];
}
export const PAY_KINDS: PayKind[] = ["Hourly", "Piece", "Salary"];
export const ROLES = ["Owner", "Closer", "Setter", "PM", "Crew"];
export const OFFICES = ["Phoenix", "Scottsdale", "Dallas", "Fort Worth", "North Phoenix"];
