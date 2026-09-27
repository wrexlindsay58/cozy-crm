import { money } from "@/lib/crm-data";
import { chargedFee, feeCeiling, financeMonthly, methodPlans, offerPlans, optionTotal, payAmount, payLabel, priceWithFee, togglePayPlan, type PayOffer, type Proposal } from "../store";
import { cn } from "@/lib/cn";

function termOf(months: number) {
  return months % 12 === 0 ? `${months / 12} yr` : `${months} mo`;
}

export function MatchedPay({ proposal }: { proposal: Proposal }) {
  const finance = proposal.payOffers.filter((o) => o.kind === "finance");
  const straight = proposal.payOffers.filter((o) => o.kind !== "finance");
  const ceiling = feeCeiling(proposal);
  if (!proposal.payOffers.length) return null;
  return (
    <div className="space-y-4">
      {proposal.matchHighFee ? <p className="type-meta">Every way to pay uses the {ceiling}% fee.</p> : null}
      {proposal.options.map((opt) => {
        const total = optionTotal(opt);
        return (
          <section key={opt.id} className="rounded-md border border-line p-3">
            <h4 className="type-group text-navy">{opt.name}</h4>
            <ul className="mt-2">
              {straight.map((offer) => {
                const own = priceWithFee(total, offer);
                const shown = payAmount(proposal, total, offer);
                const added = shown - own;
                return (
                  <li key={offer.id} className="flex items-center justify-between gap-4 border-t border-line py-2">
                    <span className="type-value">{payLabel(offer)}</span>
                    <span className="flex items-baseline gap-6">
                      {proposal.matchHighFee && added > 0 ? <span className="type-meta">Added {money(added)}</span> : null}
                      {proposal.matchHighFee ? null : <span className="type-meta">{chargedFee(offer) ? `${chargedFee(offer)}% fee` : "No fee"}</span>}
                      <span className="type-value text-navy">{money(shown)}</span>
                    </span>
                  </li>
                );
              })}
              {finance.flatMap((offer) =>
                offerPlans(offer).map((plan) => {
                  const shown = payAmount(proposal, total, offer, plan);
                  return (
                    <li key={`${offer.id}-${plan.months}-${plan.apr}`} className="flex items-center justify-between gap-4 border-t border-line py-2">
                      <span className="flex flex-wrap items-baseline gap-x-6">
                        <span className="type-value">{payLabel(offer)}</span>
                        <span className="type-body">{termOf(plan.months)}</span>
                        <span className="type-body">{plan.apr}%</span>
                        {proposal.matchHighFee ? null : <span className="type-meta">{chargedFee(offer, plan)}% fee</span>}
                      </span>
                      <span className="flex items-baseline gap-6">
                        {proposal.matchHighFee ? <span className="type-value text-navy">{money(shown)}</span> : null}
                        <span className="type-value text-navy">{money(financeMonthly(shown, plan.apr, plan.months))}/mo</span>
                      </span>
                    </li>
                  );
                }),
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export function RatePicks({ proposal, offer }: { proposal: Proposal; offer: PayOffer }) {
  const plans = methodPlans(offer);
  const chosen = offerPlans(offer);
  if (!plans.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {plans.map((plan) => {
        const on = chosen.some((p) => p.months === plan.months && p.apr === plan.apr);
        return (
          <button
            key={`${plan.months}-${plan.apr}`}
            type="button"
            onClick={() => togglePayPlan(proposal.oppId, offer.id, plan.months, plan.apr)}
            className={cn("inline-flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold", on ? "bg-navy text-card" : "border border-line")}
          >
            <span>{termOf(plan.months)}</span>
            <span>{plan.apr}%</span>
          </button>
        );
      })}
    </div>
  );
}
