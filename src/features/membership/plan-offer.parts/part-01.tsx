import { useState } from "react";
import { money } from "@/lib/crm-data";
import { FileBlock } from "@/features/record-shell/file-sheet";
import { useBrand } from "@/features/brand/store";
import { planById, termPrice, usePlans } from "../catalog";
import { membershipFor } from "../store";
import type { PayMode, PlanFunding, TermYears } from "../types";
import { bundledDue, offerPlans, optionTotal, setMemberOffer, type Proposal } from "@/features/opportunity/store";
import { PlanOfferView } from "./part-02";

export const FUND: { id: PlanFunding; label: string }[] = [
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
    <PlanOfferView bag={{ offer, planId, setPlanId, plans, years, setYears, pay, setPay, price, chosenFunding, setFunding, plan, save, signer, setSigner, miss, setMiss, proposal, brand }} />
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
