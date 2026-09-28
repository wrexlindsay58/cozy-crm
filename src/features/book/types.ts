export const BOOK_TYPES = [
  "Sales",
  "Assessment",
  "Callback",
  "Ride-along",
  "Install",
  "Pre-install",
  "Service",
  "Warranty",
  "Go-back",
  "Test-out",
  "Punch",
  "Dump",
  "Permit",
  "Inspection",
  "Materials",
  "Membership",
  "Office",
  "Training",
  "Time-off",
  "Block",
  "Open",
] as const;
export type BookType = (typeof BOOK_TYPES)[number];
export const BOOK_STATUSES = ["Set", "Confirmed", "Dispatched", "Done", "No-run", "No-show"] as const;
export type BookStatus = (typeof BOOK_STATUSES)[number];
export const BOOK_DISPOSITIONS = ["Unmarked", "Set", "Confirmed", "Dispatched", "Ran", "Done", "No-run", "No-show", "One legger", "Missed"] as const;
export type BookFamily = "sales" | "production" | "shop";

export type BookLink = { id: string; label: string; url: string };

export type BookProduct = { label: string; notes: string; qty: number };

export type BookEvent = {
  id: string;
  type: BookType;
  status: BookStatus;
  title: string;
  personId: string;
  jobId: string;
  href: string;
  resourceId: string;
  crewId: string;
  techId: string;
  assigneeId: string;
  office: "PHX" | "DFW";
  start: string;
  end: string;
  city: string;
  notes: string;
  setBy: string;
  scope: string;
  leadSource: string;
  products: BookProduct[];
  internal: boolean;
  woSigned: boolean;
  hold: boolean;
  blank: boolean;
  links: BookLink[];
  source: "appointment" | "job" | "visit" | "shop";
  sourceId: string;
  result?: string;
  resultNote?: string;
  visit?: "" | "in-person" | "phone";
  visitWhy?: string;
  visitNote?: string;
};

export function familyOf(t: BookType): BookFamily {
  if (t === "Sales" || t === "Assessment" || t === "Callback" || t === "Ride-along") return "sales";
  if (t === "Office" || t === "Training" || t === "Time-off" || t === "Block" || t === "Materials" || t === "Open") return "shop";
  return "production";
}

export function assignedIds(e: { resourceId: string; crewId?: string; techId?: string; assigneeId?: string }) {
  return Array.from(new Set([e.resourceId, e.crewId ?? "", e.techId ?? "", e.assigneeId ?? ""].filter(Boolean)));
}

export function needsResult(t: BookType) {
  return familyOf(t) !== "shop";
}

export function isResulted(status: BookStatus) {
  return status === "Done" || status === "No-run" || status === "No-show";
}

export function isWatch(e: BookEvent) {
  if (e.status === "No-run" || e.status === "No-show") return true;
  if (familyOf(e.type) === "production" && !e.woSigned && e.status !== "Done") return true;
  if (e.hold) return true;
  return false;
}

export function mapStatus(raw: string): BookStatus {
  if (raw === "Confirmed" || raw === "Install" || raw === "Ran") return raw === "Ran" ? "Done" : "Confirmed";
  if (raw === "Done") return "Done";
  if (raw === "No sit" || raw === "No run" || raw === "No-sit" || raw === "No-run") return "No-run";
  if (raw === "Missed" || raw === "No-show") return "No-show";
  if (raw === "Dispatched") return "Dispatched";
  return "Set";
}

export function mapType(raw?: string): BookType {
  if (!raw) return "Sales";
  if ((BOOK_TYPES as readonly string[]).includes(raw)) return raw as BookType;
  if (raw === "Attic blow" || raw === "Attic removal" || raw === "HVAC set" || raw === "Ducts" || raw === "Solar set") return "Install";
  if (raw === "HVAC start-up" || raw === "Final inspection") return "Inspection";
  return "Install";
}
