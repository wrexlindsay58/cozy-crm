import { money } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { chargedFee, financeMonthly, offerPlans, optionTotal, payAmount, payLabel, type OptCard, type Proposal } from "./store";

export function PayOnOption({ proposal, option }: { proposal: Proposal; option: OptCard }) {
  const total = optionTotal(option);
  const sold = proposal.accepted === option.id;
  const offers = proposal.payOffers;
  if (!offers.length) return null;
  return (
    <div className="mt-3 border-t border-line pt-3">
      <p className="mb-1 text-[11px] font-bold tracking-wide text-muted uppercase">Payment</p>
      <ul>
        {offers
          .filter((o) => o.kind !== "finance")
          .map((o) => {
            const picked = sold && proposal.payPick?.offerId === o.id;
            return (
              <li key={o.id} className="flex items-baseline justify-between gap-4 border-t border-line py-1.5">
                <span className={cn("type-body", picked && "font-semibold text-navy")}>{payLabel(o)}</span>
                <span className="flex items-baseline gap-4">
                  {proposal.matchHighFee ? null : <span className="type-meta">{chargedFee(o) ? `${chargedFee(o)}%` : "No fee"}</span>}
                  <span className={cn("type-value", picked && "text-navy")}>{money(payAmount(proposal, total, o))}</span>
                </span>
              </li>
            );
          })}
        {offers
          .filter((o) => o.kind === "finance")
          .flatMap((o) =>
            offerPlans(o).map((plan) => {
              const picked = sold && proposal.payPick?.offerId === o.id && proposal.payPick?.term === plan.months && proposal.payPick?.apr === plan.apr;
              return (
                <li key={`${o.id}-${plan.months}-${plan.apr}`} className="flex items-baseline justify-between gap-4 border-t border-line py-1.5">
                  <span className={cn("flex gap-4", picked && "font-semibold text-navy")}>
                    <span className="type-body">{plan.months % 12 === 0 ? `${plan.months / 12} yr` : `${plan.months} mo`}</span>
                    <span className="type-body">{plan.apr}%</span>
                  </span>
                  <span className="flex items-baseline gap-4">
                    {proposal.matchHighFee ? null : <span className="type-meta">{chargedFee(o, plan)}%</span>}
                    <span className={cn("type-value", picked && "text-navy")}>{money(financeMonthly(payAmount(proposal, total, o, plan), plan.apr, plan.months))}/mo</span>
                  </span>
                </li>
              );
            }),
          )}
      </ul>
    </div>
  );
}
