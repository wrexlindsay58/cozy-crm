import type { PayOffer, Proposal } from "./types";
import { methodPlans, bundledDue } from "./events";
import { proposals, write_proposals, emit } from "./core";
import { addHistory } from "@/features/ops/store";
import { activePayMethods, payMethod, type FinancePlan } from "@/features/money-settings/store";
import { actingName } from "@/features/staff/store";
import { leads } from "@/lib/crm-data";
import { acceptMembership, membershipFor, placeOffer, setPlanFee } from "@/features/membership/store";
import type { MemberOffer } from "@/features/membership/types";

export function offerMethod(offer: PayOffer) {
  return (offer.methodId && payMethod(offer.methodId)) || (offer.financer && payMethod(offer.financer)) || activePayMethods().find((m) => m.kind === offer.kind && m.kind !== "finance");
}

export function offerPlans(offer: PayOffer): FinancePlan[] {
  const plans = methodPlans(offer);
  const picked = offer.pickedPlans ?? [];
  return plans.filter((p) => picked.some((s) => s.months === p.months && s.apr === p.apr));
}

export function bookFee(offer: PayOffer, plan?: { months: number; apr: number }) {
  if (plan) {
    const hit = offerMethod(offer)?.plans?.find((p) => p.months === plan.months && p.apr === plan.apr);
    if (hit) return hit.feePct;
  }
  return offerMethod(offer)?.feePct ?? 0;
}

export function chargedFee(offer: PayOffer, plan?: { months: number; apr: number }) {
  if (plan) {
    const over = offer.planFees?.find((p) => p.months === plan.months && p.apr === plan.apr);
    if (over) return over.pct;
    return bookFee(offer, plan);
  }
  return offer.feeOverride ?? bookFee(offer);
}

export function priceWithFee(total: number, offer: PayOffer, plan?: { months: number; apr: number }) {
  return Math.round(total * (1 + chargedFee(offer, plan) / 100));
}

export function feeCeiling(proposal: Proposal) {
  let max = 0;
  for (const offer of proposal.payOffers) {
    if (offer.kind === "finance") {
      for (const plan of offerPlans(offer)) max = Math.max(max, chargedFee(offer, plan));
    } else max = Math.max(max, chargedFee(offer));
  }
  return max;
}

export function payAmount(proposal: Proposal, total: number, offer: PayOffer, plan?: { months: number; apr: number }) {
  const fee = proposal.matchHighFee ? feeCeiling(proposal) : chargedFee(offer, plan);
  return Math.round(total * (1 + fee / 100));
}

export function setMemberOffer(oppId: string, offer: MemberOffer | null) {
  const p = proposals[oppId];
  if (!p || p.memberOffer?.accepted) return;
  const next = { ...p, memberOffer: offer ?? undefined };
  write_proposals({ ...proposals, [oppId]: next });
  emit();
  if (!offer) return;
  const lead = leads.find((l) => l.id === p.personId);
  if (!lead) return;
  const pay = next.payOffers.find((o) => o.id === next.payPick?.offerId) ?? next.payOffers[0];
  const finance = pay?.kind === "finance" ? (offerPlans(pay).find((row) => row.months === next.payPick?.term && row.apr === next.payPick?.apr) ?? offerPlans(pay)[0]) : undefined;
  const fee = pay ? bundledDue(next, 0, pay, finance).planFee : 0;
  placeOffer({
    personId: lead.id,
    name: lead.name,
    address: lead.address,
    city: lead.city,
    office: lead.office,
    owner: p.closer,
    oppId,
    planId: offer.planId,
    planName: offer.planName,
    years: offer.years,
    pay: offer.pay,
    termPrice: offer.termPrice,
    continueMonthly: offer.continueMonthly,
    visitsPerYear: offer.visitsPerYear,
    funding: offer.pay === "billed" ? "membership" : offer.funding,
  });
  setPlanFee(lead.id, fee);
}

export function signMemberPlan(oppId: string, signer: string, company: string) {
  const p = proposals[oppId];
  const offer = p?.memberOffer;
  if (!p || !offer || offer.accepted) return false;
  const lead = leads.find((l) => l.id === p.personId);
  if (!lead || !signer.trim()) return false;
  const existing = membershipFor(p.personId);
  const signed = existing
    ? acceptMembership(existing.id, signer.trim(), company)
    : placeOffer({
        personId: lead.id,
        name: lead.name,
        address: lead.address,
        city: lead.city,
        office: lead.office,
        owner: p.closer,
        oppId,
        planId: offer.planId,
        planName: offer.planName,
        years: offer.years,
        pay: offer.pay,
        termPrice: offer.termPrice,
        continueMonthly: offer.continueMonthly,
        visitsPerYear: offer.visitsPerYear,
        funding: offer.pay === "billed" ? "membership" : offer.funding,
        sign: { signer: signer.trim(), company },
      });
  if (!signed || signed === "locked") return false;
  write_proposals({ ...proposals, [oppId]: { ...p, memberOffer: { ...offer, accepted: true, signerName: signer.trim() } } });
  if (!existing) addHistory(p.personId, actingName(), `Signed the ${offer.planName} membership, ${offer.years} years. Separate from the install.`);
  emit();
  return true;
}

export function noteMemberSigned(oppId: string, signer: string) {
  const p = proposals[oppId];
  if (!p?.memberOffer || p.memberOffer.accepted) return;
  write_proposals({ ...proposals, [oppId]: { ...p, memberOffer: { ...p.memberOffer, accepted: true, signerName: signer } } });
  emit();
}
