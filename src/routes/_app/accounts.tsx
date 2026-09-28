import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shield, Star, TriangleAlert } from "lucide-react";
import { useAccountFiles, useAccountRows } from "@/features/account/store";
import { useDoors } from "@/features/flow/door";
import { Empty, StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { ContactName, countsFor, QuietFilter, Reach, WhoStack } from "@/features/lists/bits";
import { ListError } from "@/features/lists/list-error";
import { ListPage } from "@/features/lists/list-page";
import { sortRows, type Sort } from "@/features/lists/sort";
import { applyListPatch, listSearch, readListSearch } from "@/features/lists/url-search";
import { leads, money } from "@/lib/crm-data";

const VIEWS = ["Open issue", "Review due", "Warranty ending"] as const;
const SORTS = ["rank", "name", "status", "next", "who", "life"] as const;
const parse = listSearch(VIEWS, SORTS);

export const Route = createFileRoute("/_app/accounts")({
  validateSearch: parse,
  errorComponent: (props) => <ListError {...props} title="Accounts" />,
  component: AccountsPage,
});

function AccountsPage() {
  const search = readListSearch(Route.useSearch());
  const navigate = Route.useNavigate();
  const files = useAccountFiles();
  const accounts = useAccountRows();
  const doors = useDoors();
  const sort: Sort = { key: search.sort, dir: search.dir };
  const patch = (next: Partial<typeof search>) => {
    void navigate({ search: (prev) => parse(applyListPatch(readListSearch(prev), next)), replace: true });
  };

  const pool = useMemo(() => {
    return accounts
      .map((a) => {
        const file = files[a.id];
        const lead = leads.find((l) => l.id === file?.leadId) ?? leads.find((l) => l.name === a.name);
        const open = file?.issues.filter((i) => i.status === "Open" || i.status === "Scheduled").length ?? 0;
        const reviewDue = !file?.reviews.some((r) => r.status === "Left");
        const warranty = Boolean(file?.warrantyUntil);
        const q = open ? "Open issue" : reviewDue ? "Review due" : warranty ? "Warranty ending" : "Quiet";
        const next = open ? `Resolve ${open} open` : reviewDue ? "Ask for a review" : warranty ? `Warranty through ${file?.warrantyUntil}` : "Nothing waiting";
        const rank = open ? 0 : reviewDue ? 1 : warranty ? 2 : 3;
        return { ...a, lead, q, next, rank, phone: lead?.phone || a.phone || "", email: lead?.email || a.email || "", address: lead?.address || a.address || a.city };
      })
      .filter((a) => {
        const file = files[a.id];
        const leadDoor = file?.leadId ? doors[file.leadId] : undefined;
        const own = doors[a.id];
        return (leadDoor?.place === "account" && leadDoor.id === a.id) || own?.place === "account";
      });
  }, [accounts, files, doors]);
  const owners = [...new Set(pool.map((a) => a.owner))].sort();
  const scoped = pool.filter((a) => !search.owner || a.owner === search.owner);
  const cards = countsFor(scoped, [
    { id: "Open issue", label: "Open issue", tone: "alert", icon: TriangleAlert, match: (a) => a.q === "Open issue" },
    { id: "Review due", label: "Review due", tone: "watch", icon: Star, match: (a) => a.q === "Review due" },
    { id: "Warranty ending", label: "Warranty ending", tone: "watch", icon: Shield, match: (a) => a.q === "Warranty ending" },
  ]);
  const rows = useMemo(() => {
    const needle = search.q.trim().toLowerCase();
    const filtered = scoped.filter((a) => {
      if (search.view !== "All" && a.q !== search.view) return false;
      if (!needle) return true;
      return [a.name, a.secondaryName, a.lead?.secondaryName, a.city, a.owner, a.phone, a.email, a.address].join(" ").toLowerCase().includes(needle);
    });
    return sortRows(filtered, sort, (a, key) => {
      if (key === "name") return a.name;
      if (key === "status") return a.q;
      if (key === "who") return a.owner;
      if (key === "life") return a.lifetime;
      return a.rank;
    });
  }, [scoped, search.view, search.q, sort]);

  return (
    <ListPage
      title="Accounts"
      count={`${rows.length} customers`}
      view={search.view}
      onView={(view) => patch({ view: (VIEWS as readonly string[]).includes(view) ? (view as (typeof VIEWS)[number]) : "All" })}
      cards={cards}
      filters={<QuietFilter label="All owners" value={search.owner} options={owners} onChange={(owner) => patch({ owner })} />}
      search={search.q}
      onSearch={(q) => patch({ q })}
      searchPlaceholder="Customer name, city, phone"
      empty={rows.length === 0 ? <Empty>Nothing in this queue.</Empty> : undefined}
    >
      <RecordTable
        rows={rows}
        href={(r) => `/accounts/${r.id}`}
        sort={sort}
        onSort={(key) =>
          patch({
            sort: (SORTS as readonly string[]).includes(key) ? (key as (typeof SORTS)[number]) : "rank",
            dir: sort.key === key && sort.dir === "asc" ? "desc" : "asc",
          })
        }
        columns={[
          { key: "name", label: "Name", render: (r) => <ContactName name={r.lead?.name || r.name} second={r.lead?.secondaryName || r.secondaryName} place={r.address || r.city} /> },
          { key: "reach", label: "Phone", hide: "lg", render: (r) => <Reach phone={r.phone} email={r.email} /> },
          { key: "status", label: "Status", render: (r) => <StatusPill label={r.q} tone={r.q === "Open issue" ? "alert" : r.q === "Quiet" ? "muted" : "navy"} /> },
          { key: "next", label: "Next", hide: "lg", render: (r) => r.next },
          { key: "who", label: "Who", render: (r) => <WhoStack name={r.owner} /> },
          { key: "life", label: "Lifetime", align: "right", render: (r) => <span className="font-semibold tabular-nums">{money(r.lifetime)}</span> },
        ]}
      />
    </ListPage>
  );
}
