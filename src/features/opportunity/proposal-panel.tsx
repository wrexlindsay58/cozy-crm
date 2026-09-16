import { FileText } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { money } from "@/lib/crm-data";
import { generateProposal, sendProposal, type Proposal } from "./store";

export function ProposalPanel({ proposal }: { proposal: Proposal }) {
  const navigate = useNavigate();
  const docs = proposal.documents.filter((d) => d.kind === "proposal");

  function present() {
    generateProposal(proposal.oppId);
    navigate({ to: "/proposal/$oppId", params: { oppId: proposal.oppId } });
  }

  return (
    <section className="rounded-md border border-line bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Proposal</h2>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={present}>
            Generate & present
          </button>
          <button type="button" className="h-11 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => sendProposal(proposal.oppId)}>
            Send
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted">Opens a customer page. They pick an option, choose how to pay, and sign.</p>
      {docs.length ? (
        <ul className="mt-3 space-y-1">
          {docs.map((d) => (
            <li key={d.id}>
              <button type="button" className="flex w-full items-center gap-2 rounded-md px-1 py-2 text-left text-sm hover:bg-page" onClick={present}>
                <FileText className="size-4 text-navy" />
                <span className="font-semibold">Proposal {d.id}</span>
                <span className="text-[11px] font-bold tracking-wide text-muted uppercase">{d.status}</span>
                {d.totals?.length ? <span className="truncate text-[11px] text-muted">{d.totals.map((t) => `${t.name} ${money(t.amount)}`).join(" · ")}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
