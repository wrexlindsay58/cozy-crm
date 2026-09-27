import { files, subscribe, snap, write_files, emit } from "./core";
import { useSyncExternalStore } from "react";
import type { LedgerRow, MembershipFile } from "../types";

export function pretty(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function plusYears(from: Date, years: number) {
  const d = new Date(from);
  d.setFullYear(d.getFullYear() + years);
  return pretty(d);
}

export function plusMonth(from: Date) {
  const d = new Date(from);
  d.setMonth(d.getMonth() + 1);
  return pretty(d);
}

export function openingRow(file: MembershipFile): LedgerRow {
  const held = file.pay === "prepaid" && (file.funding === "job" || file.funding === "loan");
  return {
    id: `${file.id}-1`,
    at: file.start,
    amount: file.termPrice,
    status: held ? "Held" : "Open",
    note: held
      ? file.funding === "loan"
        ? "Included in the loan. Not job revenue."
        : "Collected with the job. Not job revenue."
      : file.pay === "prepaid"
        ? "Prepaid on the membership."
        : "Monthly bill.",
  };
}

export function membershipFiles() {
  return files;
}

export function useMemberships() {
  return useSyncExternalStore(subscribe, snap, snap);
}

export function applyRemoteMembershipPatch(id: string, patch: Record<string, unknown>) {
  const current = files.find((file) => file.id === id);
  if (!current) return;
  const next = { ...current };
  for (const [key, value] of Object.entries(patch)) {
    if (key === "id" || !(key in current)) continue;
    (next as Record<string, unknown>)[key] = value;
  }
  write_files(files.map((file) => (file.id === id ? next : file)));
  emit();
}

export function applyRemoteMembershipDelete(id: string) {
  if (!files.some((file) => file.id === id)) return;
  write_files(files.filter((file) => file.id !== id));
  emit();
}

export function useMembership(id: string) {
  return useMemberships().find((m) => m.id === id);
}

export function membershipFor(personId: string) {
  return files.find((m) => m.personId === personId);
}

export function useMembershipFor(personId: string) {
  return useMemberships().find((m) => m.personId === personId);
}

export function listMemberships() {
  return files;
}
