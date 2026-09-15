import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { AssessmentWorkspace } from "@/features/assessment/workspace";
import { completeAssessment, useAssessment } from "@/features/assessment/store";
import { RecordShell } from "@/features/record-shell/record-shell";
import { PriorStages } from "@/features/record-shell/prior-stages";
import { useOps } from "@/features/ops/store";
import { followersByPerson, photosByPerson } from "@/lib/file-data";

export const Route = createFileRoute("/_app/assessments_/$assessmentId")({
  component: AssessmentFile,
});

function AssessmentFile() {
  const { assessmentId } = Route.useParams();
  const file = useAssessment(assessmentId);
  const { tickets, history } = useOps();
  const navigate = useNavigate();
  if (!file) return <main className="p-6 text-sm text-muted">Assessment not found.</main>;
  return (
    <RecordShell
      kind="assessment"
      personId={file.leadId}
      title={file.name}
      subtitle={file.address}
      stage={file.status}
      owner={{ name: file.closer, role: "Closer" }}
      followers={followersByPerson[file.leadId] ?? []}
      related={[ { label: `Lead ${file.leadId}`, href: `/leads/${file.leadId}` }, file.oppId ? { label: `Opportunity ${file.oppId}`, href: `/opportunities/${file.oppId}` } : null ].filter(Boolean) as { label: string; href: string }[]}
      acts={[{ label: "Call" }, { label: "Text", opens: "thread" }, { label: "Complete", onClick: () => { const next = completeAssessment(file.id); if (next?.oppId) navigate({ to: "/opportunities/$oppId", params: { oppId: next.oppId } }); } }]}
      history={history?.[file.leadId] ?? []}
      tickets={(tickets ?? []).filter((t) => t.related === file.leadId)}
      photos={photosByPerson[file.leadId] ?? []}
    >
      <AssessmentWorkspace file={file} />
      <PriorStages leadId={file.leadId} current="assessment" />
    </RecordShell>
  );
}
