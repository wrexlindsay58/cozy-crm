import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { OppWorkspace } from "@/features/opportunity/workspace";
import { assessmentForLead } from "@/features/assessment/store";
import { applyGoodLeap, generateProposal, optionTotal, useProposal } from "@/features/opportunity/store";
import { RecordShell } from "@/features/record-shell/record-shell";
import { scrollFileSection } from "@/features/record-shell/file-sections";
import { useOps } from "@/features/ops/store";
import { byId, money, opportunities, projects } from "@/lib/crm-data";
import { followersByPerson, photosByPerson } from "@/lib/file-data";
import { placeLine } from "@/lib/place";

export const Route = createFileRoute("/_app/opportunities_/$oppId")({ component: OppFile });

function OppFile() {
  const { oppId } = Route.useParams();
  const navigate = useNavigate();
  const { tickets, history, leads } = useOps();
  const opp = byId(opportunities, oppId);
  const proposal = useProposal(oppId);
  if (!opp) return <main className="p-6 text-sm text-muted">Opportunity not found.</main>;
  const lead = leads.find((l) => l.id === opp.leadId);
  const assess = assessmentForLead(opp.leadId);
  const job = projects.find((p) => p.name.includes(opp.name.split(" ")[0]));
  const accepted = proposal?.options.find((o) => o.id === proposal.accepted);
  const shown = accepted ? optionTotal(accepted) : proposal ? Math.max(...proposal.options.map(optionTotal)) : opp.amount;
  const stage =
    proposal?.signStatus === "Signed"
      ? "Agreement signed"
      : proposal?.signStatus === "Sent"
        ? "Agreement sent"
        : proposal?.proposalStatus === "Sent"
        ? "Proposal sent"
        : proposal?.proposalStatus === "Generated"
          ? "Proposal ready"
          : opp.stage;
  return (
    <RecordShell
      kind="opportunity"
      personId={opp.leadId}
      title={opp.name}
      subtitle={placeLine(lead?.address ?? "", lead?.city ?? "", lead?.office ?? opp.office)}
      stage={stage}
      moneyLabel={money(shown)}
      owner={{ name: opp.closer, role: "Closer" }}
      followers={followersByPerson[opp.leadId] ?? []}
      related={
        [
          lead ? { label: `Lead ${lead.id}`, href: `/leads/${lead.id}` } : null,
          assess ? { label: `Assessment ${assess.id}`, href: `/assessments/${assess.id}` } : null,
          job ? { label: `Job ${job.id}`, href: `/projects/${job.id}` } : null,
        ].filter(Boolean) as { label: string; href: string }[]
      }
      acts={[
        { label: "Call" },
        { label: "Text", opens: "thread" },
        { label: "Book", onClick: () => scrollFileSection("book") },
        { label: "Create", menu: [{ label: "Ticket" }, { label: "Task" }, { label: "Request" }] },
        { label: "Generate", onClick: () => { if (generateProposal(opp.id)) navigate({ to: "/proposal/$oppId", params: { oppId: opp.id } }); } },
        { label: "Card", onClick: () => applyGoodLeap(opp.id) },
      ]}
      history={history?.[opp.leadId] ?? []}
      tickets={(tickets ?? []).filter((t) => t.related === opp.leadId)}
      photos={photosByPerson[opp.leadId] ?? []}
    >
      {proposal ? <OppWorkspace proposal={proposal} /> : <p className="text-sm text-muted">No proposal on file.</p>}
    </RecordShell>
  );
}
