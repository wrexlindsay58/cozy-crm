import type { FileLink, ScopeMedia, SurveyRoom, WoStatus } from "./part-01";

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
