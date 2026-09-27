import { files } from "./core";
import { pretty } from "./events";
import { memberPrice } from "./billing-02";
import { patchFile } from "./events-03";
import { addHistory } from "@/features/ops/store";
import { actingName, canOverrideFee } from "@/features/staff/store";
import { planById, termPrice } from "../catalog";
import type { MembershipFile, PlanChange } from "../types";

export function payVisitRepair(
  id: string,
  visitId: string,
  repairId: string,
  slip: { brand: string; last4: string; receipt: string },
) {
  const file = files.find((m) => m.id === id);
  const visit = file?.visits?.find((row) => row.id === visitId);
  const repair = visit?.repairs.find((row) => row.id === repairId);
  if (!file || !visit || !repair || repair.status === "Paid" || repair.covered || repair.amount <= 0 || !slip.last4) return;
  const at = pretty(new Date());
  const amount = memberPrice(repair.amount, file.repairDiscount);
  patchFile(id, (m) => ({
    ...m,
    visits: (m.visits ?? []).map((row) =>
      row.id === visitId
        ? {
            ...row,
            repairs: row.repairs.map((item) =>
              item.id === repairId ? { ...item, status: "Paid" as const, receipt: slip.receipt, last4: slip.last4 } : item,
            ),
          }
        : row,
    ),
    ledger: [
      ...(m.ledger ?? []),
      {
        id: `${repairId}-pay`,
        at,
        amount,
        status: "Paid" as const,
        note: `Repair. ${repair.name || "Visit repair"}. ${file.repairDiscount ? `Member price, ${file.repairDiscount}% off.` : "No member discount."} ${slip.brand} ····${slip.last4}. ${slip.receipt}. Not plan dues.`,
      },
    ],
  }));
  addHistory(file.personId, actingName(), `${visit.tech || "Tech"} charged ${amount} for ${repair.name || "a repair"} on the membership visit. Receipt ${slip.receipt}.`);
}

export function pushChange(file: MembershipFile, change: PlanChange) {
  return [...(file.changes ?? []), change];
}

export function transferMembership(id: string, address: string, city: string, note: string) {
  const file = files.find((m) => m.id === id);
  const why = note.trim();
  if (!canOverrideFee()) return "admin";
  if (!file || file.status === "Canceled" || file.status === "Offered") return "closed";
  if (!address.trim() || !city.trim() || !why) return "missing";
  const at = pretty(new Date());
  const by = actingName();
  patchFile(id, (m) => ({
    ...m,
    address: address.trim(),
    city: city.trim(),
    changes: pushChange(m, { id: `CH-${Date.now()}`, at, by, kind: "transfer", from: `${m.address}, ${m.city}`, to: `${address.trim()}, ${city.trim()}`, note: why }),
  }));
  addHistory(file.personId, by, `Transferred the membership to ${address.trim()}, ${city.trim()}. ${why}`);
  return "ok";
}

export function changeMembershipPlan(id: string, planId: string) {
  const file = files.find((m) => m.id === id);
  if (!canOverrideFee()) return "admin";
  if (!file || file.status === "Canceled" || file.status === "Offered") return "closed";
  const plan = planById(planId);
  if (!plan || plan.id === file.planId) return "same";
  const price = termPrice(plan, file.years);
  const nextPrice = file.pay === "prepaid" ? price.prepaid : price.monthly;
  const kind = nextPrice > file.termPrice ? "upgrade" : "downgrade";
  const at = pretty(new Date());
  const by = actingName();
  const gap = file.pay === "prepaid" && kind === "upgrade" ? nextPrice - file.termPrice : 0;
  patchFile(id, (m) => ({
    ...m,
    planId: plan.id,
    planName: plan.name,
    termPrice: nextPrice,
    continueMonthly: plan.continueMonthly,
    visitsPerYear: plan.visitsPerYear,
    included: plan.included,
    repairDiscount: plan.repairDiscount,
    changes: pushChange(m, {
      id: `CH-${Date.now()}`,
      at,
      by,
      kind,
      from: `${m.planName} · ${m.termPrice}`,
      to: `${plan.name} · ${nextPrice}`,
      note: kind === "downgrade" ? "No automatic refund." : gap ? `Difference ${gap} is open on the ledger.` : "The next bill uses this price. A bill already open stays as it was.",
    }),
    ledger: gap
      ? [...(m.ledger ?? []), { id: `CH-pay-${Date.now()}`, at, amount: gap, status: "Open" as const, note: "Plan change. Difference. Not a refund." }]
      : m.ledger,
  }));
  addHistory(file.personId, by, `${kind === "upgrade" ? "Upgraded" : "Downgraded"} the membership from ${file.planName} to ${plan.name}.`);
  return "ok";
}
