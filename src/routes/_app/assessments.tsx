import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Empty, StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { useAssessments } from "@/features/assessment/store";
import { ListPage } from "@/features/lists/list-page";

export const Route = createFileRoute("/_app/assessments")({
  component: AssessmentsPage,
});

const VIEWS = ["All", "Open", "Complete"] as const;

function AssessmentsPage() {
  const all = useAssessments();
  const [view, setView] = useState<(typeof VIEWS)[number]>("All");
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return all.filter((r) => {
      if (view !== "All" && r.status !== view) return false;
      if (!needle) return true;
      return [r.name, r.address, r.closer, r.id].join(" ").toLowerCase().includes(needle);
    });
  }, [all, view, query]);

  return (
    <ListPage
      title="Assessments"
      count={`${rows.length} houses`}
      views={[...VIEWS]}
      view={view}
      onView={(v) => setView(v as (typeof VIEWS)[number])}
      search={query}
      onSearch={setQuery}
      empty={rows.length === 0 ? <Empty>No assessments in {view}. Clear the filter.</Empty> : undefined}
    >
      <RecordTable
        rows={rows}
        href={(r) => `/assessments/${r.id}`}
        columns={[
          { key: "name", label: "Name", render: (r) => r.name },
          { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={r.status === "Complete" ? "up" : "navy"} /> },
          { key: "address", label: "Next", hide: "md", render: (r) => r.address },
          { key: "who", label: "Who", hide: "md", render: (r) => r.closer },
        ]}
      />
    </ListPage>
  );
}
