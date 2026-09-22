import { FileText } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { money } from "@/lib/crm-data";
import { generateProposal, sendProposal, type Proposal } from "./store";

export function ProposalPanel({ proposal }: { proposal: Proposal }) {
  const navigate = useNavigate();
  const docs = proposal.documents.filter((d) => d.kind === "proposal");
  const [needPay, setNeedPay] = useState(false);

  function present() {
    const ok = generateProposal(proposal.oppId);
    if (!ok) {
      setNeedPay(true);
      return;
    }
    setNeedPay(false);
    navigate({ to: "/proposal/$oppId", params: { oppId: proposal.oppId } });
  }

  return (
    <section className="rounded-md border border-line bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Proposal</h2>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={present}>
            Generate & present
          </button>
          <button type="button" className="h-11 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => sendProposal(proposal.oppId)}>
            Send
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted">Add at least one payment option first. Then generate. They walk cover → why us → the walk → the work → options → pay → sign.</p>
      {needPay ? <p className="mt-2 text-sm text-alert">Add cash, card, or financing before you generate.</p> : null}
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
