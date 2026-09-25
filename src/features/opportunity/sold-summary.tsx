import { money } from "@/lib/crm-data";
import { picksOn } from "./proposal-copy";
import { chargedFee, financeMonthly, isProductLine, offerPlans, optionRollup, payAmount, payLabel, type Proposal } from "./store";

export function PriceLines({ roll }: { roll: ReturnType<typeof optionRollup> }) {
  return (
    <dl className="mt-3 space-y-1 text-sm">
      <div className="flex justify-between gap-3">
        <dt>Discount</dt>
        <dd className="tabular-nums">{money(roll.discount)}</dd>
      </div>
      {roll.pos ? (
        <div className="flex justify-between gap-3">
          <dt>Rebate at sale</dt>
          <dd className="tabular-nums">{money(roll.pos)}</dd>
        </div>
      ) : null}
      <div className="flex justify-between gap-3 border-t border-line pt-1 font-extrabold">
        <dt>You pay</dt>
        <dd className="tabular-nums">{money(roll.total)}</dd>
      </div>
      {roll.after ? (
        <>
          <div className="flex justify-between gap-3">
            <dt>Rebate after</dt>
            <dd className="tabular-nums">{money(roll.after)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Cost after rebate</dt>
            <dd className="tabular-nums">{money(roll.later)}</dd>
          </div>
        </>
      ) : null}
    </dl>
  );
}

export function SoldSummary({ proposal }: { proposal: Proposal }) {
  const sold = proposal.options.find((o) => o.id === proposal.accepted);
  const pay = proposal.payOffers.find((o) => o.id === proposal.payPick?.offerId);
  if (!sold) return <p className="type-meta">No option accepted.</p>;
  const roll = optionRollup(sold);
  const included = sold.lines.filter((l) => isProductLine(l) || l.kind === "adder" || l.adder);
  const plans = pay ? offerPlans(pay) : [];
  const plan = plans.find((p) => p.months === proposal.payPick?.term && p.apr === proposal.payPick?.apr) ?? plans[0];
  const priced = pay ? payAmount(proposal, roll.total, pay, pay.kind === "finance" ? plan : undefined) : roll.total;
  return (
    <div>
      <p className="type-label">{sold.name}</p>
      <ul className="mt-2 space-y-1">
        {included.map((l) => (
          <li key={l.sku} className="type-body">
            {l.label}
            {picksOn(l) ? <span className="type-meta"> · {picksOn(l)}</span> : null}
          </li>
        ))}
      </ul>
      <PriceLines roll={roll} />
      {pay ? (
        <p className="type-meta mt-2">
          {payLabel(pay)}
          {plan ? ` · ${plan.apr}% · ${chargedFee(pay, plan)}% fee` : chargedFee(pay) ? ` · ${chargedFee(pay)}%` : ""}
          {" · "}
          {pay.kind === "finance" && plan ? `${money(financeMonthly(priced, plan.apr, plan.months))}/mo` : money(priced)}
          {roll.after ? ". After-sale rebate is not in this payment." : ""}
        </p>
      ) : null}
    </div>
  );
}
