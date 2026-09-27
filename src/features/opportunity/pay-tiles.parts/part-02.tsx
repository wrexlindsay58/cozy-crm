import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { money } from "@/lib/crm-data";
import { chargedFee, optionTotal, payAmount, payLabel, priceWithFee, removePayOffer, setMatchHighFee, addPayOffer, type Proposal } from "../store";
import { cn } from "@/lib/cn";
import { useMoneySettings } from "@/features/money-settings/store";
import { Float } from "@/components/float";
import { MatchedPay, RatePicks } from "./part-01";

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
