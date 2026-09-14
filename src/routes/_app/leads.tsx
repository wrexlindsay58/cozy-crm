import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Empty, FilterChip, PageHeader, StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { leads, money } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/leads")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => {
    const q = typeof s.q === "string" ? s.q : "";
    return q ? { q } : {};
  },
  component: LeadsPage,
});

const FILTERS = ["All", "Unmarked", "Pending", "Set — no run", "Ran", "Sold"] as const;

function LeadsPage() {
  const { q = "" } = Route.useSearch();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [query, setQuery] = useState(q);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (filter !== "All" && l.status !== filter) return false;
      if (!needle) return true;
      return [l.name, l.city, l.setter, l.product, l.id, l.source].join(" ").toLowerCase().includes(needle);
    });
  }, [filter, query]);

  return (
    <main className="mx-auto max-w-7xl p-4 pb-10 md:p-5">
      <PageHeader
        kicker="Pipeline"
        title="Leads"
        count={`${rows.length} shown`}
        actions={
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter this list"
            className="h-9 w-56 rounded-lg border border-line bg-card px-3 text-sm outline-none focus:border-navy"
          />
        }
      />
      <div className="mb-3 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <FilterChip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}
          </FilterChip>
        ))}
      </div>
      {rows.length === 0 ? (
        <Empty>No leads match that filter.</Empty>
      ) : (
        <RecordTable
          rows={rows}
          href={(r) => `/leads/${r.id}`}
          columns={[
            { key: "name", label: "Name", render: (r) => r.name },
            { key: "id", label: "ID", hide: "lg", render: (r) => <span className="text-muted">{r.id}</span> },
            { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={r.tone} /> },
            { key: "city", label: "City", hide: "sm", render: (r) => r.city },
            { key: "product", label: "Interest", hide: "md", render: (r) => r.product },
            { key: "setter", label: "Setter", hide: "lg", render: (r) => r.setter },
            { key: "value", label: "Est.", render: (r) => <span className="font-semibold tabular-nums">{money(r.value)}</span> },
            { key: "next", label: "Next", hide: "md", render: (r) => <span className="text-muted">{r.next}</span> },
          ]}
        />
      )}
    </main>
  );
}
