import { SHOP_CREWS, people, perms, viewAs, actorName, employeeLog, sources, dispositions, ticketCats, territories, departments, emit, type Person, type PermKey, write_departments, write_people, write_perms, write_actorName, write_viewAs, write_employeeLog, write_sources, write_dispositions, write_ticketCats, write_territories } from "./part-01";

export function canSeeCost(role = viewAs) {
  return Boolean(perms[role]?.seeCost);
}

export function canOverrideFee(role = viewAs) {
  return Boolean(perms[role]?.overrideFee);
}

export function feeApprover() {
  return people.find((p) => p.active && p.role === "Owner")?.name ?? "Wrex Lindsay";
}

export function patchPerson(name: string, patch: Partial<Person>) {
  write_people(people.map((p) => (p.name === name ? { ...p, ...patch } : p)));
  emit();
}

export function setPerm(role: string, key: PermKey, on: boolean) {
  write_perms({ ...perms, [role]: { ...perms[role], [key]: on } });
  emit();
}

export function isEmployee(name: string) {
  return people.some((p) => p.name === name);
}

export function actingName() {
  return actorName;
}

export function setActor(name: string) {
  const person = people.find((p) => p.name === name && p.active);
  if (!person) return;
  write_actorName(person.name);
  write_viewAs(person.role);
  emit();
}

export function logEmployeeAct(personId: string, employee: string, what: string) {
  if (!personId || !employee || !isEmployee(employee)) return;
  write_employeeLog([{ at: new Date().toLocaleString(), employee, personId, what }, ...employeeLog].slice(0, 500));
  emit();
}

export function dropLatestEmployeeAct(personId: string, what: string) {
  const index = employeeLog.findIndex((row) => row.personId === personId && row.what === what);
  if (index < 0) return;
  write_employeeLog(employeeLog.filter((_, i) => i !== index));
  emit();
}

export function addSource(name: string) {
  const n = name.trim();
  if (!n || sources.includes(n)) return;
  write_sources([...sources, n]);
  emit();
}

export function addDisposition(name: string) {
  const n = name.trim();
  if (!n || dispositions.includes(n)) return;
  write_dispositions([...dispositions, n]);
  emit();
}

export function addTicketCat(name: string) {
  const n = name.trim();
  if (!n || ticketCats.includes(n)) return;
  write_ticketCats([...ticketCats, n]);
  emit();
}

export function addTerritory(name: string, zips: string) {
  const n = name.trim();
  if (!n) return;
  write_territories([...territories, { id: `T-${territories.length + 1}`, name: n, zips }]);
  emit();
}

export function addDepartment(name: string) {
  const n = name.trim();
  if (!n || departments.includes(n)) return;
  write_departments([...departments, n]);
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

export const ROLES = ["Owner", "Closer", "Setter", "PM", "Crew"];

export const OFFICES = ["Phoenix", "Scottsdale", "Dallas", "Fort Worth", "North Phoenix"];
