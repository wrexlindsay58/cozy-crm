import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Ban, CalendarClock, CircleDollarSign, FileText, RefreshCw } from "lucide-react";
import { StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { ContactName, countsFor, QuietFilter, Reach, WhoStack } from "@/features/lists/bits";
import { ListError } from "@/features/lists/list-error";
import { ListPage } from "@/features/lists/list-page";
import { sortRows, type Sort } from "@/features/lists/sort";
import { applyListPatch, listSearch, readListSearch } from "@/features/lists/url-search";
import { billOpen, memberTone, priceLabel, useMemberships } from "@/features/membership/store";
import { renewalOpen } from "@/features/membership/renew";
import { visitDue } from "@/features/membership/visits";
import { money, leads } from "@/lib/crm-data";
import { rosterMembershipLeads } from "@/lib/roster";

const VIEWS = ["Offered", "Active", "Due", "Unpaid", "Renewing", "Canceled"] as const;
const SORTS = ["rank", "name", "status", "next", "who", "price"] as const;
const parse = listSearch(VIEWS, SORTS);

export const Route = createFileRoute("/_app/memberships")({
  validateSearch: parse,
  errorComponent: (props) => <ListError {...props} title="Memberships" />,
  component: MembershipsPage,
});

function queueOf(m: { status: string }, due: boolean, unpaid: boolean, renewing: boolean) {
  if (m.status === "Canceled") return "Canceled";
  if (unpaid) return "Unpaid";
  if (renewing) return "Renewing";
  if (due) return "Due";
  if (m.status === "Offered") return "Offered";
  return "Active";
}

function nextOf(q: string, through: string) {
  if (q === "Unpaid") return "Collect the bill";
  if (q === "Due") return "Book the visit";
  if (q === "Renewing") return "Start the renewal";
  if (q === "Offered") return "Get the agreement signed";
  if (q === "Canceled") return "Closed";
  return through ? `Next bill · ${through}` : "On plan";
}

const RANK: Record<string, number> = { Unpaid: 0, Due: 1, Renewing: 2, Offered: 3, Active: 4, Canceled: 6 };

function MembershipsPage() {
  const search = readListSearch(Route.useSearch());
  const navigate = Route.useNavigate();
  const files = useMemberships();
  const sort: Sort = { key: search.sort, dir: search.dir };
  const patch = (next: Partial<typeof search>) => {
    void navigate({ search: (prev) => parse(applyListPatch(readListSearch(prev), next)), replace: true });
  };

  const pool = files.map((m) => {
    const q = queueOf(m, visitDue(m), billOpen(m), renewalOpen(m));
    const through = m.pay === "prepaid" ? m.end : m.nextBill || m.end;
    const lead = leads.find((l) => l.id === m.personId) ?? rosterMembershipLeads.find((l) => l.id === m.personId);
    return { ...m, q, through, rank: RANK[q] ?? 4, lead };
  });
  const owners = [...new Set(pool.map((m) => m.owner))].sort();
  const scoped = pool.filter((m) => !search.owner || m.owner === search.owner);
  const cards = countsFor(scoped, [
    { id: "Offered", label: "Offered", icon: FileText, match: (m) => m.q === "Offered" },
    { id: "Active", label: "Active", icon: BadgeCheck, match: (m) => m.q === "Active" },
    { id: "Due", label: "Due", tone: "watch", icon: CalendarClock, match: (m) => m.q === "Due" },
    { id: "Unpaid", label: "Unpaid", tone: "alert", icon: CircleDollarSign, match: (m) => m.q === "Unpaid" },
    { id: "Renewing", label: "Renewing", tone: "watch", icon: RefreshCw, match: (m) => m.q === "Renewing" },
    { id: "Canceled", label: "Canceled", icon: Ban, match: (m) => m.q === "Canceled" },
  ]);
  const rows = useMemo(() => {
    const needle = search.q.trim().toLowerCase();
    const filtered = scoped.filter((m) => {
      if (search.view !== "All" && m.q !== search.view) return false;
      if (!needle) return true;
      return [m.name, m.lead?.secondaryName, m.city, m.planName, m.owner, m.address, m.lead?.phone, m.lead?.email].join(" ").toLowerCase().includes(needle);
    });
    return sortRows(filtered, sort, (m, key) => {
      if (key === "name") return m.name;
      if (key === "status") return m.q;
      if (key === "who") return m.owner;
      if (key === "price") return m.termPrice;
      return m.rank;
    });
  }, [scoped, search.view, search.q, sort]);

  return (
    <ListPage
      title="Memberships"
      count={`${rows.length} plans`}
      view={search.view}
      onView={(view) => patch({ view: (VIEWS as readonly string[]).includes(view) ? (view as (typeof VIEWS)[number]) : "All" })}
      cards={cards}
      filters={<QuietFilter label="All owners" value={search.owner} options={owners} onChange={(owner) => patch({ owner })} />}
      search={search.q}
      onSearch={(q) => patch({ q })}
      searchPlaceholder="Customer, plan, city"
      empty={
        rows.length === 0 ? (
          <div className="rounded-sm bg-card px-4 py-8">
            <p className="text-[13px] text-muted">Nothing in this queue.</p>
            <Link to="/accounts" preload="intent" className="mt-3 inline-flex h-10 items-center text-sm font-semibold text-navy">
              Open an account
            </Link>
          </div>
        ) : undefined
      }
    >
      <RecordTable
        rows={rows}
        href={(r) => `/memberships/${r.id}`}
        sort={sort}
        onSort={(key) =>
          patch({
            sort: (SORTS as readonly string[]).includes(key) ? (key as (typeof SORTS)[number]) : "rank",
            dir: sort.key === key && sort.dir === "asc" ? "desc" : "asc",
          })
        }
        columns={[
          { key: "name", label: "Name", render: (r) => <ContactName name={r.lead?.name || r.name} second={r.lead?.secondaryName} place={r.address || r.city} /> },
          { key: "reach", label: "Phone", hide: "lg", render: (r) => <Reach phone={r.lead?.phone} email={r.lead?.email} /> },
          { key: "status", label: "Status", render: (r) => <StatusPill label={r.q === "Active" ? r.planName : r.q} tone={memberTone(r.status)} /> },
          { key: "next", label: "Next", hide: "lg", render: (r) => nextOf(r.q, r.through) },
          { key: "who", label: "Who", render: (r) => <WhoStack name={r.owner} /> },
          { key: "price", label: "Price", align: "right", render: (r) => <span className="font-semibold tabular-nums">{priceLabel(r, money)}</span> },
        ]}
      />
    </ListPage>
  );
}
