import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Empty, StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { allInvoices, useJobs } from "@/features/job/store";
import { ListPage } from "@/features/lists/list-page";
import { money } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/invoices")({
  component: InvoicesPage,
});

function InvoicesPage() {
  useJobs();
  const source = allInvoices();
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const mapped = source.map((r) => ({ ...r, id: `${r.jobId}-${r.id}`, number: r.id }));
    if (!needle) return mapped;
    return mapped.filter((r) => [r.number, r.name, r.jobId, r.status, r.kind].join(" ").toLowerCase().includes(needle));
  }, [source, query]);

  return (
    <ListPage
      title="Invoices"
      count={`${rows.length} rows`}
      search={query}
      onSearch={setQuery}
      empty={rows.length === 0 ? <Empty>No invoices match.</Empty> : undefined}
    >
      <RecordTable
        rows={rows}
        href={(r) => `/projects/${r.jobId}`}
        columns={[
          { key: "name", label: "Name", render: (r) => `${r.number} · ${r.name}` },
          { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={r.status === "Paid" ? "up" : "navy"} /> },
          { key: "kind", label: "Next", hide: "md", render: (r) => r.kind },
          { key: "amount", label: "$", render: (r) => <span className="font-semibold tabular-nums">{money(r.amount)}</span> },
        ]}
      />
    </ListPage>
  );
}
