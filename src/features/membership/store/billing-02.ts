import { files } from "./core";
import { patchFile } from "./events-03";
import { pretty, plusYears } from "./events";
import { addHistory } from "@/features/ops/store";
import { actingName, canOverrideFee } from "@/features/staff/store";
import { planById, termPrice } from "../catalog";
import { isoDay, parseDay, plusDays, rateAfterTerm, renewalOpen, NOTICE_DAYS } from "../renew";
import type { MemberStatus, MembershipFile, PayMode, TermYears } from "../types";

export function memberTone(status: MemberStatus): "navy" | "up" | "muted" {
  if (status === "Active") return "up";
  if (status === "Continued") return "navy";
  return "muted";
}

export function priceLabel(file: Pick<MembershipFile, "pay" | "termPrice" | "years">, money: (n: number) => string) {
  if (file.pay === "prepaid") return `${money(file.termPrice)} prepaid`;
  return `${money(file.termPrice)}/mo`;
}

export function scheduleNotice(id: string, amount: number, startsOn: string) {
  const file = files.find((m) => m.id === id);
  const start = parseDay(startsOn);
  const earliest = plusDays(new Date(), NOTICE_DAYS);
  if (!file || file.status === "Offered" || file.status === "Canceled") return "closed";
  if (!canOverrideFee()) return "admin";
  if (!Number.isFinite(amount) || amount < 0) return "amount";
  if (!start || start < earliest) return "early";
  patchFile(id, (m) => ({ ...m, notice: { amount, toldOn: pretty(new Date()), startsOn: isoDay(start) } }));
  addHistory(file.personId, actingName(), `Told them the continue rate becomes ${amount} on ${pretty(start)}. The term price does not change.`);
  return "ok";
}

export function applyDueNotice(id: string) {
  const file = files.find((m) => m.id === id);
  const starts = file?.notice ? parseDay(file.notice.startsOn) : null;
  if (!file?.notice || !starts || starts > new Date()) return;
  const amount = file.notice.amount;
  patchFile(id, (m) => ({ ...m, continueMonthly: amount, notice: undefined }));
  addHistory(file.personId, actingName(), `Continue rate is now ${amount}. The term price was not changed.`);
}

export function settleTerm(id: string) {
  const file = files.find((m) => m.id === id);
  const end = file ? parseDay(file.end) : null;
  if (!file || !end || file.status !== "Active" || file.renewal?.status === "Locked" || new Date() <= end) return;
  const amount = rateAfterTerm(file);
  const rowId = `${file.id}-continue`;
  patchFile(id, (m) => ({
    ...m,
    status: "Continued",
    pay: "billed",
    funding: "membership",
    continueMonthly: amount,
    nextBill: pretty(new Date()),
    ledger: (m.ledger ?? []).some((row) => row.id === rowId)
      ? m.ledger
      : [...(m.ledger ?? []), { id: rowId, at: pretty(end), amount, status: "Open" as const, note: "Continued after the term. Not a new term." }],
  }));
  addHistory(file.personId, actingName(), `The term ended. Service continues at ${amount} a month until they cancel or lock a new term.`);
}

export function passRenewal(id: string) {
  const file = files.find((m) => m.id === id);
  if (!file || !renewalOpen(file)) return;
  const at = pretty(new Date());
  patchFile(id, (m) => ({
    ...m,
    renewal: {
      years: m.years,
      pay: m.pay,
      termPrice: m.termPrice,
      continueMonthly: rateAfterTerm(m),
      status: "Passed",
      at,
    },
  }));
  addHistory(file.personId, actingName(), `Passed on a new term. After ${file.end}, service continues at ${rateAfterTerm(file)} a month unless they lock one.`);
}

export function lockRenewal(id: string, years: TermYears, pay: PayMode) {
  const file = files.find((m) => m.id === id);
  if (!file || !renewalOpen(file) || file.agreement?.status !== "Signed") return "closed";
  const plan = planById(file.planId);
  const price = termPrice(plan, years);
  const termPriceAmount = pay === "prepaid" ? price.prepaid : price.monthly;
  const start = parseDay(file.end) ?? new Date();
  const at = pretty(new Date());
  patchFile(id, (m) => ({
    ...m,
    status: "Active",
    years,
    pay,
    termPrice: termPriceAmount,
    continueMonthly: plan.continueMonthly,
    funding: "membership",
    end: plusYears(start, years),
    nextBill: pay === "billed" ? pretty(start) : "",
    notice: undefined,
    renewal: { years, pay, termPrice: termPriceAmount, continueMonthly: plan.continueMonthly, status: "Locked", at },
    ledger: [
      ...(m.ledger ?? []),
      {
        id: `${m.id}-renew-${Date.now()}`,
        at,
        amount: termPriceAmount,
        status: "Open" as const,
        note: pay === "prepaid" ? "Renewal. Prepaid on the membership. Not job revenue." : "Renewal. First month of the new term.",
      },
    ],
  }));
  addHistory(file.personId, actingName(), `Locked a ${years}-year renewal at ${termPriceAmount}. The old agreement stays on the file.`);
  return "ok";
}

export function memberPrice(amount: number, discount: number) {
  const pct = Math.min(100, Math.max(0, discount || 0));
  return Math.round(amount * (100 - pct)) / 100;
}
