import { createFileRoute } from "@tanstack/react-router";
import { ListPage } from "@/features/lists/list-page";
import { ReportLibrary } from "@/features/reports/library";

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <ListPage title="Reports" count="Library">
      <div className="p-4 md:p-5">
        <ReportLibrary />
      </div>
    </ListPage>
  );
}
