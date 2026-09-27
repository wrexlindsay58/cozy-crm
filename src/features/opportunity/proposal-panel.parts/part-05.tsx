import { money } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { picksOn } from "../proposal-copy";
import { acceptOption, chargedFee, financeMonthly, isProductLine, offerPlans, optionRollup, payAmount, payLabel, priceWithFee, unacceptOption } from "../store";

export function ProposalPanelView60(props: { bag: { proposal: any } }) {
  const { proposal } = props.bag;
  return (
    <ul className="space-y-3">
        {proposal.options.map((o: any) => {
          const on = o.id === proposal.accepted;
          const roll = optionRollup(o);
          const included = o.lines.filter((l: any) => isProductLine(l) || l.kind === "adder" || l.adder);
          return (
            <li key={o.id} className={cn("rounded-md border p-3", on ? "border-navy bg-info-bg/40 ring-1 ring-navy" : "border-line")}>
              <div className="flex items-baseline justify-between gap-4">
                <p className="type-group">{o.name || "Untitled option"}</p>
                <p className="type-value text-navy">{money(roll.total)}</p>
              </div>
              <p className="type-meta mt-0.5">{on ? "Sold" : proposal.accepted ? "Locked" : "Open"}</p>
              {included.length ? (
                <ul className="mt-3 list-disc space-y-1 pl-5">
                  {included.map((l: any) => (
                    <li key={l.sku} className="type-body">
                      {l.label}
                      {picksOn(l) ? <span className="type-meta"> {picksOn(l)}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="type-meta mt-2">No products yet.</p>
              )}
              <dl className="mt-3 space-y-1">
                <div className="flex justify-between gap-4">
                  <dt className="type-meta">Discount</dt>
                  <dd className="type-value">{money(roll.discount)}</dd>
                </div>
                {roll.pos ? (
                  <div className="flex justify-between gap-4">
                    <dt className="type-meta">Rebate at sale</dt>
                    <dd className="type-value">{money(roll.pos)}</dd>
                  </div>
                ) : null}
                {roll.after ? (
                  <div className="flex justify-between gap-4">
                    <dt className="type-meta">Rebate after</dt>
                    <dd className="type-value">{money(roll.after)}</dd>
                  </div>
                ) : null}
              </dl>
              {proposal.payOffers.length ? (
                <ul className="mt-3">
                  {proposal.payOffers
                    .filter((offer: any) => offer.kind !== "finance")
                    .map((offer: any) => {
                      const shown = payAmount(proposal, roll.total, offer);
                      const added = shown - priceWithFee(roll.total, offer);
                      return (
                        <li key={offer.id} className="flex items-baseline justify-between gap-4 border-t border-line py-1.5">
                          <span className="type-value">{payLabel(offer)}</span>
                          <span className="flex items-baseline gap-4">
                            {proposal.matchHighFee && added > 0 ? <span className="type-meta">Added {money(added)}</span> : null}
                            {proposal.matchHighFee ? null : <span className="type-meta">{chargedFee(offer) ? `${chargedFee(offer)}%` : "No fee"}</span>}
                            <span className="type-value text-navy">{money(shown)}</span>
                          </span>
                        </li>
                      );
                    })}
                  {proposal.payOffers
                    .filter((offer: any) => offer.kind === "finance")
                    .flatMap((offer: any) =>
                      offerPlans(offer).map((plan) => {
                        const shown = payAmount(proposal, roll.total, offer, plan);
                        return (
                          <li key={`${offer.id}-${plan.months}-${plan.apr}`} className="flex items-baseline justify-between gap-4 border-t border-line py-1.5">
                            <span className="flex flex-wrap items-baseline gap-x-4">
                              <span className="type-value">{payLabel(offer)}</span>
                              <span className="type-body">{plan.months % 12 === 0 ? `${plan.months / 12} yr` : `${plan.months} mo`}</span>
                              <span className="type-body">{plan.apr}%</span>
                            </span>
                            <span className="flex items-baseline gap-4">
                              {proposal.matchHighFee ? null : <span className="type-meta">{chargedFee(offer, plan)}%</span>}
                              <span className="type-value text-navy">{money(shown)}</span>
                              <span className="type-body">{money(financeMonthly(shown, plan.apr, plan.months))}/mo</span>
                            </span>
                          </li>
                        );
                      }),
                    )}
                </ul>
              ) : null}
              {on ? (
                <button type="button" className="mt-3 h-10 rounded-md border border-navy px-3 text-sm font-semibold text-navy" onClick={() => unacceptOption(proposal.oppId)}>
                  Unaccept
                </button>
              ) : proposal.accepted ? null : (
                <button type="button" className="mt-3 h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => acceptOption(proposal.oppId, o.id)}>
                  Accept this option
                </button>
              )}
            </li>
          );
        })}
      </ul>
  );
}
