import { money } from "@/lib/crm-data";
import { signMemberPlan } from "../../store";
import { PresentOption } from "../../present-option";
import { PresentView21 } from "./part-02";

export function PresentView2(props: { bag: { staff: any; setEditing: any; editing: any; proposal: any; showAllOpts: any; picked: any; setPicked: any; setShowAllOpts: any; planSigner: any; setPlanMiss: any; brand: any; setPlanSigner: any; planMiss: any; go: any; opt: any } }) {
  const { staff, setEditing, editing, proposal, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, brand, setPlanSigner, planMiss, go, opt } = props.bag;
  return (
    <section className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
          <p className="p-sub text-[11px] text-[var(--p-gray)]">Options</p>
          <div className="mt-8 flex items-end justify-between gap-3">
            <h2 className="p-head text-5xl text-[var(--p-navy)]">Pick a path.</h2>
            {staff ? (
              <button type="button" className="h-11 border border-[var(--p-trim)] bg-white px-4 text-sm font-semibold" onClick={() => setEditing((v: any) => !v)}>
                {editing ? "Lock" : "Edit"}
              </button>
            ) : null}
          </div>
          <div className="mt-8 space-y-4">
            {proposal.options
              .filter((o: any) => showAllOpts || !picked || o.id === picked)
              .map((o: any) => (
                <PresentOption
                  key={o.id}
                  proposal={proposal}
                  option={o}
                  selected={picked === o.id}
                  editing={staff && editing}
                  onPick={() => {
                    setPicked(o.id);
                    setShowAllOpts(false);
                  }}
                />
              ))}
          </div>
          {proposal.memberOffer ? (
            <div className="mt-8 bg-white p-6">
              <p className="p-sub text-[11px] text-[var(--p-gray)]">Membership</p>
              <h3 className="p-head mt-2 text-3xl text-[var(--p-navy)]">{proposal.memberOffer.planName}</h3>
              <p className="mt-2 text-sm">
                {proposal.memberOffer.years} years · {proposal.memberOffer.pay === "prepaid" ? money(proposal.memberOffer.termPrice) : `${money(proposal.memberOffer.termPrice)}/mo`}. This is not part of an option. After the term, {money(proposal.memberOffer.continueMonthly)}/mo until you cancel.
              </p>
              {proposal.memberOffer.accepted ? (
                <p className="mt-3 text-sm font-semibold">Signed by {proposal.memberOffer.signerName}.</p>
              ) : (
                <form
                  className="mt-4 flex flex-wrap items-end gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!planSigner.trim()) {
                      setPlanMiss(true);
                      return;
                    }
                    signMemberPlan(proposal.oppId, planSigner, brand.name);
                  }}
                >
                  <label className="text-sm">
                    <span className="p-sub text-[11px] text-[var(--p-gray)]">Signer</span>
                    <input value={planSigner} onChange={(e) => setPlanSigner(e.target.value)} className="mt-1 block h-11 border border-[var(--p-trim)] px-3" />
                  </label>
                  <button type="submit" className="h-11 bg-[var(--p-navy)] px-4 text-sm font-semibold text-white">
                    Accept the membership
                  </button>
                  {planMiss && !planSigner.trim() ? <p className="w-full text-sm">The name is required.</p> : null}
                </form>
              )}
            </div>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {picked && proposal.options.length > 1 ? (
              <button type="button" className="h-12 border border-[var(--p-trim)] bg-white px-5 text-sm font-semibold text-[var(--p-navy)]" onClick={() => setShowAllOpts((v: any) => !v)}>
                {showAllOpts ? "Hide the others" : "See other options"}
              </button>
            ) : null}
            <button type="button" disabled={!picked} className="h-12 bg-[var(--p-navy)] px-8 text-sm font-semibold text-white disabled:opacity-40" onClick={() => go("pay")}>
              Price {opt?.name}
            </button>
          </div>
        </section>
  );
}

export function PresentView12(props: { bag: { brand: any; staff: any; navigate: any; fileTo: any; go: any; step: any; steps: any; i: any; copyLink: any; copied: any; hero: any; lead: any; today: any; proposal: any; scope: any; products: any; setEditing: any; editing: any; showAllOpts: any; picked: any; setPicked: any; setShowAllOpts: any; planSigner: any; setPlanMiss: any; setPlanSigner: any; planMiss: any; opt: any; bundle: any; payOffer: any; plan: any; shownDue: any; total: any; financers: any; term: any; plans: any; signed: any } }) {
  const { brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed } = props.bag;
  return (
    <PresentView13 bag={{ brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed }} />
  );
}

function PresentView13(props: { bag: { brand: any; staff: any; navigate: any; fileTo: any; go: any; step: any; steps: any; i: any; copyLink: any; copied: any; hero: any; lead: any; today: any; proposal: any; scope: any; products: any; setEditing: any; editing: any; showAllOpts: any; picked: any; setPicked: any; setShowAllOpts: any; planSigner: any; setPlanMiss: any; setPlanSigner: any; planMiss: any; opt: any; bundle: any; payOffer: any; plan: any; shownDue: any; total: any; financers: any; term: any; plans: any; signed: any } }) {
  const { brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed } = props.bag;
  return (
    <PresentView14 bag={{ brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed }} />
  );
}

function PresentView14(props: { bag: { brand: any; staff: any; navigate: any; fileTo: any; go: any; step: any; steps: any; i: any; copyLink: any; copied: any; hero: any; lead: any; today: any; proposal: any; scope: any; products: any; setEditing: any; editing: any; showAllOpts: any; picked: any; setPicked: any; setShowAllOpts: any; planSigner: any; setPlanMiss: any; setPlanSigner: any; planMiss: any; opt: any; bundle: any; payOffer: any; plan: any; shownDue: any; total: any; financers: any; term: any; plans: any; signed: any } }) {
  const { brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed } = props.bag;
  return (
    <PresentView15 bag={{ brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed }} />
  );
}

function PresentView15(props: { bag: { brand: any; staff: any; navigate: any; fileTo: any; go: any; step: any; steps: any; i: any; copyLink: any; copied: any; hero: any; lead: any; today: any; proposal: any; scope: any; products: any; setEditing: any; editing: any; showAllOpts: any; picked: any; setPicked: any; setShowAllOpts: any; planSigner: any; setPlanMiss: any; setPlanSigner: any; planMiss: any; opt: any; bundle: any; payOffer: any; plan: any; shownDue: any; total: any; financers: any; term: any; plans: any; signed: any } }) {
  const { brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed } = props.bag;
  return (
    <PresentView16 bag={{ brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed }} />
  );
}

function PresentView16(props: { bag: { brand: any; staff: any; navigate: any; fileTo: any; go: any; step: any; steps: any; i: any; copyLink: any; copied: any; hero: any; lead: any; today: any; proposal: any; scope: any; products: any; setEditing: any; editing: any; showAllOpts: any; picked: any; setPicked: any; setShowAllOpts: any; planSigner: any; setPlanMiss: any; setPlanSigner: any; planMiss: any; opt: any; bundle: any; payOffer: any; plan: any; shownDue: any; total: any; financers: any; term: any; plans: any; signed: any } }) {
  const { brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed } = props.bag;
  return (
    <PresentView17 bag={{ brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed }} />
  );
}

function PresentView17(props: { bag: { brand: any; staff: any; navigate: any; fileTo: any; go: any; step: any; steps: any; i: any; copyLink: any; copied: any; hero: any; lead: any; today: any; proposal: any; scope: any; products: any; setEditing: any; editing: any; showAllOpts: any; picked: any; setPicked: any; setShowAllOpts: any; planSigner: any; setPlanMiss: any; setPlanSigner: any; planMiss: any; opt: any; bundle: any; payOffer: any; plan: any; shownDue: any; total: any; financers: any; term: any; plans: any; signed: any } }) {
  const { brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed } = props.bag;
  return (
    <PresentView18 bag={{ brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed }} />
  );
}

function PresentView18(props: { bag: { brand: any; staff: any; navigate: any; fileTo: any; go: any; step: any; steps: any; i: any; copyLink: any; copied: any; hero: any; lead: any; today: any; proposal: any; scope: any; products: any; setEditing: any; editing: any; showAllOpts: any; picked: any; setPicked: any; setShowAllOpts: any; planSigner: any; setPlanMiss: any; setPlanSigner: any; planMiss: any; opt: any; bundle: any; payOffer: any; plan: any; shownDue: any; total: any; financers: any; term: any; plans: any; signed: any } }) {
  const { brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed } = props.bag;
  return (
    <PresentView19 bag={{ brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed }} />
  );
}

function PresentView19(props: { bag: { brand: any; staff: any; navigate: any; fileTo: any; go: any; step: any; steps: any; i: any; copyLink: any; copied: any; hero: any; lead: any; today: any; proposal: any; scope: any; products: any; setEditing: any; editing: any; showAllOpts: any; picked: any; setPicked: any; setShowAllOpts: any; planSigner: any; setPlanMiss: any; setPlanSigner: any; planMiss: any; opt: any; bundle: any; payOffer: any; plan: any; shownDue: any; total: any; financers: any; term: any; plans: any; signed: any } }) {
  const { brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed } = props.bag;
  return (
    <PresentView20 bag={{ brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed }} />
  );
}

function PresentView20(props: { bag: { brand: any; staff: any; navigate: any; fileTo: any; go: any; step: any; steps: any; i: any; copyLink: any; copied: any; hero: any; lead: any; today: any; proposal: any; scope: any; products: any; setEditing: any; editing: any; showAllOpts: any; picked: any; setPicked: any; setShowAllOpts: any; planSigner: any; setPlanMiss: any; setPlanSigner: any; planMiss: any; opt: any; bundle: any; payOffer: any; plan: any; shownDue: any; total: any; financers: any; term: any; plans: any; signed: any } }) {
  const { brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed } = props.bag;
  return (
    <PresentView21 bag={{ brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed }} />
  );
}
