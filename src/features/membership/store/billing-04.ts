import { files, write_files, emit } from "./core";
import { amountLeft } from "./events-04";
import { pretty } from "./events";
import { patchFile } from "./events-03";
import { addHistory, dropLatestHistory } from "@/features/ops/store";
import { actingName, canOverrideFee, dropLatestEmployeeAct } from "@/features/staff/store";
import type { CancelRecord, CardOnFile } from "../types";
import { undoToast } from "@/lib/undo-toast";

export function cancelMembership(id: string, reason: string, refund: CancelRecord["refund"], partial = 0) {
  const file = files.find((m) => m.id === id);
  const why = reason.trim();
  if (!canOverrideFee()) return "admin";
  if (!file || file.status === "Canceled") return "closed";
  if (!why) return "reason";
  const left = amountLeft(file);
  const amount = refund === "none" ? 0 : refund === "full" ? left : Math.round(partial);
  if (refund === "partial" && amount <= 0) return "amount";
  const at = pretty(new Date());
  const by = actingName();
  const what = `Canceled the membership. ${why} ${amount > 0 ? `Refund ${amount}.` : "No refund."}`;
  const snapshot = file;
  patchFile(id, (m) => ({
    ...m,
    status: "Canceled",
    nextBill: "",
    cancel: { at, by, reason: why, refund, amount },
    ledger:
      amount > 0
        ? [...(m.ledger ?? []), { id: `${m.id}-refund`, at, amount, status: "Paid" as const, note: `Refund. ${why}` }]
        : m.ledger,
  }));
  addHistory(file.personId, by, what);
  undoToast("Membership canceled", () => {
    write_files(files.map((m) => (m.id === snapshot.id ? snapshot : m)));
    emit();
    dropLatestHistory(file.personId, what);
    dropLatestEmployeeAct(file.personId, what);
  });
  return "ok";
}

export function replaceCard(
  id: string,
  slip: { brand: string; last4: string; exp: string; name: string; vaultId?: string; rail?: "stripe" | "goodleap" },
) {
  const file = files.find((m) => m.id === id);
  if (!file || !slip.last4) return;
  patchFile(id, (m) => ({
    ...m,
    card: { brand: (slip.brand || "Visa") as CardOnFile["brand"], last4: slip.last4, exp: slip.exp, name: slip.name, vaultId: slip.vaultId, rail: slip.rail ?? "stripe" },
  }));
  addHistory(file.personId, actingName(), `Replaced the card on file. ${slip.brand} ····${slip.last4}. The open invoice was not charged.`);
}

export function saveAch(id: string, input: { bank: string; last4: string; name: string }) {
  const file = files.find((m) => m.id === id);
  const last4 = input.last4.replace(/\D/g, "");
  if (!file || !input.bank.trim() || !input.name.trim() || !/^\d{4}$/.test(last4)) return "missing";
  patchFile(id, (m) => ({
    ...m,
    card: { brand: "ACH", last4, exp: "", name: input.name.trim(), bank: input.bank.trim() },
  }));
  addHistory(file.personId, actingName(), `Billing is now ACH ····${last4}. The full account number is not stored.`);
  return "ok";
}
