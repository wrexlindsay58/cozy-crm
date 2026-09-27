import { bridge, files, write_files, emit } from "./core";
import { patchFile, invoiceDue } from "./events-03";
import { pretty, plusMonth, membershipFor } from "./events";
import { addHistory } from "@/features/ops/store";
import { actingName } from "@/features/staff/store";
import { parseDay, plusDays } from "../renew";
import type { CardOnFile, LedgerRow, MembershipFile } from "../types";

export function saveCard(id: string, card: CardOnFile) {
  const last4 = card.last4.trim();
  const exp = card.exp.trim();
  const name = card.name.trim();
  if (!/^\d{4}$/.test(last4)) return "last4";
  if (card.brand !== "ACH" && !/^\d{2}\/\d{2}$/.test(exp)) return "exp";
  if (!name) return "name";
  const file = files.find((m) => m.id === id);
  if (!file) return "missing";
  patchFile(id, (m) => ({ ...m, card: { brand: card.brand, last4, exp: card.brand === "ACH" ? "" : exp, name } }));
  addHistory(file.personId, actingName(), `Card on file ${card.brand} ${last4}.`);
  return "ok";
}

export function postCardPayment(
  id: string,
  rowId: string,
  slip: { brand: string; last4: string; exp: string; name: string; vaultId?: string; receipt: string; rail?: "stripe" | "goodleap" },
) {
  const file = files.find((m) => m.id === id);
  const open = file?.ledger?.find((row) => row.id === rowId && row.status === "Open");
  if (!file || !open || !slip.last4) return;
  const at = pretty(new Date());
  const label = open.note.replace(/\.$/, "").split(".")[0] || "Invoice";
  patchFile(id, (m) => ({
    ...m,
    status: m.agreement?.status === "Signed" && (m.pay === "billed" || m.funding === "membership") ? "Active" : m.status,
    card: { brand: (slip.brand || "Visa") as CardOnFile["brand"], last4: slip.last4, exp: slip.exp, name: slip.name, vaultId: slip.vaultId, rail: slip.rail ?? "stripe" },
    ledger: m.ledger?.map((row) =>
      row.id === open.id ? { ...row, status: "Paid" as const, at, note: `${row.note} ${slip.brand} ····${slip.last4}. ${slip.receipt}.` } : row,
    ),
  }));
  addHistory(file.personId, actingName(), `Charged ${label} for ${open.amount} on ${slip.brand} ····${slip.last4}. Receipt ${slip.receipt}.`);
}

export function failPayment(id: string, rowId: string, how: "Card declined" | "NSF") {
  const file = files.find((m) => m.id === id);
  const open = file?.ledger?.find((row) => row.id === rowId && row.status === "Open");
  if (!file || !open) return;
  const at = pretty(new Date());
  const retryOn = pretty(plusDays(new Date(), 3));
  const label = open.note.replace(/\.$/, "").split(".")[0] || "Invoice";
  patchFile(id, (m) => ({
    ...m,
    retryOn,
    ledger: m.ledger?.map((row) => (row.id === open.id ? { ...row, status: "Failed" as const, at, note: `${label}. ${how}.` } : row)),
  }));
  addHistory(file.personId, actingName(), `${label} failed. ${how}. It comes back ${retryOn}.`);
}

export function planInvoice(row: LedgerRow) {
  return !row.note.startsWith("Repair") && !row.note.startsWith("Refund");
}

export function billOpen(file: MembershipFile) {
  return (file.ledger ?? []).some((row) => planInvoice(row) && invoiceDue(row));
}

export function rollBills(id: string) {
  const file = files.find((m) => m.id === id);
  if (!file || (file.status !== "Active" && file.status !== "Continued")) return;
  const monthly = file.pay === "billed" || file.status === "Continued";
  if (monthly && file.nextBill) {
    let due = parseDay(file.nextBill);
    let guard = 0;
    while (due && due <= new Date() && guard < 18) {
      guard += 1;
      const stamp = pretty(due);
      const current = files.find((m) => m.id === id);
      const already = (current?.ledger ?? []).some((row) => planInvoice(row) && row.at === stamp);
      const amount = current?.status === "Continued" ? current.continueMonthly : current?.termPrice ?? file.termPrice;
      const next = plusMonth(due);
      if (!already && current) {
        const note = `${due.toLocaleDateString("en-US", { month: "long" })}.`;
        patchFile(id, (m) => ({
          ...m,
          nextBill: next,
          ledger: [...(m.ledger ?? []), { id: `${m.id}-bill-${stamp.replace(/\W/g, "")}`, at: stamp, amount, status: "Open" as const, note }],
        }));
        addHistory(file.personId, actingName(), `${note.replace(".", "")} posted. ${amount}.`);
      } else {
        patchFile(id, (m) => ({ ...m, nextBill: next }));
      }
      due = parseDay(next);
    }
  }
  const waiting = files.find((m) => m.id === id);
  const retry = waiting?.retryOn ? parseDay(waiting.retryOn) : null;
  if (!waiting || !retry || retry > new Date()) return;
  const failed = [...(waiting.ledger ?? [])].reverse().find((row) => row.status === "Failed" && planInvoice(row));
  if (!failed || (waiting.ledger ?? []).some((row) => row.status === "Open" && row.note === "Retry.")) {
    patchFile(id, (m) => ({ ...m, retryOn: "" }));
    return;
  }
  patchFile(id, (m) => ({
    ...m,
    retryOn: "",
    ledger: [...(m.ledger ?? []), { id: `${m.id}-retry-${Date.now()}`, at: pretty(new Date()), amount: failed.amount, status: "Open" as const, note: "Retry." }],
  }));
  addHistory(file.personId, actingName(), "The failed card is back. The invoice is open again.");
}

export function fundHeld(id: string) {
  const file = files.find((m) => m.id === id);
  if (!file?.ledger?.some((row) => row.status === "Held")) return;
  const at = pretty(new Date());
  patchFile(id, (m) => ({
    ...m,
    status: m.agreement?.status === "Signed" ? "Active" : "Offered",
    ledger: m.ledger?.map((row) => (row.status === "Held" ? { ...row, status: "Paid" as const, at, note: `${row.note} Funded. Still not job revenue.` } : row)),
  }));
  addHistory(file.personId, actingName(), file.funding === "loan" ? "Loan funded the membership. Not job revenue." : "Job collected the membership. Not job revenue.");
}

export function setPlanFee(personId: string, fee: number) {
  const file = membershipFor(personId);
  if (!file || file.planFee === fee) return;
  write_files(files.map((m) => (m.personId === personId ? { ...m, planFee: fee } : m)));
  emit();
}

bridge.rollBills = rollBills;
