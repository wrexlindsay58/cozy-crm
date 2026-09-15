import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Empty, StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { ListPage } from "@/features/lists/list-page";
import { accounts, money } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/accounts")({
  component: AccountsPage,
});

const VIEWS = ["All", "New", "Repeat"] as const;

function AccountsPage() {
  const [view, setView] = useState<(typeof VIEWS)[number]>("All");
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return accounts.filter((a) => {
      if (view !== "All" && a.type !== view) return false;
      if (!needle) return true;
      return [a.name, a.city, a.owner, a.id].join(" ").toLowerCase().includes(needle);
    });
  }, [view, query]);

  return (
    <ListPage
      title="Accounts"
      count={`${rows.length} households`}
      views={[...VIEWS]}
      view={view}
      onView={(v) => setView(v as (typeof VIEWS)[number])}
      search={query}
      onSearch={setQuery}
      empty={rows.length === 0 ? <Empty>No accounts in {view}. Clear the filter.</Empty> : undefined}
    >
      <RecordTable
        rows={rows}
        href={(r) => `/accounts/${r.id}`}
        columns={[
          { key: "name", label: "Name", render: (r) => r.name },
          { key: "type", label: "Status", render: (r) => <StatusPill label={r.type} tone={r.type === "Repeat" ? "navy" : "up"} /> },
          { key: "last", label: "Next", hide: "md", render: (r) => <span className="text-muted">{r.last}</span> },
          { key: "who", label: "Who", hide: "md", render: (r) => r.owner },
          { key: "jobs", label: "Jobs", hide: "lg", render: (r) => r.jobs },
          { key: "life", label: "$", render: (r) => <span className="font-semibold tabular-nums">{money(r.lifetime)}</span> },
        ]}
      />
    </ListPage>
  );
}
