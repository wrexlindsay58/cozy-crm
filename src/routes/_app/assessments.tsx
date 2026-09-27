import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Circle, CircleCheck } from "lucide-react";
import { Empty, StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { useAssessments } from "@/features/assessment/store";
import { useDoors } from "@/features/flow/door";
import { ContactName, countsFor, QuietFilter, Reach, WhoStack } from "@/features/lists/bits";
import { ListError } from "@/features/lists/list-error";
import { ListPage } from "@/features/lists/list-page";
import { sortRows, type Sort } from "@/features/lists/sort";
import { applyListPatch, listSearch, readListSearch } from "@/features/lists/url-search";
import { useOps } from "@/features/ops/store";

const VIEWS = ["Open", "Ready"] as const;
const SORTS = ["rank", "name", "status", "next", "who"] as const;
const parse = listSearch(VIEWS, SORTS);

export const Route = createFileRoute("/_app/assessments")({
  validateSearch: parse,
  errorComponent: (props) => <ListError {...props} title="Assessments" />,
  component: AssessmentsPage,
});

function AssessmentsPage() {
  const search = readListSearch(Route.useSearch());
  const navigate = Route.useNavigate();
  const all = useAssessments();
  const doors = useDoors();
  const { leads } = useOps();
  const sort: Sort = { key: search.sort, dir: search.dir };
  const patch = (next: Partial<typeof search>) => {
    void navigate({ search: (prev) => parse(applyListPatch(readListSearch(prev), next)), replace: true });
  };
  const pool = all
    .filter((r) => doors[r.leadId]?.place === "assessment")
    .map((r) => ({ ...r, lead: leads.find((l) => l.id === r.leadId) }));
  const owners = [...new Set(pool.map((r) => r.closer))].sort();
  const scoped = pool.filter((r) => !search.owner || r.closer === search.owner);
  const cards = countsFor(scoped, [
    { id: "Open", label: "Open", icon: Circle, match: (r) => r.status === "Open" },
    { id: "Ready", label: "Ready", tone: "watch", icon: CircleCheck, match: (r) => r.status === "Complete" },
  ]);
  const rows = useMemo(() => {
    const needle = search.q.trim().toLowerCase();
    const filtered = scoped.filter((r) => {
      if (search.view === "Open" && r.status !== "Open") return false;
      if (search.view === "Ready" && r.status !== "Complete") return false;
      if (!needle) return true;
      return [r.name, r.lead?.secondaryName, r.address, r.closer, r.lead?.phone, r.lead?.email].join(" ").toLowerCase().includes(needle);
    });
    return sortRows(filtered, sort, (r, key) => {
      if (key === "name") return r.name;
      if (key === "status") return r.status;
      if (key === "who") return r.closer;
      return r.status === "Complete" ? 0 : 1;
    });
  }, [scoped, search.view, search.q, sort]);

  return (
    <ListPage
      title="Assessments"
      count={`${rows.length} houses`}
      view={search.view}
      onView={(view) => patch({ view: (VIEWS as readonly string[]).includes(view) ? (view as (typeof VIEWS)[number]) : "All" })}
      cards={cards}
      filters={<QuietFilter label="All assessors" value={search.owner} options={owners} onChange={(owner) => patch({ owner })} />}
      search={search.q}
      onSearch={(q) => patch({ q })}
      empty={rows.length === 0 ? <Empty>Nothing in this queue.</Empty> : undefined}
    >
      <RecordTable
        rows={rows}
        href={(r) => `/assessments/${r.id}`}
        sort={sort}
        onSort={(key) =>
          patch({
            sort: (SORTS as readonly string[]).includes(key) ? (key as (typeof SORTS)[number]) : "rank",
            dir: sort.key === key && sort.dir === "asc" ? "desc" : "asc",
          })
        }
        columns={[
          { key: "name", label: "Name", render: (r) => <ContactName name={r.lead?.name || r.name} second={r.lead?.secondaryName} place={r.address} /> },
          { key: "reach", label: "Phone", hide: "lg", render: (r) => <Reach phone={r.lead?.phone} email={r.lead?.email} /> },
          { key: "status", label: "Status", render: (r) => <StatusPill label={r.status === "Complete" ? "Ready" : "Open"} tone={r.status === "Complete" ? "up" : "navy"} /> },
          { key: "next", label: "Next", hide: "lg", render: (r) => (r.status === "Complete" ? "Continue to opportunity" : "Finish the assessment") },
          { key: "who", label: "Who", render: (r) => <WhoStack name={r.closer} /> },
        ]}
      />
    </ListPage>
  );
}
