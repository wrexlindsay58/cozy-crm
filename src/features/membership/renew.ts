import type { MembershipFile } from "./types";

export const RENEW_MONTHS = 6;
export const NOTICE_DAYS = 60;

export function parseDay(value: string) {
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), 12);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(12, 0, 0, 0);
  return d;
}

export function isoDay(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function plusDays(from: Date, days: number) {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

export function renewalOpensOn(end: string) {
  const d = parseDay(end);
  if (!d) return null;
  d.setMonth(d.getMonth() - RENEW_MONTHS);
  return d;
}

export function renewalOpen(file: Pick<MembershipFile, "end" | "status" | "renewal">, now = new Date()) {
  if (file.status === "Offered" || file.status === "Canceled" || file.renewal?.status === "Locked") return false;
  if (file.status === "Continued") return true;
  const open = renewalOpensOn(file.end);
  const end = parseDay(file.end);
  if (!open || !end) return false;
  return now >= open && now <= end;
}

export function rateAfterTerm(file: Pick<MembershipFile, "continueMonthly" | "notice" | "end">) {
  const end = parseDay(file.end);
  const starts = file.notice ? parseDay(file.notice.startsOn) : null;
  if (file.notice && starts && end && starts <= end) return file.notice.amount;
  return file.continueMonthly;
}
