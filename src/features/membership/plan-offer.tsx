import { useState } from "react";
import { money } from "@/lib/crm-data";
import { FileBlock } from "@/features/record-shell/file-sheet";
import { useBrand } from "@/features/brand/store";
import { planById, termPrice, usePlans } from "./catalog";
import { membershipFor } from "./store";
import { TERMS, type PayMode, type PlanFunding, type TermYears } from "./types";
import { bundledDue, offerPlans, optionTotal, setMemberOffer, signMemberPlan, type Proposal } from "@/features/opportunity/store";

const FUND: { id: PlanFunding; label: string }[] = [
  { id: "membership", label: "On this membership" },
  { id: "job", label: "On the job agreement" },
  { id: "loan", label: "In the loan" },
];

export function PlanOffer({ proposal }: { proposal: Proposal }) {
  const plans = usePlans();
  const brand = useBrand();
  const offer = proposal.memberOffer;
  const locked = membershipFor(proposal.personId);
  const held = Boolean(locked && locked.status === "Active" && locked.oppId !== proposal.oppId);
  const [planId, setPlanId] = useState(offer?.planId ?? plans[0]?.id ?? "comfort");
  const [years, setYears] = useState<TermYears>(offer?.years ?? 3);
  const [pay, setPay] = useState<PayMode>(offer?.pay ?? "prepaid");
  const [funding, setFunding] = useState<PlanFunding>(offer?.funding ?? "membership");
  const [signer, setSigner] = useState("");
  const [miss, setMiss] = useState(false);
  const plan = planById(planId);
  const price = termPrice(plan, years);
  const chosenFunding = pay === "billed" ? "membership" : funding;

  function save() {
    setMemberOffer(proposal.oppId, {
      planId: plan.id,
      planName: plan.name,
      years,
      pay,
      termPrice: pay === "prepaid" ? price.prepaid : price.monthly,
      continueMonthly: plan.continueMonthly,
      visitsPerYear: plan.visitsPerYear,
      funding: chosenFunding,
    });
  }

  if (held && locked) {
    return (
      <FileBlock title="Membership" hint="Already active on this house. This sale will not replace it.">
        <p className="text-sm">
          {locked.planName}, {locked.years} years, through {locked.end}.
        </p>
      </FileBlock>
    );
  }

  return (
    <FileBlock title="Membership" hint="Separate from the install options. Its own price, its own accept, its own agreement.">
      {offer?.accepted ? (
        <p className="text-sm">
          Signed by {offer.signerName}. {offer.planName}, {offer.years} years, {offer.pay === "prepaid" ? `${money(offer.termPrice)} prepaid` : `${money(offer.termPrice)}/mo`}. After the term, {money(offer.continueMonthly)}/mo until they cancel.
        </p>
      ) : (
        <div className="space-y-4">
          <label className="block text-sm">
            <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Plan</span>
            <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3">
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Term</span>
            <select value={years} onChange={(e) => setYears(Number(e.target.value) as TermYears)} className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3">
              {TERMS.map((y) => (
                <option key={y} value={y}>
                  {y} {y === 1 ? "year" : "years"}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="space-y-2">
            <legend className="text-[11px] font-bold tracking-wide text-muted uppercase">Term price</legend>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" checked={pay === "prepaid"} onChange={() => setPay("prepaid")} />
              Prepaid {money(price.prepaid)}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" checked={pay === "billed"} onChange={() => setPay("billed")} />
              Billed {money(price.monthly)}/mo
            </label>
          </fieldset>
          <fieldset className="space-y-2">
            <legend className="text-[11px] font-bold tracking-wide text-muted uppercase">Where the prepaid price is collected</legend>
            {FUND.map((row) => (
              <label key={row.id} className="flex items-center gap-2 text-sm">
                <input type="radio" disabled={pay === "billed" && row.id !== "membership"} checked={chosenFunding === row.id} onChange={() => setFunding(row.id)} />
                {row.label}
              </label>
            ))}
            {pay === "billed" ? <p className="text-sm text-muted">Monthly billing stays on the membership. It cannot ride on the job or the loan.</p> : null}
          </fieldset>
          <p className="text-sm">After {years} years, {money(plan.continueMonthly)}/mo until they cancel or lock a new term. That rate is copied onto the agreement.</p>
          <button type="button" onClick={save} className="h-11 rounded-md bg-navy px-4 text-sm font-semibold text-card">
            {offer ? "Update the offer" : "Add to this proposal"}
          </button>
          {offer ? (
            <div className="space-y-2 border-t border-line pt-3">
              <p className="text-sm">Accepting this does not accept an install option.</p>
              <label className="block text-sm">
                <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Signer</span>
                <input value={signer} onChange={(e) => setSigner(e.target.value)} className={miss && !signer.trim() ? "mt-1 h-11 w-full rounded-md border border-stop px-3" : "mt-1 h-11 w-full rounded-md border border-line px-3"} />
              </label>
              {miss && !signer.trim() ? <p className="text-sm text-stop">The name is required before this can be signed.</p> : null}
              <button
                type="button"
                className="h-11 rounded-md border border-navy px-4 text-sm font-semibold text-navy"
                onClick={() => {
                  if (!signer.trim()) {
                    setMiss(true);
                    return;
                  }
                  signMemberPlan(proposal.oppId, signer, brand.name);
                }}
              >
                Sign the membership
              </button>
            </div>
          ) : null}
        </div>
      )}
    </FileBlock>
  );
}

export function PlanNumbers({ proposal }: { proposal: Proposal }) {
  const offer = proposal.memberOffer;
  if (!offer) return null;
  const sold = proposal.options.find((o) => o.id === proposal.accepted);
  const install = sold ? optionTotal(sold) : 0;
  const pay = proposal.payOffers.find((o) => o.id === proposal.payPick?.offerId) ?? proposal.payOffers[0];
  const finance = pay?.kind === "finance" ? offerPlans(pay).find((p) => p.months === proposal.payPick?.term && p.apr === proposal.payPick?.apr) ?? offerPlans(pay)[0] : undefined;
  const bundle = pay && sold ? bundledDue(proposal, install, pay, finance) : null;
  const rides = Boolean(bundle?.ride);
  return (
    <div className="rounded-md border border-line p-4">
      <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Membership, separate from the options</p>
      <p className="mt-2 text-sm font-semibold">
        {offer.planName} · {offer.years} years · {offer.pay === "prepaid" ? `${money(offer.termPrice)} prepaid` : `${money(offer.termPrice)}/mo`}
      </p>
      <p className="mt-1 text-sm text-muted">After the term, {money(offer.continueMonthly)}/mo until they cancel. {offer.accepted ? `Signed by ${offer.signerName}.` : "Not accepted yet."}</p>
      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between gap-4">
          <dt>Install</dt>
          <dd className="font-semibold tabular-nums">{sold ? money(install) : "Not accepted"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{offer.pay === "prepaid" ? "Prepaid plan" : "Plan, billed on the membership"}</dt>
          <dd className="font-semibold tabular-nums">{offer.pay === "prepaid" ? money(offer.termPrice) : `${money(offer.termPrice)}/mo`}</dd>
        </div>
        {rides && bundle ? (
          <>
            <div className="flex justify-between gap-4">
              <dt>Fee on the install</dt>
              <dd className="tabular-nums">{money(bundle.installFee)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Fee on the plan</dt>
              <dd className="tabular-nums">{money(bundle.planFee)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>{offer.funding === "loan" ? "Amount financed" : "Amount due"}</dt>
              <dd className="font-semibold tabular-nums">{money(bundle.due)}</dd>
            </div>
          </>
        ) : sold ? (
          <div className="flex justify-between gap-4">
            <dt>Amount due for the install</dt>
            <dd className="font-semibold tabular-nums">{money(bundle?.installDue ?? install)}</dd>
          </div>
        ) : (
          <p className="text-sm text-muted">The install is not accepted, so it is not added to this plan.</p>
        )}
      </dl>
      {offer.funding === "loan" && proposal.goodleapStatus === "Declined" ? <p className="mt-2 text-sm">The loan was declined. This plan stays offered.</p> : null}
    </div>
  );
}
