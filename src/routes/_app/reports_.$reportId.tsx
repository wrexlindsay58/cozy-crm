import { Link, createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { ReportViewer, reportTitle } from "@/features/reports/viewer";

export const Route = createFileRoute("/_app/reports_/$reportId")({
  component: ReportFile,
});

function ReportFile() {
  const { reportId } = Route.useParams();
  return (
    <main className="mx-auto max-w-6xl p-4 pb-10 md:p-5">
      <p className="mb-2 text-sm"><Link to="/reports" className="font-semibold text-navy">Reports</Link></p>
      <PageHeader kicker="Company" title={reportTitle(reportId)} />
      <ReportViewer reportId={reportId} />
    </main>
  );
}
