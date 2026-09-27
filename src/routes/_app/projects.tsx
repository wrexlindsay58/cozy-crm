import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Flag, Hammer, Handshake, Package, Pause } from "lucide-react";
import { Empty, StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { jobTone, tally, useJobs, type JobFile } from "@/features/job/store";
import { useOps } from "@/features/ops/store";
import { useDoors } from "@/features/flow/door";
import { ContactName, countsFor, QuietFilter, Reach, WhoStack } from "@/features/lists/bits";
import { ListError } from "@/features/lists/list-error";
import { ListPage } from "@/features/lists/list-page";
import { sortRows, type Sort } from "@/features/lists/sort";
import { applyListPatch, listSearch, readListSearch } from "@/features/lists/url-search";
import { money, accounts, type Lead } from "@/lib/crm-data";

const VIEWS = ["Acceptance", "Prep", "On the board", "Held", "Ready to close"] as const;
const SORTS = ["rank", "name", "status", "next", "who", "amount"] as const;
const parse = listSearch(VIEWS, SORTS);

export const Route = createFileRoute("/_app/projects")({
  validateSearch: parse,
  errorComponent: (props) => <ListError {...props} title="Jobs" />,
  component: JobsPage,
});

type JobRow = JobFile & { id: string; lead?: Lead; account?: (typeof accounts)[number]; q: string; rank: number; next: string };

function queueOf(j: JobFile) {
  if (j.holds.length) return "Held";
  if (j.stage === "Sold") return "Acceptance";
  if (j.stage === "Permit" || j.stage === "Materials") return "Prep";
  if (j.stage === "Invoiced") return "Ready to close";
  if (j.stage === "Scheduled" || j.stage === "In progress" || j.stage === "Test-out" || j.stage === "Punch") return "On the board";
  return "On the board";
}

function nextOf(j: JobFile) {
  if (j.holds.length) return `${j.holds.map((h) => h.kind).join(", ")} hold`;
  if (j.stage === "Sold") return "Accept the scope";
  if (j.stage === "Materials" || j.stage === "Permit") return "Finish prep";
  if (j.stage === "Invoiced") return "Close the job";
  return j.window ? `Install · ${j.window}` : "Set the install";
}

const RANK: Record<string, number> = { Held: 0, "Ready to close": 1, Acceptance: 2, Prep: 3, "On the board": 4 };

function JobsPage() {
  const search = readListSearch(Route.useSearch());
  const navigate = Route.useNavigate();
  const jobs = useJobs();
  const { leads } = useOps();
  const doors = useDoors();
  const sort: Sort = { key: search.sort, dir: search.dir };
  const patch = (next: Partial<typeof search>) => {
    void navigate({ search: (prev) => parse(applyListPatch(readListSearch(prev), next)), replace: true });
  };

  const pool = useMemo(() => {
    return Object.values(jobs)
      .map((j) => {
        const lead = leads.find((l) => l.id === j.leadId) ?? leads.find((l) => l.id === j.personId) ?? leads.find((l) => l.name === accounts.find((a) => a.id === j.accountId)?.name);
        const account = accounts.find((a) => a.id === j.accountId);
        const q = queueOf(j);
        return { ...j, id: j.jobId, lead, account, q, rank: RANK[q] ?? 5, next: nextOf(j) } satisfies JobRow;
      })
      .filter((j) => {
        const flowId = j.leadId || j.personId || j.accountId;
        const door = doors[flowId] ?? doors[j.accountId];
        return door?.place === "job" && door.id === j.jobId;
      });
  }, [jobs, leads, doors]);
  const offices = [...new Set(pool.map((j) => j.lead?.office).filter(Boolean) as string[])].sort();
  const owners = [...new Set(pool.map((j) => j.pm).filter(Boolean))].sort();
  const scoped = pool.filter((j) => (!search.office || j.lead?.office === search.office) && (!search.owner || j.pm === search.owner));
  const cards = countsFor(scoped, [
    { id: "Acceptance", label: "Acceptance", icon: Handshake, match: (j) => j.q === "Acceptance" },
    { id: "Prep", label: "Prep", icon: Package, match: (j) => j.q === "Prep" },
    { id: "On the board", label: "On the board", icon: Hammer, match: (j) => j.q === "On the board" },
    { id: "Held", label: "Held", tone: "alert", icon: Pause, match: (j) => j.q === "Held" },
    { id: "Ready to close", label: "Ready to close", tone: "watch", icon: Flag, match: (j) => j.q === "Ready to close" },
  ]);
  const rows = useMemo(() => {
    const needle = search.q.trim().toLowerCase();
    const filtered = scoped.filter((j) => {
      if (search.view !== "All" && j.q !== search.view) return false;
      if (!needle) return true;
      return [j.lead?.name, j.lead?.secondaryName, j.account?.name, j.account?.secondaryName, j.name, j.product, j.pm, j.lead?.address, j.lead?.phone, j.lead?.email, j.account?.phone, j.account?.email].join(" ").toLowerCase().includes(needle);
    });
    return sortRows(filtered, sort, (j, key) => {
      if (key === "name") return j.lead?.name ?? j.account?.name ?? j.name;
      if (key === "status") return j.q;
      if (key === "who") return j.pm;
      if (key === "amount") return tally(j).revenue;
      return j.rank;
    });
  }, [scoped, search.view, search.q, sort]);
  const booked = rows.reduce((s, r) => s + tally(r).revenue, 0);

  return (
    <ListPage
      title="Jobs"
      count={`${rows.length} · ${money(booked)}`}
      view={search.view}
      onView={(view) => patch({ view: (VIEWS as readonly string[]).includes(view) ? (view as (typeof VIEWS)[number]) : "All" })}
      cards={cards}
      filters={
        <>
          <QuietFilter label="All offices" value={search.office} options={offices} onChange={(office) => patch({ office })} />
          <QuietFilter label="All PMs" value={search.owner} options={owners} onChange={(owner) => patch({ owner })} />
        </>
      }
      search={search.q}
      onSearch={(q) => patch({ q })}
      empty={rows.length === 0 ? <Empty>Nothing in this queue.</Empty> : undefined}
    >
      <RecordTable
        rows={rows}
        href={(r) => `/projects/${r.jobId}`}
        sort={sort}
        onSort={(key) =>
          patch({
            sort: (SORTS as readonly string[]).includes(key) ? (key as (typeof SORTS)[number]) : "rank",
            dir: sort.key === key && sort.dir === "asc" ? "desc" : "asc",
          })
        }
        columns={[
          { key: "name", label: "Name", render: (r) => <ContactName name={r.lead?.name ?? r.account?.name ?? r.name} second={r.lead?.secondaryName ?? r.account?.secondaryName} place={r.lead?.address || r.product} /> },
          { key: "reach", label: "Phone", hide: "lg", render: (r) => <Reach phone={r.lead?.phone || r.account?.phone} email={r.lead?.email || r.account?.email} /> },
          { key: "status", label: "Status", render: (r) => <StatusPill label={r.holds.length ? `${r.stage} · ${r.holds.map((h) => h.kind).join(", ")}` : r.stage} tone={jobTone(r)} /> },
          { key: "next", label: "Next", hide: "lg", render: (r) => r.next },
          { key: "who", label: "Who", render: (r) => <WhoStack name={r.pm} /> },
          { key: "amount", label: "Contract", align: "right", render: (r) => <span className="font-semibold tabular-nums">{money(tally(r).revenue)}</span> },
        ]}
      />
    </ListPage>
  );
}
