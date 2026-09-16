export const BOOK_TYPES = ["Sales", "Assessment", "Callback", "Install", "Service", "Warranty", "Go-back", "Test-out", "Punch", "Dump", "Office"] as const;
export type BookType = (typeof BOOK_TYPES)[number];
export const BOOK_STATUSES = ["Set", "Confirmed", "Dispatched", "Done", "No-sit", "No-show"] as const;
export type BookStatus = (typeof BOOK_STATUSES)[number];
export type BookFamily = "sales" | "production" | "shop";

export type BookEvent = {
  id: string;
  type: BookType;
  status: BookStatus;
  title: string;
  personId: string;
  jobId: string;
  href: string;
  resourceId: string;
  office: "PHX" | "DFW";
  start: string;
  end: string;
  city: string;
  notes: string;
  setBy: string;
  scope: string;
  internal: boolean;
  woSigned: boolean;
  hold: boolean;
  source: "appointment" | "job" | "visit" | "shop";
  sourceId: string;
};

export function familyOf(t: BookType): BookFamily {
  if (t === "Office") return "shop";
  if (t === "Sales" || t === "Assessment" || t === "Callback") return "sales";
  return "production";
}

export function isWatch(e: BookEvent) {
  if (e.status === "No-sit" || e.status === "No-show") return true;
  if (familyOf(e.type) === "production" && !e.woSigned && e.status !== "Done") return true;
  if (e.hold) return true;
  return false;
}

export function mapStatus(raw: string): BookStatus {
  if (raw === "Confirmed" || raw === "Install") return "Confirmed";
  if (raw === "Ran" || raw === "Done") return "Done";
  if (raw === "No sit") return "No-sit";
  if (raw === "Missed" || raw === "No-show") return "No-show";
  if (raw === "Dispatched") return "Dispatched";
  return "Set";
}

export function mapType(raw?: string): BookType {
  if (!raw) return "Sales";
  if ((BOOK_TYPES as readonly string[]).includes(raw)) return raw as BookType;
  if (raw === "Attic blow" || raw === "Attic removal" || raw === "HVAC set" || raw === "Ducts" || raw === "Solar set") return "Install";
  if (raw === "HVAC start-up" || raw === "Final inspection") return "Test-out";
  return "Install";
}
