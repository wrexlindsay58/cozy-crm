import type { Tone } from "@/lib/crm-data";

export const STAGES = ["Sold", "Permit", "Materials", "Scheduled", "In progress", "Test-out", "Punch", "Invoiced", "Closed"] as const;
export type Stage = (typeof STAGES)[number];
export const HOLDS = ["HOA", "permit", "rebate", "customer", "weather", "finance"] as const;
export type Hold = (typeof HOLDS)[number];
export type HoldRow = { kind: Hold; note: string; at: string };

export const PROCESSES = ["Attic blow", "Attic removal", "HVAC set", "HVAC start-up", "Ducts", "Test-out", "Final inspection", "Punch", "Dump", "Callback"] as const;
export type Process = (typeof PROCESSES)[number] | string;
export const MEDIA_CATS = ["Before", "During", "After", "Serial", "Permit", "Other"] as const;
export type MediaCat = (typeof MEDIA_CATS)[number];
export type FileLink = { name: string; url: string };
export type ScopeMedia = { id: string; cat: MediaCat; name: string; url: string; kind: "photo" | "video" | "doc" };
export type ScopeLine = {
  id: string;
  label: string;
  amount: number;
  qty: number;
  notes: string;
  quotedCost: number;
  estHours: number;
  asBuiltQty?: number;
  media: ScopeMedia[];
};

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
};

export type JobEvent = {
  id: string;
  scopeId: string;
  process: string;
  day: string;
  window: string;
  crew: string;
  assignId?: string;
  status: "Set" | "Dispatched" | "Done" | "No-show";
};

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
};
export type ChangeOrder = {
  id: string;
  why: string;
  amount: number;
  cost: number;
  status: "Draft" | "Sent" | "Approved" | "Declined";
  signed: boolean;
  signedAt?: string;
};
export type PayStatus = "Draft" | "Sent" | "Partial" | "Paid" | "Past due" | "NSF" | "Card declined" | "Void" | "Refunded";
export type JobPayment = { id: string; amount: number; at: string; how: string; status: PayStatus };
export type JobInvoice = {
  id: string;
  kind: "Deposit" | "Progress" | "Final";
  amount: number;
  paid: number;
  status: PayStatus;
  file?: FileLink;
  payments: JobPayment[];
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
export type CheckItem = { id: string; label: string; on: boolean };
export type SignedCheck = { items: CheckItem[]; signedBy: string; signedAt: string };
export type PermitFile = { number: string; city: string; inspection: string; result: "None" | "Scheduled" | "Pass" | "Fail"; file?: FileLink };
export type RebateFile = { utility: string; program: string; amount: number; status: "None" | "Reserved" | "Submitted" | "Approved" | "Paid"; reservation: string; file?: FileLink };
export type TestOut = { blowerBefore: string; blowerAfter: string; ductBefore: string; ductAfter: string; notes: string };
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
};
export type PacketPart = { id: string; label: string; on: boolean; file?: FileLink };
export type ClosingPacket = { sent: boolean; sentAt: string; parts: PacketPart[] };

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
};

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

export function jobTone(job: Pick<JobFile, "stage" | "holds">): Tone {
  if (job.holds.length) return "alert";
  if (job.stage === "Closed" || job.stage === "In progress") return "up";
  if (job.stage === "Punch" || job.stage === "Test-out" || job.stage === "Permit") return "alert";
  if (job.stage === "Materials" || job.stage === "Sold") return "muted";
  return "navy";
}

export function inferStage(j: JobFile): Stage {
  if (j.stage === "Closed") return "Closed";
  const invoiced = j.invoices.some((i) => i.status !== "Draft" && i.status !== "Void");
  const punchOpen = j.punch.some((p) => p.status === "Open");
  const test = j.events.some((e) => e.process === "Test-out") || Number(j.testOut.blowerAfter) > 0;
  const inField = j.punches.some((p) => p.onSite) || j.events.some((e) => e.status === "Dispatched" || e.status === "Done");
  const scheduled = j.assignments.some((a) => a.day) || j.events.some((e) => e.status === "Set");
  const materials = j.pos.some((p) => p.status !== "Draft") || j.equipment.some((e) => e.status === "Ordered" || e.status === "Received" || e.status === "Set");
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
  return { blowerBefore: "", blowerAfter: "", ductBefore: "", ductAfter: "", notes: "" };
}
export function cashLoan(): LoanFile {
  return { vendor: "Cash", amount: 0, dealerFee: 0, term: 0, rate: 0, status: "None", notes: "", fundedAmount: 0 };
}
