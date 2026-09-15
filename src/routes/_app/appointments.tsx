import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Empty, StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { ListPage } from "@/features/lists/list-page";
import { useOps } from "@/features/ops/store";

export const Route = createFileRoute("/_app/appointments")({
  component: AppointmentsPage,
});

const VIEWS = ["All", "Unmarked", "Confirmed", "No sit", "Missed", "One legger", "Ran"] as const;

function AppointmentsPage() {
  const { appointments } = useOps();
  const [view, setView] = useState<(typeof VIEWS)[number]>("Unmarked");
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return appointments.filter((a) => {
      if (view !== "All" && a.status !== view) return false;
      if (!needle) return true;
      return [a.name, a.closer, a.city, a.product, a.id, a.leadId].join(" ").toLowerCase().includes(needle);
    });
  }, [appointments, view, query]);

  return (
    <ListPage
      title="Appointments"
      count={`${rows.length}`}
      views={[...VIEWS]}
      view={view}
      onView={(v) => setView(v as (typeof VIEWS)[number])}
      search={query}
      onSearch={setQuery}
      empty={rows.length === 0 ? <Empty>None in {view}. Clear the filter.</Empty> : undefined}
    >
      <RecordTable
        rows={rows}
        href={(r) => `/leads/${r.leadId}`}
        columns={[
          { key: "name", label: "Name", render: (r) => r.name },
          { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={r.tone} /> },
          { key: "when", label: "Next", hide: "md", render: (r) => <span className="text-muted">Sep {r.day} {r.time}</span> },
          { key: "who", label: "Who", hide: "md", render: (r) => r.closer },
          { key: "city", label: "Office", hide: "lg", render: (r) => r.city },
          { key: "product", label: "Product", hide: "lg", render: (r) => r.product },
        ]}
      />
    </ListPage>
  );
}
