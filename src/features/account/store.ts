import { useSyncExternalStore } from "react";
import { addHistory, createLead, createTicket } from "@/features/ops/store";
import { putFromAppointment } from "@/features/book/store";
import { photosByPerson, type Photo } from "@/lib/file-data";
import { accounts, leads, type Activity } from "@/lib/crm-data";

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

const whitaker: AccountFile = {
  accountId: "A-198",
  leadId: "L-4761",
  name: "The Whitakers",
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

function blank(id: string): AccountFile {
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

function choFile(): AccountFile {
  return {
    ...blank("A-204"),
    leadId: "L-4788",
    warrantyStart: "Sep 22, 2026",
    warrantyUntil: "Sep 22, 2027",
    reviews: [
      { id: "RV-cho-g", platform: "Google", status: "Left", source: "api", rating: 5, text: "Crew was clean and the upstairs finally cools.", at: "Sep 28", author: "Alyssa Cho" },
      { id: "RV-cho-f", platform: "Facebook", status: "Left", source: "api", rating: 5, text: "Would use Cozy again. On time, and the attic looks finished.", at: "Sep 29", author: "Ben Cho" },
    ],
  };
}

function seedFiles() {
  const out: Record<string, AccountFile> = { "A-198": whitaker, "A-204": choFile() };
  for (const a of accounts) if (!out[a.id]) out[a.id] = blank(a.id);
  return out;
}

let files: Record<string, AccountFile> = seedFiles();
let photoRows: Photo[] = [...(photosByPerson["A-198"] ?? [])];
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function patch(accountId: string, next: AccountFile) {
  files = { ...files, [accountId]: next };
  emit();
}

export function useAccount(accountId: string) {
  useSyncExternalStore(subscribe, () => files, () => files);
  return files[accountId] ?? blank(accountId);
}
export function useAccountFiles() {
  return useSyncExternalStore(subscribe, () => files, () => files);
}
export function useAccountPhotos(accountId: string) {
  useSyncExternalStore(subscribe, () => photoRows, () => photoRows);
  return photoRows.filter((p) => p.personId === accountId);
}
export function defaultsFor(kind: VisitKind) {
  if (kind === "Service") return { fee: 189, cost: 75 };
  if (kind === "Warranty") return { fee: 0, cost: 180 };
  if (kind === "Go-back") return { fee: 0, cost: 120 };
  if (kind === "QC") return { fee: 0, cost: 90 };
  return { fee: 0, cost: 0 };
}
export function scheduleVisit(input: { accountId: string; kind: VisitKind; closer: string; day: number; hour: string; fee: number; cost: number; why?: string }) {
  const file = files[input.accountId];
  if (!file) return;
  const row: Visit = {
    id: `V-${20 + file.visits.length}`,
    accountId: input.accountId,
    kind: input.kind,
    day: `Sep ${input.day} ${input.hour}`,
    who: input.closer,
    fee: input.fee,
    cost: input.cost,
    status: "Booked",
    why: input.why?.trim() || input.kind,
  };
  patch(input.accountId, { ...file, visits: [row, ...file.visits] });
  putFromAppointment({
    leadId: file.leadId,
    name: file.name,
    kind: input.kind === "QC" ? "Service" : input.kind,
    day: input.day,
    time: input.hour,
    assignee: input.closer,
    setBy: input.closer,
    city: file.city,
  });
  addHistory(file.leadId, file.owner, `Booked ${input.kind.toLowerCase()} ${row.day}. ${row.why}`);
}
export function addIssue(accountId: string, title: string, detail: string) {
  const file = files[accountId];
  const name = title.trim();
  if (!file || !name) return;
  const ticket = createTicket({ personId: file.leadId, title: name, owner: file.owner, description: detail.trim() });
  const row: AccountIssue = { id: `IS-${file.issues.length + 2}`, title: name, detail: detail.trim(), status: "Open", at: "Today", ticketId: ticket?.id };
  patch(accountId, { ...file, issues: [row, ...file.issues] });
  addHistory(file.leadId, file.owner, `Issue opened: ${name}.`);
}
export function setIssueStatus(accountId: string, id: string, status: IssueStatus) {
  const file = files[accountId];
  if (!file) return;
  patch(accountId, { ...file, issues: file.issues.map((i) => (i.id === id ? { ...i, status } : i)) });
  addHistory(file.leadId, file.owner, `Issue ${status.toLowerCase()}.`);
}
export function sendReview(accountId: string, platform = "Google") {
  const file = files[accountId];
  if (!file) return;
  const existing = file.reviews.find((r) => r.platform === platform);
  if (existing?.status === "Left" || existing?.status === "Opt out") return;
  const next = existing
    ? file.reviews.map((r) => (r.platform === platform ? { ...r, status: "Sent" as const, at: "Today", source: "api" as const } : r))
    : [{ id: `RV-${file.reviews.length + 3}`, platform, status: "Sent" as const, source: "api" as const, at: "Today" }, ...file.reviews];
  patch(accountId, { ...file, reviews: next });
  addHistory(file.leadId, file.owner, `${platform} review request sent.`);
}
export function addManualReview(accountId: string, input: { platform: string; rating: number; text: string; author: string }) {
  const file = files[accountId];
  const platform = input.platform.trim();
  if (!file || !platform) return false;
  if ((API_REVIEW_PLATFORMS as readonly string[]).includes(platform)) return false;
  const row: AccountReview = {
    id: `RV-${file.reviews.length + 4}`,
    platform,
    status: "Left",
    source: "manual",
    rating: input.rating,
    text: input.text.trim(),
    author: input.author.trim(),
    at: "Today",
  };
  patch(accountId, { ...file, reviews: [row, ...file.reviews] });
  addHistory(file.leadId, file.owner, `${platform} review added by hand · ${input.rating} star.`);
  return true;
}
export function setWarranty(accountId: string, warrantyStart: string, warrantyUntil: string) {
  const file = files[accountId];
  if (!file) return;
  patch(accountId, { ...file, warrantyStart: warrantyStart.trim(), warrantyUntil: warrantyUntil.trim() });
  addHistory(file.leadId, file.owner, `Warranty expires ${warrantyUntil.trim() || "cleared"}.`);
}
export function setMembership(accountId: string, next: Membership | null) {
  const file = files[accountId];
  if (!file) return;
  patch(accountId, { ...file, membership: next });
  addHistory(file.leadId, file.owner, next ? `Membership ${next.plan} · ${next.method}.` : "Membership removed.");
}
export function addReferral(accountId: string, name: string, phone: string) {
  const file = files[accountId];
  const who = name.trim();
  if (!file || !who) return;
  const row: AccountReferral = { id: `RF-${file.referrals.length + 2}`, name: who, phone: phone.trim(), status: "Asked" };
  patch(accountId, { ...file, referrals: [row, ...file.referrals] });
  addHistory(file.leadId, file.owner, `Referral added: ${who}.`);
}
export function addPhoto(accountId: string, caption: string) {
  const trimmed = caption.trim();
  if (!trimmed) return false;
  const row: Photo = { id: `PH-${10 + photoRows.length}`, personId: accountId, caption: trimmed, tone: "info" };
  photoRows = [row, ...photoRows];
  const file = files[accountId];
  if (file) patch(accountId, { ...file, photos: [row, ...file.photos] });
  addHistory(accountId, "File", `Photo: ${trimmed}.`);
  return true;
}
export function spawnLead(accountId: string, product: string) {
  const file = files[accountId];
  if (!file) return null;
  const lead = createLead({ name: file.name, phone: "(480) 555-0121", city: file.city, source: "Account", product, closer: file.owner });
  if (lead) patch(accountId, { ...file, childLeads: [{ id: lead.id, name: product }, ...file.childLeads] });
  addHistory(file.leadId, file.owner, `New job started from this account · ${product}.`);
  return lead;
}
