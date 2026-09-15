export const SOURCES = ["leads", "calls", "appointments", "opportunities", "jobs", "accounts", "combo", "geo"] as const;
export type ReportSource = (typeof SOURCES)[number];
export type SavedReport = {
  id: string;
  name: string;
  source: ReportSource;
  office: string;
  from: string;
  to: string;
  zip?: string;
  skuA?: string;
  skuB?: string;
  pinned: boolean;
};
export type CallRow = {
  id: string;
  at: string;
  personId: string;
  name: string;
  channel: "call" | "sms" | "email";
  who: string;
  outcome: string;
  minutes?: number;
};
