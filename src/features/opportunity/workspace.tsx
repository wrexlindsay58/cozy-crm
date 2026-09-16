import { Plus } from "lucide-react";
import { LeadCard } from "@/features/lead/lead-card";
import { BookWidget } from "@/features/lead/book-widget";
import { useOps } from "@/features/ops/store";
import { addOption, type Proposal } from "./store";
import { ProductPicker } from "./picker";
import { OptionCard } from "./option-card";
import { PayTiles } from "./pay-tiles";
import { ProposalPanel } from "./proposal-panel";
import { AssessSnap } from "./assess-snap";

export function OppWorkspace({ proposal }: { proposal: Proposal }) {
  const { leads } = useOps();
  const lead = leads.find((l) => l.id === proposal.personId);
  return (
    <div className="space-y-3">
      {lead ? <LeadCard lead={lead} locked /> : null}
      <AssessSnap leadId={proposal.personId} />
      <ProductPicker proposal={proposal} />
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Options</h2>
        {!proposal.accepted ? (
          <button type="button" className="inline-flex h-10 items-center gap-1 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => addOption(proposal.oppId)}>
            <Plus className="size-4" />
            Add option
          </button>
        ) : null}
      </div>
      <div className="grid gap-3 xl:grid-cols-3">
        {proposal.options.map((opt) => (
          <OptionCard key={opt.id} proposal={proposal} option={opt} />
        ))}
      </div>
      <PayTiles proposal={proposal} />
      <ProposalPanel proposal={proposal} />
      <BookWidget leadId={proposal.personId} defaultCloser={proposal.closer} defaultKind="Callback" />
    </div>
  );
}
