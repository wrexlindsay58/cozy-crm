import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { useAssessments } from "@/features/assessment/store";

export const Route = createFileRoute("/_app/assessments")({
  component: AssessmentsPage,
});

function AssessmentsPage() {
  const rows = useAssessments();
  return (
    <main className="mx-auto max-w-7xl p-4 pb-10 md:p-5">
      <PageHeader kicker="Pipeline" title="Assessments" count={`${rows.length} open houses`} />
      <RecordTable
        rows={rows}
        href={(r) => `/assessments/${r.id}`}
        columns={[
          { key: "name", label: "House", render: (r) => r.name },
          { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={r.status === "Complete" ? "up" : "navy"} /> },
          { key: "address", label: "Address", hide: "sm", render: (r) => r.address },
          { key: "closer", label: "Closer", hide: "md", render: (r) => r.closer },
        ]}
      />
    </main>
  );
}
