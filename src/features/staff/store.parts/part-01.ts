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
export type EmployeeAct = { at: string; employee: string; personId: string; what: string };
export type PermKey = "seeCost" | "takeCard" | "editCatalog" | "overrideFee";
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
  Owner: { seeCost: true, takeCard: true, editCatalog: true, overrideFee: true },
  Closer: { seeCost: true, takeCard: true, editCatalog: false, overrideFee: false },
  Setter: { seeCost: false, takeCard: false, editCatalog: false, overrideFee: false },
  PM: { seeCost: true, takeCard: false, editCatalog: false, overrideFee: false },
  Crew: { seeCost: false, takeCard: false, editCatalog: false, overrideFee: false },
};
export let people = seedPeople.map((p) => ({ ...p }));
export let perms: RolePerms = Object.fromEntries(Object.entries(seedPerms).map(([k, v]) => [k, { ...v }]));
export let viewAs = "Owner";
export let actorName = "Wrex Lindsay";
export let employeeLog: EmployeeAct[] = [];
export let sources = ["Canvass", "Google", "Website", "Referral", "Partner"];
export let dispositions = ["Unmarked", "No sit", "One legger", "Sold", "Confirmed"];
export let ticketCats = ["Permit", "HOA", "Material", "Callback", "Warranty"];
export let territories = [
  { id: "T-PHX", name: "West Valley", zips: "85388, 85374, 85379" },
  { id: "T-SCT", name: "Scottsdale", zips: "85258, 85259, 85260, 85254" },
  { id: "T-DAL", name: "Dallas core", zips: "75204, 75205, 75246" },
];
export let departments = ["Closers", "Setters", "Production", "Phoenix office", "Scottsdale office", "Dallas office"];
const listeners = new Set<() => void>();
let snap = pack();
function pack() {
  return { people, perms, viewAs, actorName, employeeLog, sources, dispositions, ticketCats, territories, departments };
}
export function emit() {
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
export const PAY_KINDS: PayKind[] = ["Hourly", "Piece", "Salary"];
export function write_departments(__v: any) { departments = __v; }
export function write_people(__v: any) { people = __v; }
export function write_perms(__v: any) { perms = __v; }
export function write_viewAs(__v: any) { viewAs = __v; }
export function write_actorName(__v: any) { actorName = __v; }
export function write_employeeLog(__v: any) { employeeLog = __v; }
export function write_sources(__v: any) { sources = __v; }
export function write_dispositions(__v: any) { dispositions = __v; }
export function write_ticketCats(__v: any) { ticketCats = __v; }
export function write_territories(__v: any) { territories = __v; }
