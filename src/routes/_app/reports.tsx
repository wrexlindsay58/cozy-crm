import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { ReportLibrary } from "@/features/reports/library";

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <main className="mx-auto max-w-6xl p-4 pb-10 md:p-5">
      <PageHeader kicker="Company" title="Reports" />
      <ReportLibrary />
    </main>
  );
}
