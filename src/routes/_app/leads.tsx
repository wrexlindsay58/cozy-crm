import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Empty, StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { NewLeadSheet } from "@/features/lead/new-sheet";
import { ListPage } from "@/features/lists/list-page";
import { useOps } from "@/features/ops/store";

export const Route = createFileRoute("/_app/leads")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => {
    const q = typeof s.q === "string" ? s.q : "";
    return q ? { q } : {};
  },
  component: LeadsPage,
});

const VIEWS = ["All", "Booked", "Unmarked", "Pending", "Confirmed", "Ran", "Sold", "Dropped", "Phoenix"] as const;

function LeadsPage() {
  const { q = "" } = Route.useSearch();
  const { leads, history, appointments } = useOps();
  const [view, setView] = useState<(typeof VIEWS)[number]>("All");
  const [query, setQuery] = useState(q);
  const [open, setOpen] = useState(false);
  const booked = useMemo(() => new Set(appointments.map((a) => a.leadId)), [appointments]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (view === "Phoenix") {
        if (l.office !== "Phoenix") return false;
      } else if (view === "Booked") {
        if (!booked.has(l.id)) return false;
      } else if (view !== "All" && l.status !== view) {
        return false;
      }
      if (!needle) return true;
      return [l.name, l.city, l.setter, l.closer, l.product, l.id, l.source, l.phone, l.address, l.email].join(" ").toLowerCase().includes(needle);
    });
  }, [leads, view, query, booked]);

  return (
    <>
      <ListPage
        title="Leads"
        count={`${rows.length} shown`}
        views={[...VIEWS]}
        view={view}
        onView={(v) => setView(v as (typeof VIEWS)[number])}
        search={query}
        onSearch={setQuery}
        actions={
          <button type="button" onClick={() => setOpen(true)} className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">
            New lead
          </button>
        }
        empty={rows.length === 0 ? <Empty>No leads in {view}. Clear the filter.</Empty> : undefined}
      >
        <RecordTable
          rows={rows}
          href={(r) => `/leads/${r.id}`}
          columns={[
            { key: "name", label: "Name", render: (r) => r.name },
            { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={r.tone} /> },
            { key: "next", label: "Next", hide: "md", render: (r) => <span className="text-muted">{r.next}</span> },
            { key: "who", label: "Who", hide: "md", render: (r) => r.closer },
            { key: "office", label: "Office", hide: "lg", render: (r) => r.office },
            { key: "touch", label: "Last touch", hide: "lg", render: (r) => <span className="text-muted">{history[r.id]?.[0]?.at ?? r.created}</span> },
          ]}
        />
      </ListPage>
      <NewLeadSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
