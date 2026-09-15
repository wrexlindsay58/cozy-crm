import { useSyncExternalStore } from "react";
import { reps } from "@/lib/crm-data";

export type Person = {
  name: string;
  role: string;
  office: string;
  active: boolean;
  sold: number;
};

export type PermKey = "seeCost" | "takeCard" | "editCatalog";
export type RolePerms = Record<string, Record<PermKey, boolean>>;

const seedPeople: Person[] = reps.map((r) => ({
  name: r.name,
  role: r.role,
  office: r.office,
  active: true,
  sold: r.sold,
}));

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
let dispositions = ["Unmarked", "No sit", "One legger", "Sold", "Set, no run"];
let ticketCats = ["Permit", "HOA", "Material", "Callback", "Warranty"];
let territories = [
  { id: "T-PHX", name: "West Valley", zips: "85388, 85374, 85379" },
  { id: "T-SCT", name: "Scottsdale", zips: "85258, 85259, 85260, 85254" },
  { id: "T-DAL", name: "Dallas core", zips: "75204, 75205, 75246" },
];

const listeners = new Set<() => void>();
let snap = pack();
function pack() {
  return { people, perms, viewAs, sources, dispositions, ticketCats, territories };
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
export function activeClosers() {
  return people.filter((p) => p.active && (p.role === "Closer" || p.role === "Owner")).map((p) => p.name);
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
export const ROLES = ["Owner", "Closer", "Setter", "PM", "Crew"];
export const OFFICES = ["Phoenix", "Scottsdale", "Dallas", "Fort Worth", "North Phoenix"];
