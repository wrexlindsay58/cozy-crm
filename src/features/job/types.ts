export const STAGES = ["Sold", "Permit", "Materials", "Scheduled", "In progress", "Test-out", "Punch", "Invoiced", "Closed"] as const;
export type Stage = (typeof STAGES)[number];
export const HOLDS = ["HOA", "permit", "rebate", "customer", "weather", "finance"] as const;
export type Hold = (typeof HOLDS)[number];
export type HoldRow = { kind: Hold; note: string; at: string };
export type CrewAssign = {
  id: string;
  crew: string;
  truck: string;
  day: string;
  start: string;
  end: string;
  scopes: string[];
  kind: "internal" | "sub";
  company: string;
  woId?: string;
};
export type ScopeLine = { id: string; label: string; amount: number; qty: number; sqft: number; notes: string };
export type WorkOrder = {
  id: string;
  status: "Draft" | "Issued" | "On truck" | "Done";
  day: string;
  crew: string;
  notes: string;
};
export type PurchaseOrder = {
  id: string;
  vendor: string;
  amount: number;
  status: "Draft" | "Sent" | "Partial" | "Received" | "Closed";
  what: string;
};
export type ChangeOrder = {
  id: string;
  why: string;
  amount: number;
  cost: number;
  status: "Draft" | "Sent" | "Approved" | "Declined";
};
export type JobInvoice = {
  id: string;
  kind: "Deposit" | "Progress" | "Final";
  amount: number;
  paid: number;
  status: "Draft" | "Sent" | "Partial" | "Paid" | "Void";
};
export type WorkPackage = {
  id: string;
  name: string;
  status: "Queued" | "On order" | "On truck" | "Done";
  crew: string;
};
export type JobAppt = {
  id: string;
  kind: "Install" | "Rough" | "Final" | "Test-out" | "Callback";
  day: string;
  window: string;
  crew: string;
  status: "Set" | "Dispatched" | "Done" | "No-show";
};
export type PunchItem = { id: string; item: string; owner: string; status: "Open" | "Done" };
export type EquipRow = { id: string; name: string; serial: string; eta: string; status: "Quoted" | "Ordered" | "Received" | "Set" };
export type CheckItem = { id: string; label: string; on: boolean };
export type LaborRow = { id: string; who: string; hours: number; day: string };
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
  labor: number;
  commission: number;
  extras: number;
  crew: string;
  truck: string;
  window: string;
  assignments: CrewAssign[];
  soldNotes: string;
  scope: ScopeLine[];
  warranty: boolean;
  financeVendor: "GoodLeap" | "Cash" | "Card";
  financeStatus: string;
  ntp: "Not ready" | "Ready" | "Submitted" | "Issued";
  workOrders: WorkOrder[];
  pos: PurchaseOrder[];
  changeOrders: ChangeOrder[];
  invoices: JobInvoice[];
  packages: WorkPackage[];
  appointments: JobAppt[];
  punch: PunchItem[];
  equipment: EquipRow[];
  checks: CheckItem[];
  hours: LaborRow[];
  access: string;
};

export function jobTone(job: Pick<JobFile, "stage" | "holds">): import("@/lib/crm-data").Tone {
  if (job.holds.length) return "alert";
  if (job.stage === "Closed" || job.stage === "In progress") return "up";
  if (job.stage === "Punch" || job.stage === "Test-out" || job.stage === "Permit") return "alert";
  if (job.stage === "Materials" || job.stage === "Sold") return "muted";
  return "navy";
}

export function inferStage(j: JobFile): Stage {
  if (j.stage === "Closed") return "Closed";
  const invoiced = j.invoices.some((i) => i.status === "Sent" || i.status === "Partial" || i.status === "Paid");
  const punchOpen = j.punch.some((p) => p.status === "Open");
  const test = j.appointments.some((a) => a.kind === "Test-out") || j.checks.some((c) => c.id === "test" && c.on);
  const inField =
    j.hours.length > 0 ||
    j.packages.some((p) => p.status === "On truck" || p.status === "Done") ||
    j.appointments.some((a) => a.status === "Dispatched" || a.status === "Done");
  const scheduled = j.assignments.some((a) => a.day) || j.appointments.some((a) => a.status === "Set" || a.status === "Dispatched");
  const materials = j.pos.some((p) => p.status !== "Draft") || j.equipment.some((e) => e.status === "Ordered" || e.status === "Received" || e.status === "Set");
  const permit = j.holds.some((h) => h.kind === "permit") || j.checks.some((c) => c.id === "permit" && c.on);
  if (invoiced) return "Invoiced";
  if (punchOpen) return "Punch";
  if (test) return "Test-out";
  if (inField) return "In progress";
  if (scheduled) return "Scheduled";
  if (materials) return "Materials";
  if (permit) return "Permit";
  return "Sold";
};

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
