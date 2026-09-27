import { proposals, write_proposals, emit } from "./core";
import type { Proposal, PayOffer } from "./types";
import { methodPlans } from "./events";
import { addHistory, deleteAction } from "@/features/ops/store";
import { getDealerFeePct, payMethod } from "@/features/money-settings/store";
import { actingName } from "@/features/staff/store";

export function setMatchHighFee(oppId: string, on: boolean) {
  const p = proposals[oppId];
  if (!p) return;
  write_proposals({ ...proposals, [oppId]: { ...p, matchHighFee: on } });
  emit();
}

export function financeMonthly(principal: number, apr: number, months: number) {
  if (months <= 0) return 0;
  if (!apr) return Math.round(principal / months);
  const r = apr / 100 / 12;
  const pow = (1 + r) ** months;
  return Math.round((principal * r * pow) / (pow - 1));
}

export function dealerFee(total: number) {
  return Math.round(total * (getDealerFeePct() / 100));
}

export function setPay(oppId: string, pay: Proposal["pay"]) {
  const p = proposals[oppId];
  if (!p) return;
  write_proposals({ ...proposals, [oppId]: { ...p, pay } });
  emit();
}

export function setGoodLeapTerm(oppId: string, term: Proposal["goodleapTerm"]) {
  const p = proposals[oppId];
  if (!p) return;
  write_proposals({ ...proposals, [oppId]: { ...p, goodleapTerm: term } });
  emit();
}

export function applyGoodLeap(oppId: string) {
  const p = proposals[oppId];
  if (!p) return;
  write_proposals({ ...proposals, [oppId]: { ...p, goodleapStatus: "Sent", pay: "goodleap" } });
  addHistory(p.personId, actingName(), "GoodLeap apply — status Sent.");
  emit();
}

export function addPayOffer(oppId: string, methodId: string) {
  const p = proposals[oppId];
  const method = payMethod(methodId);
  if (!p || !method || !method.active) return;
  if (p.payOffers.some((o) => o.methodId === method.id || (o.kind === method.kind && o.financer === (method.kind === "finance" ? method.name : undefined) && o.kind !== "finance"))) return;
  if (p.payOffers.some((o) => o.kind !== "finance" && o.kind === method.kind)) return;
  const offer: PayOffer = {
    id: `PAY-${Date.now()}`,
    kind: method.kind,
    methodId: method.id,
    financer: method.kind === "finance" ? method.name : undefined,
    terms: method.kind === "finance" ? [] : method.terms,
    pickedPlans: [],
  };
  const payPick = p.payPick ?? { offerId: offer.id, term: offer.terms[0] };
  write_proposals({ ...proposals, [oppId]: { ...p, payOffers: [...p.payOffers, offer], payPick } });
  emit();
}

export function removePayOffer(oppId: string, id: string) {
  const p = proposals[oppId];
  if (!p) return;
  const gone = p.payOffers.find((o) => o.id === id);
  if (gone?.feeAsk) deleteAction(gone.feeAsk.actionId);
  const payOffers = p.payOffers.filter((o) => o.id !== id);
  const payPick = p.payPick?.offerId === id ? (payOffers[0] ? { offerId: payOffers[0].id, term: payOffers[0].terms[0] } : undefined) : p.payPick;
  write_proposals({ ...proposals, [oppId]: { ...p, payOffers, payPick } });
  emit();
}

export function setPayFinancer(oppId: string, id: string, financer: string) {
  const p = proposals[oppId];
  if (!p) return;
  write_proposals({ ...proposals, [oppId]: { ...p, payOffers: p.payOffers.map((o) => (o.id === id ? { ...o, financer } : o)) } });
  emit();
}

export function togglePayPlan(oppId: string, id: string, months: number, apr: number) {
  const p = proposals[oppId];
  if (!p) return;
  write_proposals({
    ...proposals,
    [oppId]: {
      ...p,
      payOffers: p.payOffers.map((o) => {
        if (o.id !== id) return o;
        const allowed = methodPlans(o);
        if (!allowed.some((plan) => plan.months === months && plan.apr === apr)) return o;
        const on = (o.pickedPlans ?? []).some((plan) => plan.months === months && plan.apr === apr);
        const pickedPlans = on ? (o.pickedPlans ?? []).filter((plan) => plan.months !== months || plan.apr !== apr) : [...(o.pickedPlans ?? []), { months, apr }];
        pickedPlans.sort((a, b) => a.months - b.months || a.apr - b.apr);
        return { ...o, pickedPlans, terms: [...new Set(pickedPlans.map((plan) => plan.months))] };
      }),
    },
  });
  emit();
}

export function writeOffers(oppId: string, offers: PayOffer[]) {
  const p = proposals[oppId];
  if (!p) return;
  write_proposals({ ...proposals, [oppId]: { ...p, payOffers: offers } });
  emit();
}

export function applyFee(offer: PayOffer, pct: number, plan?: { months: number; apr: number }) {
  if (!plan) return { ...offer, feeOverride: pct, feeAsk: undefined };
  const rest = (offer.planFees ?? []).filter((p) => p.months !== plan.months || p.apr !== plan.apr);
  return { ...offer, planFees: [...rest, { ...plan, pct }], feeAsk: undefined };
}
