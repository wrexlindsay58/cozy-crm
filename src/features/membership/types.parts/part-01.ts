export const TERMS = [1, 2, 3, 5, 7, 10] as const;

export type TermYears = (typeof TERMS)[number];

export type PayMode = "prepaid" | "billed";

export type MemberStatus = "Offered" | "Active" | "Continued" | "Canceled";

export type MemberOrigin = "lead" | "assessment" | "opportunity" | "job" | "account";

export type PlanFunding = "membership" | "job" | "loan";

export type MemberAgreement = {
  status: "Ready" | "Signed";
  at: string;
  signer: string;
  body: string;
};

export type CardBrand = "Visa" | "Mastercard" | "Amex" | "Discover" | "ACH";

export type CardOnFile = {
  brand: CardBrand;
  last4: string;
  exp: string;
  name: string;
  vaultId?: string;
  rail?: "stripe" | "goodleap";
  bank?: string;
};

export type LedgerStatus = "Paid" | "Open" | "Failed" | "Held";

export type LedgerRow = {
  id: string;
  at: string;
  amount: number;
  status: LedgerStatus;
  note: string;
};

export type MemberOffer = {
  planId: string;
  planName: string;
  years: TermYears;
  pay: PayMode;
  termPrice: number;
  continueMonthly: number;
  visitsPerYear: number;
  funding: PlanFunding;
  accepted?: boolean;
  signerName?: string;
};

export type PlanTerm = {
  years: TermYears;
  prepaid: number;
  monthly: number;
};

export type MemberPlan = {
  id: string;
  name: string;
  visitsPerYear: number;
  continueMonthly: number;
  included: string[];
  repairDiscount: number;
  terms: PlanTerm[];
};

export type VisitCheck = { id: string; label: string; done: boolean };

export type VisitPart = { id: string; name: string; qty: number };

export type VisitRepair = {
  id: string;
  name: string;
  amount: number;
  status: "Open" | "Paid";
  covered?: boolean;
  receipt?: string;
  last4?: string;
};

export type VisitEdit = { at: string; by: string; why: string };

export type MemberVisit = {
  id: string;
  on: string;
  tech: string;
  did: string;
  checks: VisitCheck[];
  parts: VisitPart[];
  customerNote: string;
  serviceNote: string;
  failing: string;
  repairs: VisitRepair[];
  status?: "Set" | "Open" | "Done";
  bookId?: string;
  time?: string;
  postedBy?: string;
  postedAt?: string;
  edits?: VisitEdit[];
};

export type ContinueNotice = {
  amount: number;
  toldOn: string;
  startsOn: string;
};

export type RenewalChoice = {
  years: TermYears;
  pay: PayMode;
  termPrice: number;
  continueMonthly: number;
  status: "Locked" | "Passed";
  at: string;
};

export type CancelRecord = {
  at: string;
  by: string;
  reason: string;
  refund: "none" | "partial" | "full";
  amount: number;
};

export type PlanChange = {
  id: string;
  at: string;
  by: string;
  kind: "transfer" | "upgrade" | "downgrade";
  from: string;
  to: string;
  note: string;
};
