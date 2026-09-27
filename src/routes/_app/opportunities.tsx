import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Clock, FileWarning, Send, UserRound } from "lucide-react";
import { Empty, StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { useDoors } from "@/features/flow/door";
import { ContactName, countsFor, QuietFilter, Reach, WhoStack } from "@/features/lists/bits";
import { ListError } from "@/features/lists/list-error";
import { ListPage } from "@/features/lists/list-page";
import { sortRows, type Sort } from "@/features/lists/sort";
import { applyListPatch, listSearch, readListSearch } from "@/features/lists/url-search";
import { listedQuote, useOpportunityList, useProposals } from "@/features/opportunity/store";
import { useOps } from "@/features/ops/store";
import { money } from "@/lib/crm-data";

const VIEWS = ["Not sent", "Proposal out", "One legger", "Waiting", "Signed"] as const;
const SORTS = ["rank", "name", "status", "next", "who", "options", "amount"] as const;
const parse = listSearch(VIEWS, SORTS);

export const Route = createFileRoute("/_app/opportunities")({
  validateSearch: parse,
  errorComponent: (props) => <ListError {...props} title="Opportunities" />,
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
  const search = readListSearch(Route.useSearch());
  const navigate = Route.useNavigate();
  const opportunities = useOpportunityList();
  const proposals = useProposals();
  const doors = useDoors();
  const { leads } = useOps();
  const sort: Sort = { key: search.sort, dir: search.dir };
  const patch = (next: Partial<typeof search>) => {
    void navigate({ search: (prev) => parse(applyListPatch(readListSearch(prev), next)), replace: true });
  };

  const pool = opportunities
    .filter((o) => doors[o.leadId]?.place === "opportunity")
    .map((o) => {
      const proposal = proposals[o.id];
      const lead = leads.find((l) => l.id === o.leadId);
      const sent = proposal?.proposalStatus === "Sent";
      const signed = proposal?.signStatus === "Signed";
      const q = bucket(o.stage, sent, signed);
      const quote = listedQuote(proposal, o.amount);
      return { ...o, lead, q, quote, rank: q === "Signed" ? 0 : q === "One legger" ? 1 : q === "Waiting" ? 2 : q === "Proposal out" ? 3 : 4 };
    });
  const offices = [...new Set(pool.map((o) => o.office))].sort();
  const owners = [...new Set(pool.map((o) => o.closer))].sort();
  const scoped = pool.filter((o) => (!search.office || o.office === search.office) && (!search.owner || o.closer === search.owner));
  const cards = countsFor(scoped, [
    { id: "Not sent", label: "Not sent", tone: "watch", icon: FileWarning, match: (o) => o.q === "Not sent" },
    { id: "Proposal out", label: "Proposal out", icon: Send, match: (o) => o.q === "Proposal out" },
    { id: "One legger", label: "One legger", tone: "watch", icon: UserRound, match: (o) => o.q === "One legger" },
    { id: "Waiting", label: "Waiting", icon: Clock, match: (o) => o.q === "Waiting" },
    { id: "Signed", label: "Signed", icon: BadgeCheck, match: (o) => o.q === "Signed" },
  ]);
  const rows = useMemo(() => {
    const needle = search.q.trim().toLowerCase();
    const filtered = scoped.filter((o) => {
      if (search.view !== "All" && o.q !== search.view) return false;
      if (!needle) return true;
      return [o.name, o.lead?.secondaryName, o.lead?.address, o.lead?.phone, o.lead?.email, o.closer, o.product, o.office].join(" ").toLowerCase().includes(needle);
    });
    return sortRows(filtered, sort, (o, key) => {
      if (key === "name") return o.name;
      if (key === "status") return o.q;
      if (key === "who") return o.closer;
      if (key === "amount") return o.quote.amount;
      if (key === "options") return o.quote.count;
      return o.rank;
    });
  }, [scoped, search.view, search.q, sort]);
  const pipeline = rows.reduce((s, r) => s + r.quote.amount, 0);

  return (
    <ListPage
      title="Opportunities"
      count={`${money(pipeline)} in view`}
      view={search.view}
      onView={(view) => patch({ view: (VIEWS as readonly string[]).includes(view) ? (view as (typeof VIEWS)[number]) : "All" })}
      cards={cards}
      filters={
        <>
          <QuietFilter label="All offices" value={search.office} options={offices} onChange={(office) => patch({ office })} />
          <QuietFilter label="All closers" value={search.owner} options={owners} onChange={(owner) => patch({ owner })} />
        </>
      }
      search={search.q}
      onSearch={(q) => patch({ q })}
      empty={rows.length === 0 ? <Empty>Nothing in this queue.</Empty> : undefined}
    >
      <RecordTable
        rows={rows}
        href={(r) => `/opportunities/${r.id}`}
        sort={sort}
        onSort={(key) =>
          patch({
            sort: (SORTS as readonly string[]).includes(key) ? (key as (typeof SORTS)[number]) : "rank",
            dir: sort.key === key && sort.dir === "asc" ? "desc" : "asc",
          })
        }
        columns={[
          { key: "name", label: "Name", render: (r) => <ContactName name={r.lead?.name || r.name} second={r.lead?.secondaryName} place={r.lead?.address} /> },
          { key: "reach", label: "Phone", hide: "lg", render: (r) => <Reach phone={r.lead?.phone} email={r.lead?.email} /> },
          { key: "status", label: "Status", render: (r) => <StatusPill label={r.q} tone={r.q === "Signed" ? "up" : r.tone} /> },
          { key: "next", label: "Next", hide: "lg", render: (r) => nextFor(r.q, r.closeBy) },
          { key: "who", label: "Who", render: (r) => <WhoStack name={r.closer} /> },
          { key: "options", label: "Option qty", align: "right", hide: "lg", render: (r) => <span className="tabular-nums">{r.quote.count} {r.quote.count === 1 ? "option" : "options"}</span> },
          {
            key: "amount",
            label: "Amount",
            align: "right",
            render: (r) => (
              <span className="block text-right">
                <span className="block font-semibold tabular-nums">{money(r.quote.amount)}</span>
                <span className="block text-[11px] font-normal text-muted">{r.quote.label}</span>
              </span>
            ),
          },
        ]}
      />
    </ListPage>
  );
}
