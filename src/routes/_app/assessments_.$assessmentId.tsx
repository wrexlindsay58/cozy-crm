import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AssessmentWorkspace } from "@/features/assessment/workspace";
import { completeAssessment, useAssessment } from "@/features/assessment/store";
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
  useEffect(() => {
    if (section) scrollFileSection(section);
  }, [section, assessmentId]);
  if (!file) return <main className="p-6 text-sm text-muted">Assessment not found.</main>;
  const lead = leads.find((l) => l.id === file.leadId);
  return (
    <RecordShell
      kind="assessment"
      personId={file.leadId}
      title={file.name}
      subtitle={placeLine(lead?.address ?? file.address, lead?.city ?? "", lead?.office)}
      stage={file.status}
      owner={{ name: file.closer, role: "Closer" }}
      followers={followersByPerson[file.leadId] ?? []}
      related={[ { label: `Lead ${file.leadId}`, href: `/leads/${file.leadId}` }, file.oppId ? { label: `Opportunity ${file.oppId}`, href: `/opportunities/${file.oppId}` } : null ].filter(Boolean) as { label: string; href: string }[]}
      acts={[
        { label: "Call" },
        { label: "Text", opens: "thread" },
        { label: "Book", onClick: () => scrollFileSection("book") },
        { label: "Create", menu: [{ label: "Ticket" }, { label: "Task" }, { label: "Request" }] },
        {
          label: "Complete",
          onClick: () => {
            const next = completeAssessment(file.id);
            if (next?.oppId) navigate({ to: "/opportunities/$oppId", params: { oppId: next.oppId } });
          },
        },
      ]}
      history={history?.[file.leadId] ?? []}
      tickets={(tickets ?? []).filter((t) => t.related === file.leadId)}
      photos={photosByPerson[file.leadId] ?? []}
    >
      <AssessmentWorkspace file={file} />
    </RecordShell>
  );
}
