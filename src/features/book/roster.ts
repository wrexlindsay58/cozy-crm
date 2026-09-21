import { useMemo } from "react";
import { useStaff } from "@/features/staff/store";

export type ResourceKind = "closer" | "setter" | "crew" | "office";
export type Resource = {
  id: string;
  name: string;
  kind: ResourceKind;
  office: "PHX" | "DFW";
  role: string;
};

export const CREW_RESOURCES: Resource[] = [
  { id: "crew-tasha", name: "Crew 2 — Tasha", kind: "crew", office: "PHX", role: "Crew" },
  { id: "crew-evan", name: "Crew 1 — Evan", kind: "crew", office: "PHX", role: "Crew" },
  { id: "crew-marco", name: "Crew 3 — Marco", kind: "crew", office: "PHX", role: "Crew" },
  { id: "crew-dallas", name: "Crew 3 — Dallas", kind: "crew", office: "DFW", role: "Crew" },
];

export const UNASSIGNED: Resource = { id: "", name: "Unassigned", kind: "office", office: "PHX", role: "Office" };

function officeOf(o: string): "PHX" | "DFW" {
  return /dallas|fort worth|dfw/i.test(o) ? "DFW" : "PHX";
}
function kindOf(role: string): ResourceKind {
  if (role === "Setter") return "setter";
  if (role === "Crew" || role === "PM") return "crew";
  if (role === "Owner") return "office";
  return "closer";
}
function slug(name: string) {
  return name.toLowerCase().split(" ")[0] || name;
}

export function personResource(name: string, role: string, office: string): Resource {
  return { id: slug(name), name, kind: kindOf(role), office: officeOf(office), role };
}

export function useRoster(): Resource[] {
  const { people } = useStaff();
  return useMemo(() => {
    const peopleRows = people.filter((p) => p.active).map((p) => personResource(p.name, p.role, p.office));
    const names = new Set(peopleRows.map((r) => r.name));
    const crews = CREW_RESOURCES.filter((c) => !names.has(c.name));
    return [...peopleRows, ...crews];
  }, [people]);
}

export function resourceIdFor(name: string, roster: Resource[]) {
  if (!name.trim()) return "";
  const hit = roster.find((r) => r.name === name || r.name.includes(name) || name.includes(r.name));
  if (hit) return hit.id;
  const first = name.toLowerCase().split(/[\s—-]/)[0];
  return roster.find((r) => r.id === first || r.name.toLowerCase().startsWith(first))?.id ?? "";
}

export function hoursFor(rows: Resource[]) {
  const crew = rows.some((r) => r.kind === "crew");
  const out: number[] = [];
  if (crew) {
    for (let h = 6; h < 21; h += 1) out.push(h);
    return out;
  }
  for (let h = 8; h < 21; h += 1) out.push(h);
  return out;
}
