import { createFileRoute } from "@tanstack/react-router";
import { AssessmentReport } from "@/features/opportunity/report";
import { useAssessment } from "@/features/assessment/store";

export const Route = createFileRoute("/report/$assessmentId")({
  validateSearch: (s: Record<string, unknown>): { mode?: "present" } => ({
    mode: s.mode === "present" ? "present" : undefined,
  }),
  component: ReportPage,
});

function ReportPage() {
  const { assessmentId } = Route.useParams();
  const { mode } = Route.useSearch();
  const file = useAssessment(assessmentId);
  if (!file) return <main className="bg-white p-8 text-sm">Report not found.</main>;
  return <AssessmentReport personId={file.leadId} closer={file.closer} audience={mode === "present" ? "staff" : "customer"} mentionProposal={false} />;
}
