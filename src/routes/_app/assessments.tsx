import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Empty, StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { useAssessments } from "@/features/assessment/store";
import { useDoors } from "@/features/flow/door";
import { ContactName, countsFor, QuietFilter } from "@/features/lists/bits";
import { ListPage } from "@/features/lists/list-page";
import { sortRows, type Sort } from "@/features/lists/sort";

export const Route = createFileRoute("/_app/assessments")({
  component: AssessmentsPage,
});

function AssessmentsPage() {
  const all = useAssessments();
  const doors = useDoors();
  const [view, setView] = useState("All");
  const [query, setQuery] = useState("");
  const [owner, setOwner] = useState("");
  const [sort, setSort] = useState<Sort>({ key: "rank", dir: "asc" });
  const pool = all.filter((r) => doors[r.leadId]?.place === "assessment");
  const owners = [...new Set(pool.map((r) => r.closer))].sort();
  const scoped = pool.filter((r) => !owner || r.closer === owner);
  const cards = countsFor(scoped, [
    { id: "Open", label: "Open", match: (r) => r.status === "Open" },
    { id: "Ready", label: "Ready", tone: "watch", match: (r) => r.status === "Complete" },
  ]);
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = scoped.filter((r) => {
      if (view === "Open" && r.status !== "Open") return false;
      if (view === "Ready" && r.status !== "Complete") return false;
      if (!needle) return true;
      return [r.name, r.address, r.closer].join(" ").toLowerCase().includes(needle);
    });
    return sortRows(filtered, sort, (r, key) => {
      if (key === "name") return r.name;
      if (key === "status") return r.status;
      if (key === "who") return r.closer;
      return r.status === "Complete" ? 0 : 1;
    });
  }, [scoped, view, query, sort]);

  return (
    <ListPage
      title="Assessments"
      count={`${rows.length} houses`}
      view={view}
      onView={setView}
      cards={cards}
      filters={<QuietFilter label="All assessors" value={owner} options={owners} onChange={setOwner} />}
      search={query}
      onSearch={setQuery}
      empty={rows.length === 0 ? <Empty>Nothing in this queue.</Empty> : undefined}
    >
      <RecordTable
        rows={rows}
        href={(r) => `/assessments/${r.id}`}
        sort={sort}
        onSort={(key) => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }))}
        columns={[
          { key: "name", label: "Name", render: (r) => <ContactName name={r.name} place={r.address} /> },
          { key: "status", label: "Status", render: (r) => <StatusPill label={r.status === "Complete" ? "Ready" : "Open"} tone={r.status === "Complete" ? "up" : "navy"} /> },
          { key: "next", label: "Next", render: (r) => (r.status === "Complete" ? "Continue to opportunity" : "Finish the assessment") },
          { key: "who", label: "Who", hide: "md", render: (r) => r.closer },
        ]}
      />
    </ListPage>
  );
}
