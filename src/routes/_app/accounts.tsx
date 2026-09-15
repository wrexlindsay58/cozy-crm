import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Empty, FilterChip, Page, PageTitle, StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { accounts, money } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/accounts")({
  component: AccountsPage,
});

function AccountsPage() {
  const [filter, setFilter] = useState<"All" | "New" | "Repeat">("All");
  const rows = useMemo(() => accounts.filter((a) => filter === "All" || a.type === filter), [filter]);

  return (
    <Page>
      <PageTitle title="Accounts" count={`${rows.length}`} />
      <div className="mb-4 flex flex-wrap gap-2">
        {(["All", "New", "Repeat"] as const).map((f) => (
          <FilterChip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}
          </FilterChip>
        ))}
      </div>
      {rows.length === 0 ? (
        <Empty>No accounts.</Empty>
      ) : (
        <RecordTable
          rows={rows}
          href={(r) => `/accounts/${r.id}`}
          columns={[
            { key: "name", label: "Name", render: (r) => r.name },
            {
              key: "type",
              label: "Type",
              render: (r) => <StatusPill label={r.type} tone={r.type === "Repeat" ? "navy" : "up"} />,
            },
            { key: "city", label: "City", hide: "sm", render: (r) => r.city },
            { key: "owner", label: "Owner", hide: "md", render: (r) => r.owner },
            { key: "jobs", label: "Jobs", hide: "lg", render: (r) => r.jobs },
            { key: "life", label: "Sold", render: (r) => <span className="font-semibold tabular-nums">{money(r.lifetime)}</span> },
            { key: "last", label: "Last job", hide: "md", render: (r) => <span className="text-muted">{r.last}</span> },
          ]}
        />
      )}
    </Page>
  );
}
