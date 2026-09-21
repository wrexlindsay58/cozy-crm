import { Link, createFileRoute } from "@tanstack/react-router";
import { ListPage } from "@/features/lists/list-page";
import { ReportViewer, reportTitle } from "@/features/reports/viewer";

export const Route = createFileRoute("/_app/reports_/$reportId")({
  component: ReportFile,
});

function ReportFile() {
  const { reportId } = Route.useParams();
  return (
    <ListPage
      title={reportTitle(reportId)}
      back={{ to: "/reports", label: "Reports" }}
      actions={
        <Link to="/reports" className="hidden text-sm font-semibold text-navy md:inline">
          Reports
        </Link>
      }
    >
      <div className="p-4 md:p-5">
        <ReportViewer reportId={reportId} />
      </div>
    </ListPage>
  );
}
