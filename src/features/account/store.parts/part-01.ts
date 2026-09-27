import { photosByPerson, type Photo } from "@/lib/file-data";
import { accounts, leads, type Account, type Activity } from "@/lib/crm-data";
export const VISIT_KINDS = ["Service", "QC", "Warranty", "Go-back"] as const;
export type VisitKind = (typeof VISIT_KINDS)[number];
export type Visit = { id: string; accountId: string; kind: VisitKind; day: string; who: string; fee: number; cost: number; status: string; why: string };
export type MembershipPay = { id: string; at: string; amount: number; method: string; status: "Paid" | "Failed" | "Scheduled" };
export type Membership = {
  plan: string;
  cadence: string;
  amount: number;
  next: string;
  method: "Card" | "ACH";
  brand: string;
  last4: string;
  exp: string;
  bank: string;
  routingLast4: string;
  payments: MembershipPay[];
};
export type JobLane = { id: string; label: string; history: Activity[] };
export type IssueStatus = "Open" | "Scheduled" | "Resolved" | "New job";
export type AccountIssue = { id: string; title: string; detail: string; status: IssueStatus; at: string; ticketId?: string };
export type ReviewStatus = "Not asked" | "Sent" | "Left" | "Opt out";
export type AccountReview = {
  id: string;
  platform: string;
  status: ReviewStatus;
  source: "api" | "manual";
  rating?: number;
  text?: string;
  at: string;
  author?: string;
};
export type AccountReferral = { id: string; name: string; phone: string; status: "Asked" | "Lead" | "Sold" | "Passed"; leadId?: string };
export type AccountFile = {
  accountId: string;
  leadId: string;
  name: string;
  city: string;
  owner: string;
  visits: Visit[];
  membership: Membership | null;
  photos: Photo[];
  lanes: JobLane[];
  childLeads: { id: string; name: string }[];
  issues: AccountIssue[];
  reviews: AccountReview[];
  referrals: AccountReferral[];
  warrantyStart: string;
  warrantyUntil: string;
};
export const whitaker: AccountFile = {
  accountId: "A-198",
  leadId: "L-4761",
  name: "Ann Whitaker",
  city: "Scottsdale, AZ",
  owner: "Dana Ortiz",
  visits: [
    { id: "V-12", accountId: "A-198", kind: "Service", day: "Aug 9", who: "Crew 2", fee: 189, cost: 62, status: "Done", why: "Supply register rattle." },
    { id: "V-9", accountId: "A-198", kind: "Warranty", day: "Mar 2", who: "Crew 1", fee: 0, cost: 140, status: "Done", why: "Air seal touch-up." },
  ],
  membership: {
    plan: "Comfort",
    cadence: "Monthly",
    amount: 29,
    next: "Oct 1",
    method: "Card",
    brand: "Visa",
    last4: "4242",
    exp: "08/28",
    bank: "",
    routingLast4: "",
    payments: [
      { id: "MP-1", at: "Sep 1", amount: 29, method: "Visa · 4242", status: "Paid" },
      { id: "MP-2", at: "Aug 1", amount: 29, method: "Visa · 4242", status: "Paid" },
      { id: "MP-3", at: "Jul 1", amount: 29, method: "Visa · 4242", status: "Paid" },
    ],
  },
  photos: photosByPerson["A-198"] ?? [],
  lanes: [{ id: "P-328", label: "Envelope 2026", history: [{ at: "Sep 6", who: "Dana Ortiz", what: "Sold envelope package." }] }],
  childLeads: [],
  issues: [{ id: "IS-1", title: "West bedroom still warm", detail: "Customer says the new supply is weak.", status: "Open", at: "Sep 20" }],
  reviews: [{ id: "RV-w", platform: "Google", status: "Sent", source: "api", at: "Sep 19" }],
  referrals: [{ id: "RF-1", name: "Marcus Bell", phone: "(214) 555-0112", status: "Lead", leadId: "L-4814" }],
  warrantyStart: "Sep 18, 2026",
  warrantyUntil: "Sep 18, 2027",
};
export const API_REVIEW_PLATFORMS = ["Google", "Facebook"] as const;
export const MANUAL_REVIEW_PLATFORMS = ["Yelp", "BBB", "Angi", "Nextdoor", "Other"] as const;
function emptyMembership(repeat: boolean): Membership | null {
  if (!repeat) return null;
  return {
    plan: "Comfort",
    cadence: "Yearly",
    amount: 249,
    next: "Mar 1",
    method: "ACH",
    brand: "",
    last4: "8811",
    exp: "",
    bank: "Chase",
    routingLast4: "0210",
    payments: [{ id: "MP-y", at: "Mar 1", amount: 249, method: "ACH · 8811", status: "Paid" }],
  };
}
export function blank(id: string): AccountFile {
  const a = accounts.find((row) => row.id === id);
  const lead = leads.find((l) => l.name === a?.name);
  return {
    accountId: id,
    leadId: lead?.id ?? id,
    name: a?.name ?? "Account",
    city: a?.city ?? "",
    owner: a?.owner ?? "",
    visits: [],
    membership: emptyMembership(a?.type === "Repeat"),
    photos: photosByPerson[id] ?? [],
    lanes: [],
    childLeads: [],
    issues: [],
    reviews: [],
    referrals: [],
    warrantyStart: "",
    warrantyUntil: "",
  };
}
export let extraAccounts: Account[] = [];
export let photoRows: Photo[] = [...(photosByPerson["A-198"] ?? [])];
export const listeners = new Set<() => void>();
export function write_extraAccounts(__v: any) { extraAccounts = __v; }
export function write_photoRows(__v: any) { photoRows = __v; }
