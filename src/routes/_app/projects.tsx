import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Flag, Hammer, Handshake, Package, Pause } from "lucide-react";
import { Empty, StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { jobTone, tally, useJobs, type JobFile } from "@/features/job/store";
import { useOps } from "@/features/ops/store";
import { useDoors } from "@/features/flow/door";
import { ContactName, countsFor, QuietFilter, Reach, WhoStack } from "@/features/lists/bits";
import { ListPage } from "@/features/lists/list-page";
import { sortRows, type Sort } from "@/features/lists/sort";
import { money, accounts, type Lead } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/projects")({
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
  const jobs = useJobs();
  const { leads } = useOps();
  const doors = useDoors();
  const [view, setView] = useState("All");
  const [query, setQuery] = useState("");
  const [office, setOffice] = useState("");
  const [owner, setOwner] = useState("");
  const [sort, setSort] = useState<Sort>({ key: "rank", dir: "asc" });

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
  const scoped = pool.filter((j) => (!office || j.lead?.office === office) && (!owner || j.pm === owner));
  const cards = countsFor(scoped, [
    { id: "Acceptance", label: "Acceptance", icon: Handshake, match: (j) => j.q === "Acceptance" },
    { id: "Prep", label: "Prep", icon: Package, match: (j) => j.q === "Prep" },
    { id: "On the board", label: "On the board", icon: Hammer, match: (j) => j.q === "On the board" },
    { id: "Held", label: "Held", tone: "alert", icon: Pause, match: (j) => j.q === "Held" },
    { id: "Ready to close", label: "Ready to close", tone: "watch", icon: Flag, match: (j) => j.q === "Ready to close" },
  ]);
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = scoped.filter((j) => {
      if (view !== "All" && j.q !== view) return false;
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
  }, [scoped, view, query, sort]);
  const booked = rows.reduce((s, r) => s + tally(r).revenue, 0);

  return (
    <ListPage
      title="Jobs"
      count={`${rows.length} · ${money(booked)}`}
      view={view}
      onView={setView}
      cards={cards}
      filters={
        <>
          <QuietFilter label="All offices" value={office} options={offices} onChange={setOffice} />
          <QuietFilter label="All PMs" value={owner} options={owners} onChange={setOwner} />
        </>
      }
      search={query}
      onSearch={setQuery}
      empty={rows.length === 0 ? <Empty>Nothing in this queue.</Empty> : undefined}
    >
      <RecordTable
        rows={rows}
        href={(r) => `/projects/${r.jobId}`}
        sort={sort}
        onSort={(key) => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }))}
        columns={[
          { key: "name", label: "Name", render: (r) => <ContactName name={r.lead?.name ?? r.account?.name ?? r.name} second={r.lead?.secondaryName ?? r.account?.secondaryName} place={r.lead?.address || r.product} /> },
          { key: "reach", label: "Phone", render: (r) => <Reach phone={r.lead?.phone || r.account?.phone} email={r.lead?.email || r.account?.email} /> },
          { key: "status", label: "Status", render: (r) => <StatusPill label={r.holds.length ? `${r.stage} · ${r.holds.map((h) => h.kind).join(", ")}` : r.stage} tone={jobTone(r)} /> },
          { key: "next", label: "Next", render: (r) => r.next },
          { key: "who", label: "Who", render: (r) => <WhoStack name={r.pm} /> },
          { key: "amount", label: "Contract", align: "right", render: (r) => <span className="font-semibold tabular-nums">{money(tally(r).revenue)}</span> },
        ]}
      />
    </ListPage>
  );
}
