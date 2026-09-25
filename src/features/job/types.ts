import type { Tone } from "@/lib/crm-data";

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
export type WorkOrder = {
  id: string;
  assignId?: string;
  status: WoStatus;
  day: string;
  crew: string;
  notes: string;
  file?: FileLink;
  ackedAt?: string;
  ackedBy?: string;
  signedAt?: string;
  signedBy?: string;
  since?: string;
};

export type JobEvent = {
  id: string;
  scopeId: string;
  process: string;
  day: string;
  start: string;
  end: string;
  crew: string;
  assignId?: string;
  why?: string;
  status: "Set" | "Dispatched" | "Done" | "No-show";
};

export type FieldIssue = {
  id: string;
  type: "Shortage" | "Mismeasure" | "Injury" | "Customer" | "Install mistake" | "Extra work";
  note: string;
  by: string;
  at: string;
};
export const ISSUE_TYPES = ["Shortage", "Mismeasure", "Injury", "Customer", "Install mistake", "Extra work"] as const;

export type TimePunch = {
  id: string;
  who: string;
  day: string;
  scopeId?: string;
  leftYard: string;
  onSite: string;
  complete: string;
  back: string;
};

export type PurchaseOrder = {
  id: string;
  vendor: string;
  amount: number;
  status: "Draft" | "Sent" | "Partial" | "Received" | "Closed";
  what: string;
  scopeId?: string;
  file?: FileLink;
  since?: string;
  receivedAmount?: number;
};
export type ChangeOrder = {
  id: string;
  why: string;
  amount: number;
  cost: number;
  status: "Draft" | "Sent" | "Approved" | "Declined";
  lane: "install" | "finance";
  signed: boolean;
  signedAt?: string;
  since?: string;
};
export type PayStatus = "Draft" | "Sent" | "Partial" | "Paid" | "Past due" | "NSF" | "Card declined" | "Void" | "Refunded";
export type JobPayment = { id: string; amount: number; at: string; how: string; status: PayStatus };
export type InvoiceLine = { id: string; label: string; amount: number; qty?: number };
export type JobInvoice = {
  id: string;
  kind: "Deposit" | "Progress" | "Final" | "Commission" | "Piece";
  amount: number;
  paid: number;
  status: PayStatus;
  file?: FileLink;
  payments: JobPayment[];
  party?: "customer" | "pay";
  who?: string;
  itemize?: boolean;
  lines?: InvoiceLine[];
  since?: string;
};

export type EquipRow = {
  id: string;
  name: string;
  model: string;
  serial: string;
  ahri: string;
  eta: string;
  status: "Quoted" | "Ordered" | "Received" | "Set";
  oldRecovered: boolean;
  scopeId?: string;
};
export type PunchItem = { id: string; item: string; owner: string; status: "Open" | "Done" };
export type CheckItem = { id: string; label: string; on: boolean; callout?: string; by?: string };
export type SignedCheck = { items: CheckItem[]; signedBy: string; signedAt: string; signature?: string; relation?: string; photos?: ScopeMedia[]; collectedBy?: string };
export type PermitFile = { number: string; city: string; inspection: string; result: "None" | "Scheduled" | "Pass" | "Fail"; file?: FileLink };
export type RebateFile = { utility: string; program: string; amount: number; status: "None" | "Reserved" | "Submitted" | "Approved" | "Paid"; reservation: string; file?: FileLink };
export type TestOut = {
  blowerBefore: string;
  blowerAfter: string;
  ductBefore: string;
  ductAfter: string;
  notes: string;
  facts?: Record<string, string>;
  checks?: Record<string, boolean>;
  results?: Record<string, "pass" | "fail">;
  by?: Record<string, string>;
  fixes?: Record<string, { ticketId?: string; eventId?: string; correctedByQc?: boolean }>;
};
export type SurveyKind = "hvac" | "ducts" | "attic" | "windows" | "other";
export type JobSurvey = {
  id: string;
  kind: SurveyKind;
  label: string;
  surveyDone?: boolean;
  surveyFacts?: Record<string, string>;
  surveyRooms?: SurveyRoom[];
  media: ScopeMedia[];
};
export type LoanStatus = "None" | "Received" | "Docs needed" | "Cancelled" | "NTP" | "Complete" | "Funded";
export type LoanFile = {
  vendor: "GoodLeap" | "Cash" | "Card";
  amount: number;
  dealerFee: number;
  term: number;
  rate: number;
  status: LoanStatus;
  notes: string;
  fundedAmount: number;
  paySentAt?: string;
  payReceivedAt?: string;
};
export type PacketPart = { id: string; label: string; on: boolean; file?: FileLink };
export type ClosingPacket = { sent: boolean; sentAt: string; signedBy?: string; signedAt?: string; parts: PacketPart[]; surveyId?: string };

export type CommRole = "Closer" | "Split" | "Setter";
export type CommShare = {
  id: string;
  who: string;
  role: CommRole;
  pct: number;
  paid: boolean;
};

export const SALES_FAULTS = ["Misquote", "Mismeasure", "Missed adder", "Free promise"] as const;
export type SalesFault = (typeof SALES_FAULTS)[number];
export const FIELD_EXTRAS = ["Material run", "Step-through", "Install issue", "Extra on site", "Wrong equipment"] as const;
export type FieldExtra = (typeof FIELD_EXTRAS)[number];
export type CostHit = {
  id: string;
  kind: "sales" | "field";
  reason: SalesFault | FieldExtra;
  amount: number;
  note: string;
  at: string;
};

export type LaborKind = "Hourly" | "Piece" | "Salary";
export type LaborLine = {
  id: string;
  who: string;
  crew?: string;
  kind: LaborKind;
  qty: number;
  rate: number;
  actual?: number;
  service?: string;
  added?: boolean;
};

export type JobFile = {
  jobId: string;
  personId: string;
  leadId: string;
  accountId: string;
  name: string;
  product: string;
  pm: string;
  closer: string;
  stage: Stage;
  holds: HoldRow[];
  sold: number;
  soldAt?: string;
  labor: number;
  laborLines?: LaborLine[];
  commission: number;
  commissions: CommShare[];
  costHits?: CostHit[];
  extras: number;
  crew: string;
  truck: string;
  window: string;
  assignments: CrewAssign[];
  soldNotes: string;
  acceptance?: Acceptance;
  scope: ScopeLine[];
  surveys?: JobSurvey[];
  cancelled?: boolean;
  cancelWhy?: string;
  cancelledAt?: string;
  warranty: boolean;
  loan: LoanFile;
  workOrders: WorkOrder[];
  pos: PurchaseOrder[];
  changeOrders: ChangeOrder[];
  invoices: JobInvoice[];
  events: JobEvent[];
  punch: PunchItem[];
  equipment: EquipRow[];
  checks: CheckItem[];
  punches: TimePunch[];
  access: string;
  permit: PermitFile;
  rebate: RebateFile;
  testOut: TestOut;
  preCheck: SignedCheck;
  postCheck: SignedCheck;
  packet: ClosingPacket;
  prep?: Record<string, Record<string, { scheduled?: boolean; confirmed?: boolean; by?: string }>>;
  issues?: FieldIssue[];
  installRev: number;
  financeRev: number;
};

export const CHAPTERS = ["sold", "ready", "crew", "prep", "inventory", "run", "quality", "money", "close"] as const;
export type Chapter = (typeof CHAPTERS)[number];
export function chapterFor(stage: Stage): Chapter {
  if (stage === "Sold") return "sold";
  if (stage === "Permit" || stage === "Materials") return "ready";
  if (stage === "Scheduled") return "crew";
  if (stage === "In progress" || stage === "Punch") return "run";
  if (stage === "Test-out") return "quality";
  if (stage === "Invoiced") return "money";
  return "close";
}

export function isAccepted(job: JobFile) {
  return Boolean(job.acceptance?.by);
}

export function acceptReady(job: JobFile) {
  const file = job.acceptance;
  if (!file || file.by) return false;
  const ids = file.rows?.length ? file.rows : job.scope.map((s) => s.id);
  if (!ids.length) return false;
  const linesOk = ids.every((id) => file.reviewed.includes(id) || file.discrepancies.some((d) => d.lineId === id && d.how !== "open"));
  const notesOk = file.notes.every((n) => n.state === "clear" || (n.state === "asked" && Boolean(n.answer?.trim())));
  const open = file.discrepancies.some((d) => d.how === "open");
  const unsigned = file.discrepancies.some((d) => d.how === "co" && !job.changeOrders.some((c) => c.id === d.coId && c.signed));
  return linesOk && notesOk && !open && !unsigned;
}

export function materialCost(j: JobFile) {
  return j.scope.reduce((s, sc) => s + sc.bom.reduce((b, l) => b + bomJobCost(l), 0), 0);
}
export function leftoverQty(l: BomLine) {
  const ordered = l.orderQty ?? l.estQty;
  return Math.max(0, ordered - (l.usedQty || 0));
}
export function bomJobCost(l: BomLine) {
  const paid = l.actualUnitCost ?? l.unitCost;
  const ordered = l.orderQty ?? l.estQty;
  const used = l.usedQty || 0;
  const returned = l.returnQty || 0;
  const warehoused = l.warehouseQty || 0;
  if (used > 0 || returned > 0 || warehoused > 0) {
    const onJob = used > 0 ? used : Math.max(0, ordered - returned - warehoused);
    return onJob * paid;
  }
  if (l.ordered) return ordered * paid;
  return l.estQty * l.unitCost;
}
export function bomReturnCredit(l: BomLine) {
  return l.returnCredit || 0;
}
export function bomWarehouseValue(l: BomLine) {
  return (l.warehouseQty || 0) * (l.actualUnitCost ?? l.unitCost);
}
export function bomAssumed(l: BomLine) {
  return l.estQty * l.unitCost;
}
export function bomOrderedCost(l: BomLine) {
  return (l.orderQty ?? l.estQty) * (l.actualUnitCost ?? l.unitCost);
}
export function quotedMaterials(j: JobFile) {
  return j.scope.reduce((s, sc) => s + sc.bom.reduce((b, l) => b + l.estQty * l.unitCost, 0), 0);
}

/** Quoted paid work. Adders in. Listed discounts and sales misses sit on True Discount, not here. */
export function commissionBase(j: JobFile) {
  return j.scope.filter((s) => s.kind === "product" || s.kind === "adder").reduce((s, r) => s + r.amount, 0) || j.sold;
}
export function trueDiscount(j: JobFile) {
  const listed = j.scope.filter((s) => s.kind === "discount" || s.amount < 0).reduce((s, r) => s + Math.abs(r.amount), 0);
  const salesHits = (j.costHits ?? []).filter((h) => h.kind === "sales").reduce((s, h) => s + h.amount, 0);
  const fieldHits = (j.costHits ?? []).filter((h) => h.kind === "field").reduce((s, h) => s + h.amount, 0);
  const dollars = listed + salesHits;
  const base = commissionBase(j);
  const pct = base ? (dollars / base) * 100 : 0;
  const deduction = Math.round((pct / 2.5) * 10) / 10;
  const rate = Math.max(0, Math.round((20 - deduction) * 10) / 10);
  return { listed, salesHits, fieldHits, dollars, pct, deduction, rate, base };
}
export function commissionCost(j: JobFile) {
  const td = trueDiscount(j);
  const shares = j.commissions ?? [];
  const closers = shares.filter((c) => c.role !== "Setter");
  const setters = shares.filter((c) => c.role === "Setter");
  const closerPool = Math.round(td.base * (td.rate / 100));
  const setterPay = setters.reduce((s, c) => s + Math.round(td.base * (c.pct / 100)), 0);
  if (!shares.length) return closerPool || j.commission;
  return (closers.length ? closerPool : 0) + setterPay;
}
export function contractTotal(j: JobFile) {
  return j.sold + j.changeOrders.filter((c) => c.lane !== "finance" && c.status === "Approved" && c.signed).reduce((s, c) => s + c.amount, 0);
}
export function agreementsSync(j: JobFile) {
  return j.installRev === j.financeRev;
}

export function processFor(label: string): string {
  const t = label.toLowerCase();
  if (t.includes("remov")) return "Attic removal";
  if (t.includes("attic") || t.includes("r-49") || t.includes("insul") || t.includes("cellulose")) return "Attic blow";
  if (t.includes("hvac") || t.includes("ton") || t.includes("condenser")) return "HVAC set";
  if (t.includes("duct") || t.includes("aero")) return "Ducts";
  return `Install · ${label}`;
}

export function punchHours(p: TimePunch) {
  function mins(a: string, b: string) {
    if (!a || !b) return 0;
    const [ah, am] = a.split(":").map(Number);
    const [bh, bm] = b.split(":").map(Number);
    return Math.max(0, bh * 60 + bm - (ah * 60 + am)) / 60;
  }
  const travel = mins(p.leftYard, p.onSite) + mins(p.complete, p.back);
  const site = mins(p.onSite, p.complete);
  return { travel, site, total: travel + site };
}

export function jobTone(job: Pick<JobFile, "stage" | "holds" | "cancelled">): Tone {
  if (job.cancelled) return "alert";
  if (job.holds.length) return "alert";
  if (job.stage === "Closed" || job.stage === "In progress") return "up";
  if (job.stage === "Punch" || job.stage === "Test-out" || job.stage === "Permit") return "alert";
  if (job.stage === "Materials" || job.stage === "Sold") return "muted";
  return "navy";
}

export function inferStage(j: JobFile): Stage {
  if (j.cancelled) return j.stage;
  if (j.stage === "Closed") return "Closed";
  const invoiced = j.invoices.some((i) => i.status !== "Draft" && i.status !== "Void");
  const punchOpen = j.punch.some((p) => p.status === "Open");
  const test = j.events.some((e) => e.process === "Test-out") || Number(j.testOut.blowerAfter) > 0;
  const inField = j.punches.some((p) => p.onSite) || j.events.some((e) => e.status === "Dispatched" || e.status === "Done");
  const scheduled = j.assignments.some((a) => a.day) || j.events.some((e) => e.status === "Set");
  const materials = j.pos.some((p) => p.status !== "Draft") || j.scope.some((s) => s.bom.some((b) => b.ordered));
  const permit = j.holds.some((h) => h.kind === "permit") || !!j.permit.number || j.checks.some((c) => c.id === "permit" && c.on);
  if (invoiced) return "Invoiced";
  if (punchOpen) return "Punch";
  if (test) return "Test-out";
  if (inField) return "In progress";
  if (scheduled) return "Scheduled";
  if (materials) return "Materials";
  if (permit) return "Permit";
  return "Sold";
}

export function closeBlocks(j: JobFile): string[] {
  const out: string[] = [];
  if (j.punch.some((p) => p.status === "Open")) out.push("Open punch");
  if (j.workOrders.some((w) => w.status !== "Signed" && w.status !== "Done" && w.status !== "On truck")) out.push("Work order not signed");
  if (j.loan.vendor === "GoodLeap" && j.loan.status !== "Funded") out.push("GoodLeap not funded");
  if (j.changeOrders.some((c) => c.lane !== "finance" && !c.signed)) out.push("Install CO not signed");
  if (j.changeOrders.some((c) => c.lane === "finance" && !c.signed)) out.push("GoodLeap CO not signed");
  if (j.scope.some((s) => s.plan && s.plan.status !== "Released" && s.kind === "product")) out.push("Plan not released");
  if (!j.preCheck.signedAt) out.push("Pre-install not signed");
  if (!j.postCheck.signedAt) out.push("Post-install not signed");
  return out;
}

export function defaultChecks(): CheckItem[] {
  return [
    { id: "permit", label: "Permit pulled", on: false },
    { id: "hoa", label: "HOA signed off", on: false },
    { id: "equip", label: "Equipment confirmed", on: false },
    { id: "dump", label: "Dump scheduled", on: false },
    { id: "test", label: "Test-out booked", on: false },
    { id: "photos", label: "Before/after photos in", on: false },
    { id: "rebate", label: "Rebate packet out", on: false },
    { id: "walk", label: "Homeowner walkthrough", on: false },
  ];
}

export function defaultPre(): SignedCheck {
  return {
    items: [
      { id: "access", label: "Access confirmed", on: false },
      { id: "hoa", label: "HOA / dumpster ok", on: false },
      { id: "pets", label: "Pets secured", on: false },
      { id: "scope", label: "Scope reviewed with homeowner", on: false },
      { id: "photos", label: "Existing photos on file", on: false },
      { id: "util", label: "Utilities located", on: false },
    ],
    signedBy: "",
    signedAt: "",
  };
}

export function defaultPost(): SignedCheck {
  return {
    items: [
      { id: "walk", label: "Walkthrough done", on: false },
      { id: "stat", label: "Thermostat shown", on: false },
      { id: "debris", label: "Debris hauled", on: false },
      { id: "serial", label: "Serials on file", on: false },
      { id: "test", label: "Test-out numbers in", on: false },
      { id: "warr", label: "Warranty explained", on: false },
    ],
    signedBy: "",
    signedAt: "",
  };
}

export function defaultPacket(): ClosingPacket {
  return {
    sent: false,
    sentAt: "",
    parts: [
      { id: "agreement", label: "Signed agreement" },
      { id: "inv", label: "Paid invoice" },
      { id: "warr", label: "Labor warranty" },
      { id: "serial", label: "Serials / AHRI" },
      { id: "photos", label: "Before & after" },
      { id: "care", label: "Care sheet" },
      { id: "rebate", label: "Rebate forms" },
      { id: "permit", label: "Permit final" },
    ].map((p) => ({ ...p, on: false })),
  };
}

export function emptyPermit(): PermitFile {
  return { number: "", city: "", inspection: "", result: "None" };
}
export function emptyRebate(): RebateFile {
  return { utility: "", program: "", amount: 0, status: "None", reservation: "" };
}
export function emptyTest(): TestOut {
  return { blowerBefore: "", blowerAfter: "", ductBefore: "", ductAfter: "", notes: "", facts: {}, checks: {} };
}
export function cashLoan(): LoanFile {
  return { vendor: "Cash", amount: 0, dealerFee: 0, term: 0, rate: 0, status: "None", notes: "", fundedAmount: 0 };
}
