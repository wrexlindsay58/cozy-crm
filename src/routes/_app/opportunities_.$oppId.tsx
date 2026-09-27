import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { OppWorkspace } from "@/features/opportunity/workspace";
import { assessmentForLead } from "@/features/assessment/store";
import { StartMembership } from "@/features/membership/start-sheet";
import { useMembershipFor } from "@/features/membership/store";
import { applyGoodLeap, generateProposal, optionTotal, useOpportunityList, useProposal } from "@/features/opportunity/store";
import { FlowRedirect } from "@/features/flow/redirect";
import { RecordShell } from "@/features/record-shell/record-shell";
import { scrollFileSection } from "@/features/record-shell/file-sections";
import { useOps } from "@/features/ops/store";
import { money, projects } from "@/lib/crm-data";
import { followersByPerson, photosByPerson } from "@/lib/file-data";
import { placeLine } from "@/lib/place";

export const Route = createFileRoute("/_app/opportunities_/$oppId")({ component: OppFile });

function OppFile() {
  const { oppId } = Route.useParams();
  const navigate = useNavigate();
  const { tickets, history, leads } = useOps();
  const opp = useOpportunityList().find((o) => o.id === oppId);
  const proposal = useProposal(oppId);
  const member = useMembershipFor(opp?.leadId ?? "");
  const [planOpen, setPlanOpen] = useState(false);
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
    <>
    <FlowRedirect id={opp.leadId} here="opportunity" />
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
          member ? { label: `${member.planName} · ${member.years} yr`, href: `/memberships/${member.id}` } : null,
        ].filter(Boolean) as { label: string; href: string }[]
      }
      acts={[
        { label: "Call" },
        { label: "Text", opens: "thread" },
        { label: "Book", onClick: () => scrollFileSection("book") },
        { label: "Plan", onClick: () => setPlanOpen(true) },
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
    <StartMembership
      open={planOpen}
      onClose={() => setPlanOpen(false)}
      personId={opp.leadId}
      name={lead?.name ?? opp.name}
      address={lead?.address ?? ""}
      city={lead?.city ?? ""}
      office={lead?.office ?? opp.office}
      owner={opp.closer}
      from="opportunity"
    />
    </>
  );
}
