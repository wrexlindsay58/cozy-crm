export const STAGES = ["Sold", "Permit", "Materials", "Scheduled", "In progress", "Test-out", "Punch", "Invoiced", "Closed"] as const;
export type Stage = (typeof STAGES)[number];
export const HOLDS = ["HOA", "permit", "rebate", "customer", "weather", "finance"] as const;
export type Hold = (typeof HOLDS)[number];
export type ScopeLine = { label: string; amount: number };
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
  name: string;
  product: string;
  pm: string;
  closer: string;
  stage: Stage;
  holds: Hold[];
  sold: number;
  labor: number;
  commission: number;
  extras: number;
  crew: string;
  truck: string;
  window: string;
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
