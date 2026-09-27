import { proposals } from "./core";
import { payLabel } from "./seed-02";
import { bookFee } from "./pricing";
import { writeOffers, applyFee } from "./pricing-02";
import { canOverrideFee, feeApprover } from "@/features/staff/store";
import { createAction, deleteAction, patchAction } from "@/features/ops/store";

export function askFeeOverride(oppId: string, offerId: string, pct: number, reason: string, plan?: { months: number; apr: number }) {
  const p = proposals[oppId];
  const offer = p?.payOffers.find((o) => o.id === offerId);
  const clean = reason.trim();
  if (!p || !offer || !clean) return;
  const next = Math.max(0, Math.min(40, pct));
  const name = payLabel(offer);
  const which = plan ? ` ${plan.months % 12 === 0 ? `${plan.months / 12} yr` : `${plan.months} mo`} ${plan.apr}%` : "";
  const title = `Fee override: ${name}${which} ${bookFee(offer, plan)}% to ${next}%`;
  if (canOverrideFee()) {
    if (offer.feeAsk) deleteAction(offer.feeAsk.actionId);
    writeOffers(oppId, p.payOffers.map((o) => (o.id === offerId ? applyFee(o, next, plan) : o)));
    return;
  }
  const ask = { pct: next, reason: clean, actionId: offer.feeAsk?.actionId ?? "", months: plan?.months, apr: plan?.apr };
  if (offer.feeAsk) {
    patchAction(offer.feeAsk.actionId, { title, description: clean });
    writeOffers(oppId, p.payOffers.map((o) => (o.id === offerId ? { ...o, feeAsk: { ...ask, actionId: offer.feeAsk!.actionId } } : o)));
    return;
  }
  const row = createAction({
    kind: "request",
    personId: p.personId,
    title,
    owner: feeApprover(),
    description: clean,
    category: "Payment",
  });
  if (!row) return;
  writeOffers(oppId, p.payOffers.map((o) => (o.id === offerId ? { ...o, feeAsk: { ...ask, actionId: row.id } } : o)));
}

export function settleFeeOverride(oppId: string, offerId: string, decision: "approve" | "deny", pct?: number) {
  const p = proposals[oppId];
  const offer = p?.payOffers.find((o) => o.id === offerId);
  if (!p || !offer?.feeAsk || !canOverrideFee()) return;
  deleteAction(offer.feeAsk.actionId);
  const ask = offer.feeAsk;
  const plan = ask.months != null && ask.apr != null ? { months: ask.months, apr: ask.apr } : undefined;
  writeOffers(
    oppId,
    p.payOffers.map((o) => {
      if (o.id !== offerId) return o;
      if (decision === "deny") return { ...o, feeAsk: undefined };
      return applyFee(o, Math.max(0, Math.min(40, pct ?? ask.pct)), plan);
    }),
  );
}
