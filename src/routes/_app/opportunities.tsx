import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Empty, FilterChip, PageHeader, StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { money, opportunities } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/opportunities")({
  component: OppsPage,
});

const FILTERS = ["All", "Proposal out", "Won — production", "Appt set", "One legger", "Waiting HOA"] as const;

function OppsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const rows = useMemo(
    () => opportunities.filter((o) => filter === "All" || o.stage === filter),
    [filter],
  );
  const pipeline = rows.reduce((s, r) => s + r.amount, 0);

  return (
    <main className="mx-auto max-w-7xl p-4 pb-10 md:p-5">
      <PageHeader kicker="Pipeline" title="Opportunities" count={`${money(pipeline)} open in view`} />
      <div className="mb-3 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <FilterChip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}
          </FilterChip>
        ))}
      </div>
      {rows.length === 0 ? (
        <Empty>No opportunities in that stage.</Empty>
      ) : (
        <RecordTable
          rows={rows}
          href={(r) => `/opportunities/${r.id}`}
          columns={[
            { key: "name", label: "Household", render: (r) => r.name },
            { key: "product", label: "Package", hide: "sm", render: (r) => r.product },
            { key: "stage", label: "Stage", render: (r) => <StatusPill label={r.stage} tone={r.tone} /> },
            { key: "closer", label: "Closer", hide: "md", render: (r) => r.closer },
            { key: "office", label: "Office", hide: "lg", render: (r) => r.office },
            { key: "amount", label: "Amount", render: (r) => <span className="font-semibold tabular-nums">{money(r.amount)}</span> },
            { key: "close", label: "Close by", hide: "md", render: (r) => <span className="text-muted">{r.closeBy}</span> },
          ]}
        />
      )}
    </main>
  );
}
