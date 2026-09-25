import { AssessmentReport } from "./report";
import { ProposalDoc } from "./proposal-doc";
import type { Proposal } from "./store";

export function PacketFile({ proposal }: { proposal: Proposal }) {
  return (
    <div className="min-h-dvh bg-page">
      <AssessmentReport personId={proposal.personId} closer={proposal.closer} oppId={proposal.oppId} embedded audience="customer" />
      <section className="bg-navy px-6 py-12 text-center text-card">
        <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-card/70">Separate document</p>
        <h2 className="mt-2 font-['Oswald',sans-serif] text-4xl uppercase">Proposal</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-card/80">The report ends above. Prices start here.</p>
      </section>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ProposalDoc proposal={proposal} />
      </div>
    </div>
  );
}
