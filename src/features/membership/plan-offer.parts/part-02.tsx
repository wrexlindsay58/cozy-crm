import { money } from "@/lib/crm-data";
import { FileBlock } from "@/features/record-shell/file-sheet";
import { TERMS, type TermYears } from "../types";
import { signMemberPlan } from "@/features/opportunity/store";
import { FUND } from "./part-01";

export function PlanOfferView(props: { bag: { offer: any; planId: any; setPlanId: any; plans: any; years: any; setYears: any; pay: any; setPay: any; price: any; chosenFunding: any; setFunding: any; plan: any; save: any; signer: any; setSigner: any; miss: any; setMiss: any; proposal: any; brand: any } }) {
  const { offer, planId, setPlanId, plans, years, setYears, pay, setPay, price, chosenFunding, setFunding, plan, save, signer, setSigner, miss, setMiss, proposal, brand } = props.bag;
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
              {plans.map((p: any) => (
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
