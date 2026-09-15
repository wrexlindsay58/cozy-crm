import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Empty, StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { ListPage } from "@/features/lists/list-page";
import { money, opportunities } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/opportunities")({
  component: OppsPage,
});

const VIEWS = ["All", "Proposal out", "Won, production", "Appt set", "One legger", "Waiting HOA"] as const;

function OppsPage() {
  const [view, setView] = useState<(typeof VIEWS)[number]>("All");
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return opportunities.filter((o) => {
      if (view !== "All" && o.stage !== view) return false;
      if (!needle) return true;
      return [o.name, o.product, o.closer, o.office, o.id].join(" ").toLowerCase().includes(needle);
    });
  }, [view, query]);
  const pipeline = rows.reduce((s, r) => s + r.amount, 0);

  return (
    <ListPage
      title="Opportunities"
      count={`${money(pipeline)} in view`}
      views={[...VIEWS]}
      view={view}
      onView={(v) => setView(v as (typeof VIEWS)[number])}
      search={query}
      onSearch={setQuery}
      empty={rows.length === 0 ? <Empty>No opportunities in {view}. Clear the filter.</Empty> : undefined}
    >
      <RecordTable
        rows={rows}
        href={(r) => `/opportunities/${r.id}`}
        columns={[
          { key: "name", label: "Name", render: (r) => r.name },
          { key: "stage", label: "Stage", render: (r) => <StatusPill label={r.stage} tone={r.tone} /> },
          { key: "close", label: "Next", hide: "md", render: (r) => <span className="text-muted">{r.closeBy}</span> },
          { key: "who", label: "Who", hide: "md", render: (r) => r.closer },
          { key: "office", label: "Office", hide: "lg", render: (r) => r.office },
          { key: "amount", label: "$", render: (r) => <span className="font-semibold tabular-nums">{money(r.amount)}</span> },
          { key: "updated", label: "Last touch", hide: "lg", render: (r) => <span className="text-muted">{r.updated}</span> },
        ]}
      />
    </ListPage>
  );
}
