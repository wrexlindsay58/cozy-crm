import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Empty, StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { ListPage } from "@/features/lists/list-page";
import { money, projects } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/projects")({
  component: ProjectsPage,
});

const VIEWS = ["All", "Scheduled", "Materials", "In progress", "On hold", "Closed"] as const;

function ProjectsPage() {
  const [view, setView] = useState<(typeof VIEWS)[number]>("All");
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (view !== "All" && p.status !== view) return false;
      if (!needle) return true;
      return [p.name, p.product, p.pm, p.office, p.id].join(" ").toLowerCase().includes(needle);
    });
  }, [view, query]);

  return (
    <ListPage
      title="Jobs"
      count={`${rows.length} jobs`}
      views={[...VIEWS]}
      view={view}
      onView={(v) => setView(v as (typeof VIEWS)[number])}
      search={query}
      onSearch={setQuery}
      empty={rows.length === 0 ? <Empty>No jobs in {view}. Clear the filter.</Empty> : undefined}
    >
      <RecordTable
        rows={rows}
        href={(r) => `/projects/${r.id}`}
        columns={[
          { key: "name", label: "Name", render: (r) => r.name },
          { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={r.tone} /> },
          { key: "install", label: "Next", hide: "md", render: (r) => <span className="text-muted">{r.install}</span> },
          { key: "who", label: "Who", hide: "md", render: (r) => r.pm },
          { key: "office", label: "Office", hide: "lg", render: (r) => r.office },
          { key: "amount", label: "$", render: (r) => <span className="font-semibold tabular-nums">{money(r.amount)}</span> },
        ]}
      />
    </ListPage>
  );
}
