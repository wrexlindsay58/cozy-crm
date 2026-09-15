import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Empty, FilterChip, PageHeader, StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { money, projects } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/projects")({
  component: ProjectsPage,
});

const FILTERS = ["All", "Scheduled", "Materials", "In progress", "On hold", "Closed"] as const;

function ProjectsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const rows = useMemo(
    () => projects.filter((p) => filter === "All" || p.status === filter),
    [filter],
  );

  return (
    <main className="mx-auto max-w-7xl p-4 pb-10 md:p-5">
      <PageHeader kicker="Production" title="Projects" count={`${rows.length} jobs`} />
      <div className="mb-3 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <FilterChip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}
          </FilterChip>
        ))}
      </div>
      {rows.length === 0 ? (
        <Empty>No projects in that status.</Empty>
      ) : (
        <RecordTable
          rows={rows}
          href={(r) => `/projects/${r.id}`}
          columns={[
            { key: "name", label: "Job", render: (r) => r.name },
            { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={r.tone} /> },
            { key: "office", label: "Office", hide: "sm", render: (r) => r.office },
            { key: "pm", label: "PM", hide: "md", render: (r) => r.pm },
            { key: "install", label: "Install", hide: "md", render: (r) => r.install },
            { key: "amount", label: "Amount", render: (r) => <span className="font-semibold tabular-nums">{money(r.amount)}</span> },
          ]}
        />
      )}
    </main>
  );
}
