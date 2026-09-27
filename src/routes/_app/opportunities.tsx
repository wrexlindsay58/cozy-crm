import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Empty, StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { useDoors } from "@/features/flow/door";
import { ContactName, countsFor, QuietFilter } from "@/features/lists/bits";
import { ListPage } from "@/features/lists/list-page";
import { sortRows, type Sort } from "@/features/lists/sort";
import { useOpportunityList, useProposals } from "@/features/opportunity/store";
import { useOps } from "@/features/ops/store";
import { money } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/opportunities")({
  component: OppsPage,
});

function bucket(stage: string, sent: boolean, signed: boolean) {
  if (stage === "One legger") return "One legger";
  if (/waiting|spouse|hoa/i.test(stage)) return "Waiting";
  if (signed || /^Won/.test(stage)) return "Signed";
  if (sent || stage === "Proposal out") return "Proposal out";
  return "Not sent";
}

function nextFor(b: string, closeBy: string) {
  if (b === "Not sent") return "Send the proposal";
  if (b === "One legger") return "Call the other owner";
  if (b === "Waiting") return "Waiting on them";
  if (b === "Signed") return "Open the job";
  return closeBy ? `Follow up · ${closeBy}` : "Follow up";
}

function OppsPage() {
  const opportunities = useOpportunityList();
  const proposals = useProposals();
  const doors = useDoors();
  const { leads } = useOps();
  const [view, setView] = useState("All");
  const [query, setQuery] = useState("");
  const [office, setOffice] = useState("");
  const [owner, setOwner] = useState("");
  const [sort, setSort] = useState<Sort>({ key: "rank", dir: "asc" });

  const pool = opportunities
    .filter((o) => doors[o.leadId]?.place === "opportunity")
    .map((o) => {
      const proposal = proposals[o.id];
      const lead = leads.find((l) => l.id === o.leadId);
      const sent = proposal?.proposalStatus === "Sent";
      const signed = proposal?.signStatus === "Signed";
      const q = bucket(o.stage, sent, signed);
      return { ...o, lead, q, rank: q === "Signed" ? 0 : q === "One legger" ? 1 : q === "Waiting" ? 2 : q === "Proposal out" ? 3 : 4 };
    });
  const offices = [...new Set(pool.map((o) => o.office))].sort();
  const owners = [...new Set(pool.map((o) => o.closer))].sort();
  const scoped = pool.filter((o) => (!office || o.office === office) && (!owner || o.closer === owner));
  const cards = countsFor(scoped, [
    { id: "Not sent", label: "Not sent", tone: "watch", match: (o) => o.q === "Not sent" },
    { id: "Proposal out", label: "Proposal out", match: (o) => o.q === "Proposal out" },
    { id: "One legger", label: "One legger", tone: "watch", match: (o) => o.q === "One legger" },
    { id: "Waiting", label: "Waiting", match: (o) => o.q === "Waiting" },
    { id: "Signed", label: "Signed", match: (o) => o.q === "Signed" },
  ]);
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = scoped.filter((o) => {
      if (view !== "All" && o.q !== view) return false;
      if (!needle) return true;
      return [o.name, o.lead?.address, o.closer, o.product, o.office].join(" ").toLowerCase().includes(needle);
    });
    return sortRows(filtered, sort, (o, key) => {
      if (key === "name") return o.name;
      if (key === "status") return o.q;
      if (key === "who") return o.closer;
      if (key === "amount") return o.amount;
      return o.rank;
    });
  }, [scoped, view, query, sort]);
  const pipeline = rows.reduce((s, r) => s + r.amount, 0);

  return (
    <ListPage
      title="Opportunities"
      count={`${money(pipeline)} in view`}
      view={view}
      onView={setView}
      cards={cards}
      filters={
        <>
          <QuietFilter label="All offices" value={office} options={offices} onChange={setOffice} />
          <QuietFilter label="All closers" value={owner} options={owners} onChange={setOwner} />
        </>
      }
      search={query}
      onSearch={setQuery}
      empty={rows.length === 0 ? <Empty>Nothing in this queue.</Empty> : undefined}
    >
      <RecordTable
        rows={rows}
        href={(r) => `/opportunities/${r.id}`}
        sort={sort}
        onSort={(key) => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }))}
        columns={[
          { key: "name", label: "Name", render: (r) => <ContactName name={r.lead?.name || r.name} second={r.lead?.secondaryName} place={r.lead?.address || r.office} /> },
          { key: "status", label: "Status", render: (r) => <StatusPill label={r.q} tone={r.q === "Signed" ? "up" : r.tone} /> },
          { key: "next", label: "Next", render: (r) => nextFor(r.q, r.closeBy) },
          { key: "who", label: "Who", hide: "md", render: (r) => r.closer },
          { key: "amount", label: "Amount", align: "right", render: (r) => <span className="font-semibold tabular-nums">{money(r.amount)}</span> },
        ]}
      />
    </ListPage>
  );
}
