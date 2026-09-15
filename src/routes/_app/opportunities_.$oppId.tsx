import { createFileRoute } from "@tanstack/react-router";
import { OppWorkspace } from "@/features/opportunity/workspace";
import { applyGoodLeap, optionTotal, sendProposal, useProposal } from "@/features/opportunity/store";
import { RecordShell } from "@/features/record-shell/record-shell";
import { PriorStages } from "@/features/record-shell/prior-stages";
import { useOps } from "@/features/ops/store";
import { byId, leads, money, opportunities, projects } from "@/lib/crm-data";
import { followersByPerson, photosByPerson } from "@/lib/file-data";

export const Route = createFileRoute("/_app/opportunities_/$oppId")({ component: OppFile });

function OppFile() {
  const { oppId } = Route.useParams();
  const { tickets, history } = useOps();
  const opp = byId(opportunities, oppId);
  const proposal = useProposal(oppId);
  if (!opp) return <main className="p-6 text-sm text-muted">Opportunity not found.</main>;
  const lead = byId(leads, opp.leadId);
  const job = projects.find((p) => p.name.includes(opp.name.split(" ")[0]));
  const accepted = proposal?.options.find((o) => o.id === proposal.accepted);
  const shown = accepted ? optionTotal(accepted) : opp.amount;
  const stage = proposal?.signStatus === "Sent" ? "Agreement sent" : proposal?.proposalStatus === "Sent" ? "Proposal sent" : opp.stage;
  return (
    <RecordShell kind="opportunity" personId={opp.leadId} title={opp.name} subtitle={opp.product} stage={stage} moneyLabel={money(shown)} owner={{ name: opp.closer, role: "Closer" }} followers={followersByPerson[opp.leadId] ?? []} related={[lead ? { label: `Lead ${lead.id}`, href: `/leads/${lead.id}` } : null, job ? { label: `Job ${job.id}`, href: `/projects/${job.id}` } : null].filter(Boolean) as { label: string; href: string }[]} acts={[{ label: "Call" }, { label: "Text", opens: "thread" }, { label: "Send proposal", onClick: () => sendProposal(opp.id) }, { label: "Take card", onClick: () => applyGoodLeap(opp.id) }]} history={history?.[opp.leadId] ?? []} tickets={(tickets ?? []).filter((t) => t.related === opp.leadId)} photos={photosByPerson[opp.leadId] ?? []}>
      {proposal ? <OppWorkspace proposal={proposal} /> : <p className="text-sm text-muted">No proposal on file.</p>}
      <PriorStages leadId={opp.leadId} current="opportunity" />
    </RecordShell>
  );
}
