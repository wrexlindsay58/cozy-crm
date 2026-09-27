export const STAGES = ["Sold", "Permit", "Materials", "Scheduled", "In progress", "Test-out", "Punch", "Invoiced", "Closed"] as const;

export type Stage = (typeof STAGES)[number];

export const HOLDS = ["HOA", "permit", "rebate", "customer", "weather", "finance"] as const;

export type Hold = (typeof HOLDS)[number];

export type HoldRow = { kind: Hold; note: string; at: string };

export const PROCESSES = ["Attic blow", "Attic removal", "HVAC set", "HVAC start-up", "Ducts", "Test-out", "Final inspection", "Punch", "Dump", "Callback"] as const;

export type Process = (typeof PROCESSES)[number] | string;

export const MEDIA_CATS = ["Before", "During", "After", "Serial", "Permit", "Design", "Other"] as const;

export type MediaCat = (typeof MEDIA_CATS)[number];

export const MEDIA_TAGS = ["Before", "During", "After", "Pre-install", "Access", "Existing", "Serial", "Issue", "Design", "Other"] as const;

export type MediaTag = (typeof MEDIA_TAGS)[number];

export function catFromTag(tag: string): MediaCat {
  if (tag === "Before" || tag === "Pre-install") return "Before";
  if (tag === "During") return "During";
  if (tag === "After") return "After";
  if (tag === "Serial") return "Serial";
  if (tag === "Design") return "Design";
  if (tag === "Permit") return "Permit";
  return "Other";
}

export type FileLink = { name: string; url: string };

export type ScopeMedia = {
  id: string;
  cat: MediaCat;
  name: string;
  url: string;
  kind: "photo" | "video" | "doc";
  caption?: string;
  purpose?: string;
};

export type ScopeKind = "product" | "adder" | "promise" | "discount";

export type PlanStatus = "Draft" | "Sent" | "Approved" | "Released";

export type ScopePlan = { status: PlanStatus; file?: FileLink; approvedBy: string };

export type UtilityPack = { form: string; status: "None" | "Submitted" | "Approved" | "PTO"; file?: FileLink };

export type BomLine = {
  id: string;
  name: string;
  estQty: number;
  usedQty: number;
  unit: string;
  unitCost: number;
  actualUnitCost?: number;
  supplier: string;
  ordered: boolean;
  received?: boolean;
  ready?: boolean;
  track?: "bulk" | "unit";
  orderQty?: number;
  leftQty?: number;
  returnQty?: number;
  returnCredit?: number;
  warehouseQty?: number;
};

export type SurveyRoom = { id: string; name: string; area: string; registers: string };

export type ScopeLine = {
  id: string;
  label: string;
  kind: ScopeKind;
  categoryId: string;
  amount: number;
  qty: number;
  notes: string;
  quotedCost: number;
  estHours: number;
  asBuiltQty?: number;
  media: ScopeMedia[];
  owner: string;
  promiseDone: boolean;
  plan?: ScopePlan;
  surveyDone?: boolean;
  surveySkip?: string;
  surveyFacts?: Record<string, string>;
  surveyRooms?: SurveyRoom[];
  surveyOn?: boolean;
  utility?: UtilityPack;
  bom: BomLine[];
};

export type AcceptNote = { id: string; text: string; state: "open" | "clear" | "asked"; question?: string; answer?: string };

export type Discrepancy = { id: string; lineId: string; what: string; how: "open" | "clarified" | "as-is" | "co"; note: string; coId?: string };

export type Acceptance = {
  reviewed: string[];
  rows?: string[];
  notes: AcceptNote[];
  discrepancies: Discrepancy[];
  surveyAsked?: boolean;
  by?: string;
  at?: string;
};

export function splitSoldNotes(text: string): AcceptNote[] {
  return text
    .split(/\n+|(?<=\.)\s+/)
    .map((part) => part.replace(/\.$/, "").trim())
    .filter(Boolean)
    .map((note, i) => ({ id: `N-${i + 1}`, text: note, state: "open" as const }));
}

export type CrewAssign = {
  id: string;
  crew: string;
  truck: string;
  vehicleKind?: string;
  vehicleNo?: string;
  trailerNo?: string;
  day: string;
  start: string;
  end: string;
  scopes: string[];
  kind: "internal" | "sub";
  company: string;
  woId?: string;
  inventory?: { checked: string[]; checkedBy?: Record<string, string>; signedBy?: string; signedAt?: string; signature?: string };
};

export type WoStatus = "Draft" | "Sent" | "Acked" | "Signed" | "On truck" | "Done";

export type FieldIssue = {
  id: string;
  type: "Shortage" | "Mismeasure" | "Injury" | "Customer" | "Install mistake" | "Extra work";
  note: string;
  by: string;
  at: string;
};

export const ISSUE_TYPES = ["Shortage", "Mismeasure", "Injury", "Customer", "Install mistake", "Extra work"] as const;
