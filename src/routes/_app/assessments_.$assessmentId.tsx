import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AssessmentWorkspace } from "@/features/assessment/workspace";
import { useAssessment } from "@/features/assessment/store";
import { advanceToOpportunity } from "@/features/flow/advance";
import { FlowRedirect } from "@/features/flow/redirect";
import { StartMembership } from "@/features/membership/start-sheet";
import { useMembershipFor } from "@/features/membership/store";
import { RecordShell } from "@/features/record-shell/record-shell";
import { scrollFileSection } from "@/features/record-shell/file-sections";
import { useOps } from "@/features/ops/store";
import { followersByPerson, photosByPerson } from "@/lib/file-data";
import { placeLine } from "@/lib/place";

export const Route = createFileRoute("/_app/assessments_/$assessmentId")({
  validateSearch: (s: Record<string, unknown>): { section?: string } => ({
    section: typeof s.section === "string" ? s.section : undefined,
  }),
  component: AssessmentFile,
});

function AssessmentFile() {
  const { assessmentId } = Route.useParams();
  const { section } = Route.useSearch();
  const file = useAssessment(assessmentId);
  const { tickets, history, leads } = useOps();
  const navigate = useNavigate();
  const [planOpen, setPlanOpen] = useState(false);
  const member = useMembershipFor(file?.leadId ?? "");
  useEffect(() => {
    if (section) scrollFileSection(section);
  }, [section, assessmentId]);
  if (!file) return <main className="p-6 text-sm text-muted">Assessment not found.</main>;
  const lead = leads.find((l) => l.id === file.leadId);
  return (
    <>
    <FlowRedirect id={file.leadId} here="assessment" />
    <RecordShell
      kind="assessment"
      personId={file.leadId}
      title={file.name}
      subtitle={placeLine(lead?.address ?? file.address, lead?.city ?? "", lead?.office)}
      stage={file.status}
      owner={{ name: file.closer, role: "Closer" }}
      followers={followersByPerson[file.leadId] ?? []}
      related={[ { label: `Lead ${file.leadId}`, href: `/leads/${file.leadId}` }, file.oppId ? { label: `Opportunity ${file.oppId}`, href: `/opportunities/${file.oppId}` } : null, member ? { label: `${member.planName} · ${member.years} yr`, href: `/memberships/${member.id}` } : null ].filter(Boolean) as { label: string; href: string }[]}
      acts={[
        { label: "Call" },
        { label: "Text", opens: "thread" },
        { label: "Book", onClick: () => scrollFileSection("book") },
        { label: "Plan", onClick: () => setPlanOpen(true) },
        { label: "Create", menu: [{ label: "Ticket" }, { label: "Task" }, { label: "Request" }] },
        {
          label: "Complete",
          onClick: () => {
            if (!lead) return;
            const opp = advanceToOpportunity(lead, file.id);
            void navigate({ to: "/opportunities/$oppId", params: { oppId: opp.id } });
          },
        },
      ]}
      history={history?.[file.leadId] ?? []}
      tickets={(tickets ?? []).filter((t) => t.related === file.leadId)}
      photos={photosByPerson[file.leadId] ?? []}
    >
      <AssessmentWorkspace file={file} />
    </RecordShell>
    <StartMembership
      open={planOpen}
      onClose={() => setPlanOpen(false)}
      personId={file.leadId}
      name={file.name}
      address={lead?.address ?? file.address}
      city={lead?.city ?? ""}
      office={lead?.office ?? ""}
      owner={file.closer}
      from="assessment"
    />
    </>
  );
}
