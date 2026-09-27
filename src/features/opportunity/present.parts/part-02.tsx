import { ChevronLeft, Link2, Printer, X } from "lucide-react";
import { CozyWordmark } from "@/components/cozy-mark";
import { money } from "@/lib/crm-data";
import { addPayOffer, bundledDue, financeMonthly, offerPlans, optionTotal, payAmount, payLabel, setPayPick } from "../store";
import { MoneyBars, StepRail } from "../present-viz";
import { cn } from "@/lib/cn";
import { PresentView12 } from "./part-03";

export function PresentView(props: { bag: { opt: any; bundle: any; proposal: any; payOffer: any; plan: any; shownDue: any; total: any; picked: any; staff: any; financers: any; term: any; plans: any; go: any } }) {
  const { opt, bundle, proposal, payOffer, plan, shownDue, total, picked, staff, financers, term, plans, go } = props.bag;
  return (
    <section className="grid min-h-[calc(100dvh-56px)] lg:grid-cols-2">
          <div className="flex flex-col justify-between bg-[var(--p-navy)] p-6 text-white md:p-12">
            <p className="p-sub text-[11px] text-white/60">{opt?.name}</p>
            <div>
              <p className="p-sub text-[11px] text-white/60">{bundle?.ride ? (proposal.memberOffer?.funding === "loan" ? "Financed" : "Due") : payOffer?.kind === "finance" ? "Monthly" : "Investment"}</p>
              <p className="p-head mt-2 text-6xl md:text-8xl">
                {payOffer?.kind === "finance" && plan ? money(financeMonthly(shownDue, plan.apr, plan.months)) : money(shownDue)}
                {payOffer?.kind === "finance" ? <span className="text-3xl">/mo</span> : null}
              </p>
              {proposal.memberOffer ? (
                <p className="mt-4 text-sm text-white/80">
                  Install {money(bundle?.install ?? total)}
                  {bundle?.ride ? ` · Plan ${money(bundle.plan)} · Fee on the plan ${money(bundle.planFee)}` : proposal.memberOffer.pay === "billed" ? ` · Plan ${money(proposal.memberOffer.termPrice)}/mo on the membership` : ` · Plan ${money(proposal.memberOffer.termPrice)} on the membership`}
                </p>
              ) : null}
            </div>
            <p className="text-sm text-white/70">Set on the file. You can still switch.</p>
          </div>
          <div className="bg-[var(--p-paper)] p-6 md:p-12">
            <div className="bg-white p-6">
              <p className="p-sub mb-4 text-[11px] text-[var(--p-gray)]">All options</p>
              <MoneyBars rows={proposal.options.map((o: any) => ({ id: o.id, name: o.name, amount: optionTotal(o) }))} picked={picked} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {staff
                ? financers
                    .filter((m: any) => m.active && !proposal.payOffers.some((o: any) => o.methodId === m.id || (m.kind !== "finance" && o.kind === m.kind) || (m.kind === "finance" && o.financer === m.name)))
                    .map((m: any) => (
                      <button key={m.id} type="button" className="h-10 border border-[var(--p-trim)] bg-white px-3 text-xs font-semibold uppercase tracking-wider text-[var(--p-gray)]" onClick={() => addPayOffer(proposal.oppId, m.id)}>
                        Add {m.name}
                      </button>
                    ))
                : null}
            </div>
            <div className="mt-4 grid gap-2">
              {proposal.payOffers.map((offer: any) => {
                const on = payOffer?.id === offer.id;
                const first = offerPlans(offer)[0];
                const row = bundledDue(proposal, total, offer, offer.kind === "finance" ? first : undefined);
                const rowDue = row.ride ? row.due : payAmount(proposal, total, offer, offer.kind === "finance" ? first : undefined);
                return (
                  <button
                    key={offer.id}
                    type="button"
                    onClick={() => {
                      setPayPick(proposal.oppId, offer.id, first?.months, first?.apr);
                    }}
                    className={cn("bg-white px-5 py-4 text-left", on ? "outline outline-2 outline-[var(--p-navy)]" : "border border-[var(--p-trim)]")}
                  >
                    <p className="p-sub text-[11px] text-[var(--p-gray)]">{payLabel(offer)}</p>
                    <p className="p-head mt-1 text-3xl text-[var(--p-navy)]">
                      {offer.kind === "finance"
                        ? `${money(financeMonthly(rowDue, first?.apr ?? 0, first?.months ?? term))}/mo`
                        : money(rowDue)}
                    </p>
                  </button>
                );
              })}
            </div>
            {payOffer?.kind === "finance" ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {plans.map((p: any) => (
                  <button
                    key={`${p.months}-${p.apr}`}
                    type="button"
                    onClick={() => setPayPick(proposal.oppId, payOffer.id, p.months, p.apr)}
                    className={cn("h-12 px-4 text-sm font-semibold", plan?.months === p.months && plan?.apr === p.apr ? "bg-[var(--p-navy)] text-white" : "border border-[var(--p-trim)] bg-white")}
                  >
                    {p.months % 12 === 0 ? `${p.months / 12} yr` : `${p.months} mo`} {p.apr}% {money(financeMonthly(payAmount(proposal, total, payOffer, p), p.apr, p.months))}/mo
                  </button>
                ))}
              </div>
            ) : null}
            <button type="button" disabled={!payOffer} className="mt-8 h-12 bg-[var(--p-navy)] px-8 text-sm font-semibold text-white disabled:opacity-40" onClick={() => go("sign")}>
              Next
            </button>
          </div>
        </section>
  );
}

export function PresentView4(props: { bag: { staff: any; navigate: any; fileTo: any; go: any; step: any; steps: any; i: any; brand: any; copyLink: any; copied: any } }) {
  const { staff, navigate, fileTo, go, step, steps, i, brand, copyLink, copied } = props.bag;
  return (
    <div className="no-print sticky top-0 z-20 flex items-center gap-2 border-b border-[var(--p-trim)] bg-white px-3 py-2 text-[var(--p-navy)] md:px-6">
        <button type="button" className="grid size-11 place-items-center text-[var(--p-gray)]" aria-label="Close proposal" onClick={() => (staff ? navigate(fileTo) : go("cover"))}>
          <X className="size-5" />
        </button>
        {step !== "cover" ? (
          <button type="button" className="grid size-11 place-items-center text-[var(--p-gray)]" aria-label="Back" onClick={() => go(steps[Math.max(0, i - 1)])}>
            <ChevronLeft className="size-5" />
          </button>
        ) : null}
        <CozyWordmark className="ml-1 h-7 w-36" house={brand.red} word={brand.navy} />
        <div className="ml-4 hidden flex-1 md:block">
          <StepRail i={i} n={steps.length} />
        </div>
        <span className="ml-auto md:hidden" />
        {staff ? (
          <button type="button" className="inline-flex h-11 items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--p-gray)]" onClick={copyLink}>
            <Link2 className="size-4" />
            {copied || "Link"}
          </button>
        ) : null}
        <button type="button" className="inline-flex h-11 items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--p-gray)]" onClick={() => window.print()}>
          <Printer className="size-4" />
          PDF
        </button>
      </div>
  );
}

export function PresentView8(props: { bag: { brand: any; staff: any; navigate: any; fileTo: any; go: any; step: any; steps: any; i: any; copyLink: any; copied: any; hero: any; lead: any; today: any; proposal: any; scope: any; products: any; setEditing: any; editing: any; showAllOpts: any; picked: any; setPicked: any; setShowAllOpts: any; planSigner: any; setPlanMiss: any; setPlanSigner: any; planMiss: any; opt: any; bundle: any; payOffer: any; plan: any; shownDue: any; total: any; financers: any; term: any; plans: any; signed: any } }) {
  const { brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed } = props.bag;
  return (
    <PresentView9 bag={{ brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed }} />
  );
}

function PresentView9(props: { bag: { brand: any; staff: any; navigate: any; fileTo: any; go: any; step: any; steps: any; i: any; copyLink: any; copied: any; hero: any; lead: any; today: any; proposal: any; scope: any; products: any; setEditing: any; editing: any; showAllOpts: any; picked: any; setPicked: any; setShowAllOpts: any; planSigner: any; setPlanMiss: any; setPlanSigner: any; planMiss: any; opt: any; bundle: any; payOffer: any; plan: any; shownDue: any; total: any; financers: any; term: any; plans: any; signed: any } }) {
  const { brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed } = props.bag;
  return (
    <PresentView10 bag={{ brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed }} />
  );
}

function PresentView10(props: { bag: { brand: any; staff: any; navigate: any; fileTo: any; go: any; step: any; steps: any; i: any; copyLink: any; copied: any; hero: any; lead: any; today: any; proposal: any; scope: any; products: any; setEditing: any; editing: any; showAllOpts: any; picked: any; setPicked: any; setShowAllOpts: any; planSigner: any; setPlanMiss: any; setPlanSigner: any; planMiss: any; opt: any; bundle: any; payOffer: any; plan: any; shownDue: any; total: any; financers: any; term: any; plans: any; signed: any } }) {
  const { brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed } = props.bag;
  return (
    <PresentView11 bag={{ brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed }} />
  );
}

function PresentView11(props: { bag: { brand: any; staff: any; navigate: any; fileTo: any; go: any; step: any; steps: any; i: any; copyLink: any; copied: any; hero: any; lead: any; today: any; proposal: any; scope: any; products: any; setEditing: any; editing: any; showAllOpts: any; picked: any; setPicked: any; setShowAllOpts: any; planSigner: any; setPlanMiss: any; setPlanSigner: any; planMiss: any; opt: any; bundle: any; payOffer: any; plan: any; shownDue: any; total: any; financers: any; term: any; plans: any; signed: any } }) {
  const { brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed } = props.bag;
  return (
    <PresentView12 bag={{ brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed }} />
  );
}
