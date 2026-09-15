import { money } from "@/lib/crm-data";
import { applyGoodLeap, dealerFee, demoMonthly, optionTotal, setGoodLeapTerm, setPay, type Proposal } from "./store";
import { cn } from "@/lib/cn";
import { useMoneySettings } from "@/features/money-settings/store";

export function PayTiles({ proposal }: { proposal: Proposal }) {
  useMoneySettings();
  const accepted = proposal.options.find((o) => o.id === proposal.accepted) ?? proposal.options[0];
  const total = accepted ? optionTotal(accepted) : 0;
  const fee = dealerFee(total);
  const withFee = proposal.pay === "goodleap" ? total + fee : total;
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Pay</h2>
      <div className="grid gap-2 md:grid-cols-3">
        <button type="button" onClick={() => setPay(proposal.oppId, "cash")} className={cn("rounded-md border p-3 text-left", proposal.pay === "cash" ? "border-navy bg-navy text-card" : "border-line")}>
          <p className="text-xs font-bold tracking-wide uppercase">Cash</p>
          <p className="mt-1 text-lg font-extrabold tabular-nums">{money(total)}</p>
        </button>
        <button type="button" onClick={() => setPay(proposal.oppId, "12mo")} className={cn("rounded-md border p-3 text-left", proposal.pay === "12mo" ? "border-navy bg-navy text-card" : "border-line")}>
          <p className="text-xs font-bold tracking-wide uppercase">12-month</p>
          <p className="mt-1 text-lg font-extrabold tabular-nums">{money(demoMonthly(total, 12))}/mo</p>
        </button>
        <div className={cn("rounded-md border p-3", proposal.pay === "goodleap" ? "border-navy bg-navy text-card" : "border-line")}>
          <p className="text-xs font-bold tracking-wide uppercase">GoodLeap (demo)</p>
          <div className="mt-2 flex gap-1">
            {(["10yr", "12yr"] as const).map((term) => (
              <button key={term} type="button" onClick={() => { setPay(proposal.oppId, "goodleap"); setGoodLeapTerm(proposal.oppId, term); }} className={cn("h-9 flex-1 rounded-md text-xs font-semibold", proposal.pay === "goodleap" && proposal.goodleapTerm === term ? "bg-card text-navy" : "border border-line bg-card text-ink")}>
                {term} · {money(demoMonthly(withFee, term === "10yr" ? 120 : 144))}/mo
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs">Status: <b>{proposal.goodleapStatus}</b></p>
          {proposal.pay === "goodleap" ? <p className="mt-1 text-xs">Dealer fee {money(fee)}</p> : null}
          <button type="button" onClick={() => applyGoodLeap(proposal.oppId)} className={cn("mt-2 h-10 w-full rounded-md text-sm font-semibold", proposal.pay === "goodleap" ? "bg-card text-navy" : "bg-navy text-card")}>
            Apply (demo)
          </button>
        </div>
      </div>
    </section>
  );
}
