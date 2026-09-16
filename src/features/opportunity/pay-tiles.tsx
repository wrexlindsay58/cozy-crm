import { useState } from "react";
import { Plus, X } from "lucide-react";
import { money } from "@/lib/crm-data";
import { addPayOffer, demoMonthly, optionTotal, removePayOffer, setPayFinancer, togglePayTerm, type PayKind, type Proposal } from "./store";
import { cn } from "@/lib/cn";
import { useMoneySettings } from "@/features/money-settings/store";
import { Float } from "@/components/float";

const TERM_PICKS = [
  { months: 60, label: "5 yr" },
  { months: 120, label: "10 yr" },
  { months: 144, label: "12 yr" },
  { months: 180, label: "15 yr" },
  { months: 240, label: "20 yr" },
];

const ADD: { kind: PayKind; label: string }[] = [
  { kind: "cash", label: "Cash" },
  { kind: "card", label: "Credit card" },
  { kind: "finance", label: "Financing" },
];

export function PayTiles({ proposal }: { proposal: Proposal }) {
  const { financers } = useMoneySettings();
  const shops = financers.filter((f) => f.active && f.name !== "Cash");
  const accepted = proposal.options.find((o) => o.id === proposal.accepted) ?? proposal.options[0];
  const total = accepted ? optionTotal(accepted) : 0;
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);

  return (
    <section className="rounded-md border border-line bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Payment options</h2>
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
        {open && anchor ? (
          <Float anchor={anchor} prefer="bottom" onClose={() => setOpen(false)}>
            {ADD.map((a) => (
              <button
                key={a.kind}
                type="button"
                className="flex h-10 w-full min-w-40 items-center px-3 text-sm hover:bg-page"
                onClick={() => {
                  addPayOffer(proposal.oppId, a.kind);
                  setOpen(false);
                }}
              >
                {a.label}
              </button>
            ))}
          </Float>
        ) : null}
      </div>
      {proposal.payOffers.length === 0 ? <p className="text-sm text-muted">Add cash, credit card, or financing before you generate.</p> : null}
      <div className="space-y-2">
        {proposal.payOffers.map((offer) => {
          const shop = shops.find((f) => f.name === offer.financer) ?? shops[0];
          const fee = offer.kind === "finance" ? Math.round(total * ((shop?.feePct ?? 0) / 100)) : 0;
          const financed = total + fee;
          return (
            <article key={offer.id} className="rounded-md border border-line p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold tracking-wide text-muted uppercase">
                    {offer.kind === "cash" ? "Cash" : offer.kind === "card" ? "Credit card" : "Financing"}
                  </p>
                  {offer.kind !== "finance" ? <p className="mt-1 text-lg font-extrabold tabular-nums">{money(total)}</p> : null}
                  {offer.kind === "finance" ? (
                    <div className="mt-2 space-y-2">
                      <label className="block text-[11px] font-bold tracking-wide text-muted uppercase">
                        Company
                        <select
                          value={offer.financer ?? shop?.name ?? ""}
                          onChange={(e) => setPayFinancer(proposal.oppId, offer.id, e.target.value)}
                          className="mt-1 h-10 w-full rounded-md border border-line bg-card px-2 text-sm font-semibold normal-case tracking-normal"
                        >
                          {shops.map((f) => (
                            <option key={f.id} value={f.name}>
                              {f.name}
                              {f.feePct ? ` · ${f.feePct}% fee` : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {TERM_PICKS.map((t) => {
                          const on = offer.terms.includes(t.months);
                          return (
                            <button
                              key={t.months}
                              type="button"
                              onClick={() => togglePayTerm(proposal.oppId, offer.id, t.months)}
                              className={cn("h-10 rounded-md px-3 text-sm font-semibold", on ? "bg-navy text-card" : "border border-line")}
                            >
                              {t.label} · {money(demoMonthly(financed, t.months))}/mo
                            </button>
                          );
                        })}
                      </div>
                      {fee ? <p className="text-[11px] text-muted">Dealer fee {money(fee)} on the financed amount.</p> : null}
                    </div>
                  ) : null}
                </div>
                <button type="button" aria-label="Remove payment option" className="grid size-8 shrink-0 place-items-center text-muted hover:text-alert" onClick={() => removePayOffer(proposal.oppId, offer.id)}>
                  <X className="size-4" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
