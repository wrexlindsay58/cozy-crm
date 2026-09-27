import { addHistory, createLead, leadById } from "@/features/ops/store";
import type { Photo } from "@/lib/file-data";
import { actingName } from "@/features/staff/store";
import { leads } from "@/lib/crm-data";
import { enterFlow } from "@/features/flow/door";
import { putPhoto } from "@/features/photos/store";
import { API_REVIEW_PLATFORMS, photoRows, type Membership, type AccountReview, type AccountReferral, write_photoRows } from "./part-01";
import { files, patch } from "./part-02";

export function sendReview(accountId: string, platform = "Google") {
  const file = files[accountId];
  if (!file) return;
  const existing = file.reviews.find((r) => r.platform === platform);
  if (existing?.status === "Left" || existing?.status === "Opt out") return;
  const next = existing
    ? file.reviews.map((r) => (r.platform === platform ? { ...r, status: "Sent" as const, at: "Today", source: "api" as const } : r))
    : [{ id: `RV-${file.reviews.length + 3}`, platform, status: "Sent" as const, source: "api" as const, at: "Today" }, ...file.reviews];
  patch(accountId, { ...file, reviews: next });
  addHistory(file.leadId, actingName(), `${platform} review request sent.`);
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
  addHistory(file.leadId, actingName(), `${platform} review added by hand · ${input.rating} star.`);
  return true;
}

export function setMembership(accountId: string, next: Membership | null) {
  const file = files[accountId];
  if (!file) return;
  patch(accountId, { ...file, membership: next });
  addHistory(file.leadId, actingName(), next ? `Membership ${next.plan} · ${next.method}.` : "Membership removed.");
}

export function addReferral(accountId: string, name: string, phone: string) {
  const file = files[accountId];
  const who = name.trim();
  if (!file || !who) return;
  const row: AccountReferral = { id: `RF-${file.referrals.length + 2}`, name: who, phone: phone.trim(), status: "Asked" };
  patch(accountId, { ...file, referrals: [row, ...file.referrals] });
  addHistory(file.leadId, actingName(), `Referral added: ${who}.`);
}

export function addPhoto(accountId: string, caption: string) {
  const trimmed = caption.trim();
  const file = files[accountId];
  if (!trimmed || !file) return false;
  const row: Photo = { id: `PH-${10 + photoRows.length}`, personId: file.leadId || accountId, caption: trimmed, tone: "info", pipeline: "Account", by: actingName() };
  write_photoRows([row, ...photoRows]);
  patch(accountId, { ...file, photos: [row, ...file.photos] });
  putPhoto(file.leadId || accountId, row);
  addHistory(file.leadId || accountId, actingName(), `Photo: ${trimmed}.`);
  return true;
}

export function spawnLead(accountId: string, product: string) {
  const file = files[accountId];
  if (!file) return null;
  const source = leadById(file.leadId) ?? leads.find((l) => l.id === file.leadId);
  const lead = createLead({
    name: file.name,
    phone: source?.phone || "(480) 555-0100",
    email: source?.email,
    address: source?.address,
    city: source?.city || file.city,
    source: "Account",
    product,
    closer: file.owner,
    office: source?.office,
  });
  if (lead) {
    enterFlow(lead.id, "lead", lead.id);
    patch(accountId, { ...file, childLeads: [{ id: lead.id, name: product }, ...file.childLeads] });
  }
  addHistory(file.leadId, actingName(), `New job started from this account · ${product}. New file ${lead?.id ?? ""}.`);
  return lead;
}
