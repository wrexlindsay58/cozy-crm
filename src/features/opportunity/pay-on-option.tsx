import { money } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { demoMonthly, optionTotal, type OptCard, type Proposal } from "./store";
import { useMoneySettings } from "@/features/money-settings/store";

export function PayOnOption({ proposal, option }: { proposal: Proposal; option: OptCard }) {
  const total = optionTotal(option);
  const sold = proposal.accepted === option.id;
  const { financers } = useMoneySettings();
  const offers = proposal.payOffers;
  if (!offers.length) return null;
  return (
    <div className="mt-3 border-t border-line pt-3">
      <p className="mb-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">Payment</p>
      <ul className="space-y-1">
        {offers.map((o) => {
          const picked = sold && proposal.payPick?.offerId === o.id;
          const shop = financers.find((f) => f.name === o.financer);
          const feePct = o.kind === "finance" ? (shop?.feePct ?? 0) / 100 : 0;
          const name = o.kind === "cash" ? "Cash" : o.kind === "card" ? "Credit card" : o.financer || "Financing";
          let amt = money(total);
          if (o.kind === "finance") {
            const months = (picked ? proposal.payPick?.term : undefined) ?? o.terms[0] ?? 120;
            amt = `${money(demoMonthly(Math.round(total * (1 + feePct)), months))}/mo`;
            const yrs = months / 12;
            return (
              <li key={o.id} className={cn("flex items-baseline justify-between gap-3 text-sm", picked && "font-semibold text-navy")}>
                <span>
                  {name} · {yrs} yr
                  {picked ? " · sold" : ""}
                </span>
                <span className="tabular-nums">{amt}</span>
              </li>
            );
          }
          return (
            <li key={o.id} className={cn("flex items-baseline justify-between gap-3 text-sm", picked && "font-semibold text-navy")}>
              <span>
                {name}
                {picked ? " · sold" : ""}
              </span>
              <span className="tabular-nums">{amt}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}