import { CozyWordmark } from "@/components/cozy-mark";
import { brandVars } from "@/features/brand/store";
import { money } from "@/lib/crm-data";
import { placeLine } from "@/lib/place";
import { SignCeremony } from "../sign-ceremony";
import { AssessmentReport } from "../report";
import { SHOT, PresentView3 } from "./part-01";
import { PresentView, PresentView4 } from "./part-02";
import { PresentView2 } from "./part-03";

export function PresentView60(props: { bag: { brand: any; staff: any; navigate: any; fileTo: any; go: any; step: any; steps: any; i: any; copyLink: any; copied: any; hero: any; lead: any; today: any; proposal: any; scope: any; products: any; setEditing: any; editing: any; showAllOpts: any; picked: any; setPicked: any; setShowAllOpts: any; planSigner: any; setPlanMiss: any; setPlanSigner: any; planMiss: any; opt: any; bundle: any; payOffer: any; plan: any; shownDue: any; total: any; financers: any; term: any; plans: any; signed: any } }) {
  const { brand, staff, navigate, fileTo, go, step, steps, i, copyLink, copied, hero, lead, today, proposal, scope, products, setEditing, editing, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, setPlanSigner, planMiss, opt, bundle, payOffer, plan, shownDue, total, financers, term, plans, signed } = props.bag;
  return (
    <div className="present-root min-h-dvh bg-[var(--p-paper)]" style={brandVars(brand)}>
      <style>{`
        .p-head { font-family: var(--p-head); letter-spacing: -0.01em; line-height: 0.88; text-transform: uppercase; }
        .p-sub { font-family: var(--p-sub); letter-spacing: 0.2em; text-transform: uppercase; font-weight: 500; }
        @media print { .no-print { display: none !important; } }
      `}</style>

      <PresentView4 bag={{ staff, navigate, fileTo, go, step, steps, i, brand, copyLink, copied }} />

      {step === "cover" ? (
        <section className="relative min-h-[calc(100dvh-56px)] overflow-hidden">
          <img src={hero} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-[var(--p-navy)]/45" />
          <div className="relative flex min-h-[calc(100dvh-56px)] flex-col justify-between p-6 md:p-12">
            <CozyWordmark className="h-10 w-48 md:h-12 md:w-56" house={brand.red} word="#FFFFFF" />
            <div className="max-w-3xl">
              <p className="p-sub text-[11px] text-white/80">Home performance plan for</p>
              <h1 className="p-head mt-3 text-5xl text-white md:text-7xl">{lead?.name ?? "This house"}</h1>
              <p className="mt-4 text-lg text-white/85">{lead ? placeLine(lead.address, lead.city, lead.office) : ""}</p>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <p className="text-[12px] text-white/70">
                {today} · {proposal.closer} · {brand.license}
              </p>
              <button type="button" className="h-12 bg-[var(--p-red)] px-8 text-sm font-semibold text-white" onClick={() => go("why")}>
                Start
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {step === "why" ? (
        <section className="grid min-h-[calc(100dvh-56px)] lg:grid-cols-2">
          <div className="flex flex-col justify-between bg-white p-6 md:p-12">
            <p className="p-sub text-[11px] text-[var(--p-gray)]">{brand.name}</p>
            <div>
              <h2 className="p-head text-5xl text-[var(--p-navy)] md:text-6xl">{brand.why}</h2>
              <p className="p-sub mt-8 text-[11px] text-[var(--p-gray)]">{brand.tagline}</p>
            </div>
            <button type="button" className="mt-10 h-12 w-fit bg-[var(--p-navy)] px-8 text-sm font-semibold text-white" onClick={() => go(scope === "proposal" ? "work" : "find")}>
              Your house
            </button>
          </div>
          <div className="relative min-h-[50vh] bg-[var(--p-navy)]">
            <img src={SHOT.inside} alt="" className="absolute inset-0 size-full object-cover opacity-50" />
            <ul className="relative grid h-full content-end gap-6 p-6 md:p-12">
              {brand.proof.map((p: any) => (
                <li key={p} className="border-t border-white/25 pt-3">
                  <p className="p-head text-4xl text-white md:text-5xl">{p}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {step === "find" ? (
        <AssessmentReport personId={proposal.personId} closer={proposal.closer} oppId={proposal.oppId} embedded audience={staff ? "staff" : "customer"} onContinue={() => go("work")} />
      ) : null}

      {step === "work" ? (
        <PresentView3 bag={{ products, proposal, go }} />
      ) : null}

      {step === "options" ? (
        <PresentView2 bag={{ staff, setEditing, editing, proposal, showAllOpts, picked, setPicked, setShowAllOpts, planSigner, setPlanMiss, brand, setPlanSigner, planMiss, go, opt }} />
      ) : null}

      {step === "pay" ? (
        <PresentView bag={{ opt, bundle, proposal, payOffer, plan, shownDue, total, picked, staff, financers, term, plans, go }} />
      ) : null}

      {step === "sign" && opt ? <SignCeremony proposal={proposal} mode="in-home" optionId={opt.id} witnessed={staff} onDone={signed} /> : null}

      {step === "done" ? (
        <section className="relative min-h-[calc(100dvh-56px)] overflow-hidden">
          <img src={SHOT.house2} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-[var(--p-navy)]/55" />
          <div className="relative flex min-h-[calc(100dvh-56px)] flex-col justify-end p-6 md:p-12">
            <p className="p-sub text-[11px] text-white/80">You’re in</p>
            <h2 className="p-head mt-2 max-w-2xl text-6xl text-white">We’ll take it from here.</h2>
            <p className="mt-4 max-w-lg text-lg text-white/80">
              {opt?.name} · {money(total)}. {proposal.closer} will confirm the date.
            </p>
            <button type="button" className="no-print mt-8 h-12 w-fit bg-white px-8 text-sm font-semibold text-[var(--p-navy)]" onClick={() => navigate(fileTo)}>
              Back to the file
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
