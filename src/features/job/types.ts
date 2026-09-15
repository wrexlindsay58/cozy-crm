export const STAGES = ["Sold", "Materials", "Scheduled", "In progress", "Punch", "Invoiced", "Closed"] as const;
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
};
