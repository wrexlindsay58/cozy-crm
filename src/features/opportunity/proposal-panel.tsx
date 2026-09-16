import { FileText } from "lucide-react";
import { money } from "@/lib/crm-data";
import { generateProposal, sendProposal, sendToSign, type Proposal } from "./store";
import { ProposalDoc } from "./proposal-doc";

export function ProposalPanel({ proposal }: { proposal: Proposal }) {
  const docs = proposal.documents.filter((d) => d.kind === "proposal");
  return (
    <section className="space-y-3">
      <div className="rounded-md border border-line bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Proposal</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => generateProposal(proposal.oppId)}>
              Generate
            </button>
            <button type="button" className="h-11 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => sendProposal(proposal.oppId)}>
              Send
            </button>
            {proposal.accepted ? (
              <button type="button" className="h-11 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => sendToSign(proposal.oppId)}>
                Send to sign
              </button>
            ) : null}
          </div>
        </div>
        <p className="mt-2 text-[11px] text-muted">
          {proposal.proposalStatus === "Draft" ? "Live below. Generate stamps a version. Send puts it on the house." : `Status: ${proposal.proposalStatus}${proposal.signStatus !== "—" ? ` · Sign ${proposal.signStatus}` : ""}`}
        </p>
        {docs.length ? (
          <ul className="mt-3 space-y-1">
            {docs.map((d) => (
              <li key={d.id} className="flex items-center gap-2 text-sm">
                <FileText className="size-4 text-navy" />
                <span className="font-semibold">Proposal {d.id}</span>
                <span className="text-[11px] font-bold tracking-wide text-muted uppercase">{d.status}</span>
                {d.totals?.length ? <span className="text-[11px] text-muted">{d.totals.map((t) => `${t.name} ${money(t.amount)}`).join(" · ")}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <ProposalDoc proposal={proposal} />
    </section>
  );
}
