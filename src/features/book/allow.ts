import type { Resource } from "./roster";
import { familyOf, type BookType } from "./types";

export function canTake(type: BookType, r: Resource) {
  if (!r.id) return false;
  if (type === "Block" || type === "Time-off") return r.kind !== "crew";
  const fam = familyOf(type);
  if (fam === "sales") return r.kind === "closer" || r.kind === "setter" || r.role === "Owner";
  if (fam === "production") return r.kind === "crew" || r.role === "PM" || r.role === "Crew";
  return r.kind !== "crew";
}
