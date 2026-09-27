import { cityState, placeLine } from "@/lib/place";
import { applyGoodLeap, requestDeposit } from "../store";
import { MatchedPay } from "../pay-tiles";
import { PlanNumbers } from "@/features/membership/plan-offer";
import { Row, ProposalDocView } from "./part-01";

export function ProposalDocView2(props: { bag: { BRAND: any; lead: any; today: any; proposal: any; assess: any } }) {
  const { BRAND, lead, today, proposal, assess } = props.bag;
  return (
    <article className="overflow-hidden rounded-md border border-line bg-card">
      <header className="bg-navy px-5 py-5 text-card md:px-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold tracking-[0.18em] uppercase">{BRAND.license}</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{BRAND.name}</h2>
            <p className="mt-0.5 text-sm text-card/80">{BRAND.tagline}</p>
          </div>
          <div className="text-sm md:text-right">
            <p>{BRAND.phone}</p>
            <p>{BRAND.email}</p>
            <p>
              {BRAND.city} · {BRAND.hours}
            </p>
          </div>
        </div>
      </header>

      <div className="border-b border-line px-5 py-4 md:px-7">
        <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Proposal</p>
        <p className="mt-1 text-xl font-extrabold tracking-tight">{lead?.name ?? "This house"}</p>
        <p className="mt-0.5 text-sm text-muted">
          {lead ? placeLine(lead.address, lead.city, lead.office) : ""}
          {lead?.phone ? ` · ${lead.phone}` : ""}
        </p>
        <p className="mt-2 text-[11px] text-muted">
          Prepared {today} · {proposal.closer} · File {proposal.oppId}
        </p>
      </div>

      {lead ? (
        <section className="border-b border-line px-5 py-4 md:px-7">
          <h3 className="text-[11px] font-bold tracking-wide text-muted uppercase">The house</h3>
          <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
            <Row k="Name" v={lead.name} />
            <Row k="Phone" v={lead.phone} />
            <Row k="Email" v={lead.email} />
            <Row k="Address" v={`${lead.address}, ${cityState(lead.city, lead.office)}`} />
            {lead.secondaryName ? <Row k="Second" v={lead.secondaryName} /> : null}
            <Row k="Source" v={lead.source} />
          </dl>
        </section>
      ) : null}

      {assess ? (
        <section className="border-b border-line px-5 py-4 md:px-7">
          <h3 className="text-[11px] font-bold tracking-wide text-muted uppercase">Assessment report</h3>
          <p className="mt-2 text-sm">The measurements are a separate file. This proposal starts at the price.</p>
        </section>
      ) : null}

      <ProposalDocView bag={{ proposal }} />

      {proposal.memberOffer ? (
        <section className="border-b border-line px-5 py-4 md:px-7">
          <PlanNumbers proposal={proposal} />
        </section>
      ) : null}

      <section className="border-b border-line px-5 py-4 md:px-7">
        <h3 className="text-[11px] font-bold tracking-wide text-muted uppercase">How you pay</h3>
        {proposal.payOffers.length === 0 ? <p className="mt-2 text-sm text-muted">Add cash, card, or financing on the file and generate again.</p> : <div className="mt-3"><MatchedPay proposal={proposal} /></div>}
      </section>

      <section className="px-5 py-4 md:px-7">
        <h3 className="text-[11px] font-bold tracking-wide text-muted uppercase">Next</h3>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm">
          <li>Pick an option. Accept and sign the agreement on this page.</li>
          <li>If you finance, apply. If you pay cash or card, we take a deposit to hold the date.</li>
          <li>We lock the install once the agreement is signed and the deposit or financing is in.</li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          {proposal.payOffers.some((o: any) => o.kind === "finance") ? (
            <button type="button" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => applyGoodLeap(proposal.oppId)}>
              Apply for financing
            </button>
          ) : null}
          <button type="button" className="h-11 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => requestDeposit(proposal.oppId)}>
            Put a deposit on the card
          </button>
        </div>
        <p className="mt-4 text-[11px] text-muted">
          {BRAND.name} · {BRAND.license} · {BRAND.phone}. Proposal is good for 14 days. Work starts after sign and deposit or financing approval.
        </p>
      </section>
    </article>
  );
}
