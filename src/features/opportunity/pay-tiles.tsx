import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { money } from "@/lib/crm-data";
import { chargedFee, feeCeiling, financeMonthly, methodPlans, offerPlans, optionTotal, payAmount, payLabel, priceWithFee, removePayOffer, setMatchHighFee, togglePayPlan, addPayOffer, type PayOffer, type Proposal } from "./store";
import { cn } from "@/lib/cn";
import { useMoneySettings } from "@/features/money-settings/store";
import { Float } from "@/components/float";

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

function RatePicks({ proposal, offer }: { proposal: Proposal; offer: PayOffer }) {
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

export function PayTiles({ proposal }: { proposal: Proposal }) {
  const { financers } = useMoneySettings();
  const openMethods = financers.filter(
    (f) => f.active && !proposal.payOffers.some((o) => o.methodId === f.id || (f.kind !== "finance" && o.kind === f.kind) || (f.kind === "finance" && o.financer === f.name)),
  );
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);

  return (
    <section className="rounded-md border border-line bg-card p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Payment</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMatchHighFee(proposal.oppId, !proposal.matchHighFee)}
            className={cn("h-10 rounded-md px-3 text-sm font-semibold", proposal.matchHighFee ? "bg-navy text-card" : "border border-line")}
          >
            Match to highest fee
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-1 rounded-md bg-navy px-3 text-sm font-semibold text-card"
            onClick={(e) => {
              setAnchor(e.currentTarget.getBoundingClientRect());
              setOpen((v) => !v);
            }}
          >
            <Plus className="size-4" />
            Add
          </button>
        </div>
        {open && anchor ? (
          <Float anchor={anchor} prefer="bottom" onClose={() => setOpen(false)}>
            {openMethods.length === 0 ? <p className="px-3 py-2 text-sm text-muted">Every method in settings is already on this option.</p> : null}
            {openMethods.map((m) => (
              <button
                key={m.id}
                type="button"
                className="flex h-10 w-full min-w-52 items-center justify-between gap-3 px-3 text-sm hover:bg-page"
                onClick={() => {
                  addPayOffer(proposal.oppId, m.id);
                  setOpen(false);
                }}
              >
                <span>{m.name}</span>
                <span className="tabular-nums text-muted">{m.feePct}%</span>
              </button>
            ))}
          </Float>
        ) : null}
      </div>
      {proposal.payOffers.length === 0 ? <p className="text-sm text-muted">Turn a method on in settings, then add it here.</p> : null}
      <div className="space-y-4">
        {proposal.payOffers.map((offer) => (
          <div key={offer.id}>
            <div className="flex items-center justify-between gap-2">
              <p className="type-group">{payLabel(offer)}</p>
              <button type="button" aria-label={`Remove ${payLabel(offer)}`} className="grid size-8 place-items-center text-muted hover:text-alert" onClick={() => removePayOffer(proposal.oppId, offer.id)}>
                <Trash2 className="size-4" />
              </button>
            </div>
            {offer.kind === "finance" ? (
              <RatePicks proposal={proposal} offer={offer} />
            ) : (
              <div className="mt-1">
                <p className="type-meta">{chargedFee(offer) ? `${chargedFee(offer)}% fee from settings` : "No fee"}</p>
                {proposal.matchHighFee
                  ? proposal.options.map((opt) => {
                      const total = optionTotal(opt);
                      const added = payAmount(proposal, total, offer) - priceWithFee(total, offer);
                      if (added <= 0) return null;
                      return (
                        <p key={opt.id} className="type-body mt-1">
                          {opt.name}
                          <span className="type-meta"> Added {money(added)}</span>
                        </p>
                      );
                    })
                  : null}
              </div>
            )}
          </div>
        ))}
      </div>
      {proposal.payOffers.length ? (
        <div className="mt-6 border-t border-line pt-4">
          <MatchedPay proposal={proposal} />
        </div>
      ) : null}
    </section>
  );
}