import { Link, createFileRoute } from "@tanstack/react-router";
import { ListPage } from "@/features/lists/list-page";
import { ReportBuilder } from "@/features/reports/builder";

export const Route = createFileRoute("/_app/reports_/new")({
  component: NewReportPage,
});

function NewReportPage() {
  return (
    <ListPage
      title="New report"
      back={{ to: "/reports", label: "Reports" }}
      actions={
        <Link to="/reports" className="hidden text-sm font-semibold text-navy md:inline">
          Reports
        </Link>
      }
    >
      <div className="p-4 md:p-5">
        <ReportBuilder />
      </div>
    </ListPage>
  );
}
