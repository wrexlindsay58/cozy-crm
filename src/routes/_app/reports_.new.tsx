import { Link, createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { ReportBuilder } from "@/features/reports/builder";

export const Route = createFileRoute("/_app/reports_/new")({
  component: NewReportPage,
});

function NewReportPage() {
  return (
    <main className="mx-auto max-w-3xl p-4 pb-10 md:p-5">
      <p className="mb-2 text-sm"><Link to="/reports" className="font-semibold text-navy">Reports</Link></p>
      <PageHeader kicker="Company" title="New report" />
      <ReportBuilder />
    </main>
  );
}
