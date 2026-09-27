import type { Stage, HoldRow, BomLine, ScopeLine, Acceptance, CrewAssign, FieldIssue } from "../part-01";
import type { WorkOrder, JobEvent, TimePunch, PurchaseOrder, ChangeOrder, JobInvoice, EquipRow, PunchItem, CheckItem, SignedCheck, PermitFile, RebateFile, TestOut, JobSurvey, LoanFile, PacketPart } from "../part-02";
import { bomJobCost } from "../part-04";

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

export function bomReturnCredit(l: BomLine) {
  return l.returnCredit || 0;
}

export function bomWarehouseValue(l: BomLine) {
  return (l.warehouseQty || 0) * (l.actualUnitCost ?? l.unitCost);
}
