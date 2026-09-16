import { useState } from "react";
import { Plus } from "lucide-react";
import { LeadCard } from "@/features/lead/lead-card";
import { BookWidget } from "@/features/lead/book-widget";
import { useOps } from "@/features/ops/store";
import { Float } from "@/components/float";
import { addOption, type Proposal } from "./store";
import { PACKAGES } from "./packages";
import { OptionCard } from "./option-card";
import { PayTiles } from "./pay-tiles";
import { ProposalPanel } from "./proposal-panel";
import { AssessSnap } from "./assess-snap";

export function OppWorkspace({ proposal }: { proposal: Proposal }) {
  const { leads } = useOps();
  const lead = leads.find((l) => l.id === proposal.personId);
  const [pkgOpen, setPkgOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  return (
    <div className="space-y-3">
      {lead ? <LeadCard lead={lead} locked /> : null}
      <AssessSnap leadId={proposal.personId} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Proposal options</h2>
        {!proposal.accepted ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-1 rounded-md border border-line px-3 text-sm font-semibold"
              onClick={(e) => {
                setAnchor(e.currentTarget.getBoundingClientRect());
                setPkgOpen((v) => !v);
              }}
            >
              Package
            </button>
            <button type="button" className="inline-flex h-10 items-center gap-1 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => addOption(proposal.oppId)}>
              <Plus className="size-4" />
              Add option
            </button>
            {pkgOpen && anchor ? (
              <Float anchor={anchor} prefer="bottom" onClose={() => setPkgOpen(false)}>
                {PACKAGES.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    className="flex h-10 w-full min-w-56 items-center px-3 text-sm hover:bg-page"
                    onClick={() => {
                      addOption(proposal.oppId, pkg.id);
                      setPkgOpen(false);
                    }}
                  >
                    {pkg.label}
                  </button>
                ))}
              </Float>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="space-y-3">
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
