import type { OptLine } from "./seed";
import type { MemberOffer } from "@/features/membership/types";

export type OptCard = { id: string; name: string; lines: OptLine[] };

export type DocStub = {
  id: string;
  kind: "proposal" | "agreement" | "report" | "packet";
  status: string;
  at: string;
  totals?: { id: string; name: string; amount: number }[];
  fileName?: string;
  fileUrl?: string;
};

export type GoodLeapStatus = "Not run" | "Pre-qualified" | "Sent" | "Approved" | "Declined";

export type PayKind = "cash" | "card" | "ach" | "finance";

export type FeeAsk = { pct: number; reason: string; actionId: string; months?: number; apr?: number };

export type PlanFee = { months: number; apr: number; pct: number };

export type PayOffer = {
  id: string;
  kind: PayKind;
  methodId?: string;
  financer?: string;
  terms: number[];
  pickedPlans?: { months: number; apr: number }[];
  feeOverride?: number;
  planFees?: PlanFee[];
  feeAsk?: FeeAsk;
};

export type PayPick = { offerId: string; term?: number; apr?: number };

export type Proposal = {
  oppId: string;
  personId: string;
  closer: string;
  products: string[];
  options: OptCard[];
  accepted?: string;
  pay: "cash" | "12mo" | "goodleap";
  payOffers: PayOffer[];
  payPick?: PayPick;
  goodleapTerm: "10yr" | "12yr";
  goodleapStatus: GoodLeapStatus;
  proposalStatus: "Draft" | "Generated" | "Sent";
  signStatus: string;
  documents: DocStub[];
  matchHighFee?: boolean;
  agreement?: Agreement;
  agreements?: Agreement[];
  memberOffer?: MemberOffer;
};

export type SignEvent = {
  at: string;
  kind: "prepared" | "sent" | "opened" | "read" | "consented" | "signed" | "voided";
  who: string;
  detail: string;
};

export type Agreement = {
  id: string;
  token: string;
  status: "Ready" | "Sent" | "Opened" | "Partial" | "Signed" | "Void";
  kind?: "original" | "change";
  optionId: string;
  optionName: string;
  price: number;
  paySummary: string;
  included: string[];
  address: string;
  customer: string;
  email: string;
  company: string;
  license: string;
  body: string;
  hash: string;
  html?: string;
  createdAt: string;
  sentAt?: string;
  openedAt?: string;
  signedAt?: string;
  method?: "in-home" | "email";
  signerName?: string;
  signature?: string;
  witness?: string;
  coSigner?: { name: string; email: string; signedAt?: string; signature?: string; method?: "in-home" | "email" };
  events: SignEvent[];
  fileName?: string;
  fileUrl?: string;
};
