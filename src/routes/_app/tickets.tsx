import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Empty, StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { ListPage } from "@/features/lists/list-page";
import { useOps } from "@/features/ops/store";
import type { Ticket } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/tickets")({
  component: TicketsPage,
});

function toneFor(t: Ticket) {
  if (t.status === "Complete") return "up" as const;
  if (t.status === "Past Due" || t.priority === "High") return "alert" as const;
  return "navy" as const;
}

function relatedTo(id: string) {
  if (id.startsWith("L-")) return `/leads/${id}`;
  if (id.startsWith("P-")) return `/projects/${id}`;
  if (id.startsWith("A-")) return `/accounts/${id}`;
  return "/tickets";
}

const VIEWS = ["All", "Open", "Past Due", "Pause", "Complete", "Cancel"] as const;

function TicketsPage() {
  const { tickets } = useOps();
  const [view, setView] = useState<(typeof VIEWS)[number]>("All");
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return tickets.filter((t) => {
      if (view !== "All" && t.status !== view) return false;
      if (!needle) return true;
      return [t.title, t.id, t.owner, t.related].join(" ").toLowerCase().includes(needle);
    });
  }, [tickets, view, query]);
  const oldest = tickets.filter((t) => t.status !== "Complete" && t.status !== "Cancel").sort((a, b) => parseInt(b.age, 10) - parseInt(a.age, 10))[0];

  return (
    <ListPage
      title="Tickets"
      count={oldest ? `oldest ${oldest.age}` : `${rows.length}`}
      views={[...VIEWS]}
      view={view}
      onView={(v) => setView(v as (typeof VIEWS)[number])}
      search={query}
      onSearch={setQuery}
      empty={rows.length === 0 ? <Empty>No tickets in {view}. Clear the filter.</Empty> : undefined}
    >
      <RecordTable
        rows={rows}
        href={(r) => relatedTo(r.related)}
        columns={[
          { key: "name", label: "Name", render: (r) => r.title },
          { key: "status", label: "Status", render: (r) => <StatusPill label={`${r.priority} · ${r.status}`} tone={toneFor(r)} /> },
          { key: "age", label: "Next", hide: "md", render: (r) => <span className="text-muted">{r.age}</span> },
          { key: "who", label: "Who", hide: "md", render: (r) => r.owner },
          { key: "related", label: "File", hide: "lg", render: (r) => r.related },
        ]}
      />
    </ListPage>
  );
}
