import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAccountFiles } from "@/features/account/store";
import { Empty, StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { ListPage } from "@/features/lists/list-page";
import { accounts, leads, money } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/accounts")({
  component: AccountsPage,
});

const VIEWS = ["All", "New", "Repeat"] as const;

function AccountsPage() {
  const files = useAccountFiles();
  const [view, setView] = useState<(typeof VIEWS)[number]>("All");
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return accounts
      .map((a) => {
        const file = files[a.id];
        const lead = leads.find((l) => l.name === a.name);
        const open = file?.issues.filter((i) => i.status === "Open" || i.status === "Scheduled").length ?? 0;
        const left = file?.reviews.some((r) => r.status === "Left");
        const next = open ? `${open} open` : !left ? "Ask for a review" : file?.membership ? file.membership.next : a.last;
        return { ...a, next, phone: lead?.phone ?? "", address: lead?.address ?? "" };
      })
      .filter((a) => {
        if (view !== "All" && a.type !== view) return false;
        if (!needle) return true;
        return [a.name, a.city, a.owner, a.phone, a.address].join(" ").toLowerCase().includes(needle);
      });
  }, [view, query, files]);

  return (
    <ListPage
      title="Accounts"
      count={`${rows.length} customers`}
      views={[...VIEWS]}
      view={view}
      onView={(v) => setView(v as (typeof VIEWS)[number])}
      search={query}
      onSearch={setQuery}
      searchPlaceholder="Customer name, city, phone"
      empty={rows.length === 0 ? <Empty>No accounts in {view}. Clear the filter.</Empty> : undefined}
    >
      <RecordTable
        rows={rows}
        href={(r) => `/accounts/${r.id}`}
        columns={[
          { key: "name", label: "Customer", render: (r) => r.name },
          { key: "type", label: "Status", render: (r) => <StatusPill label={r.type} tone={r.type === "Repeat" ? "navy" : "up"} /> },
          { key: "city", label: "City", hide: "md", render: (r) => <span className="text-muted">{r.city}</span> },
          { key: "next", label: "Next", hide: "md", render: (r) => r.next },
          { key: "who", label: "Owner", hide: "lg", render: (r) => r.owner },
          { key: "jobs", label: "Jobs", hide: "lg", render: (r) => r.jobs },
          { key: "life", label: "Lifetime", render: (r) => <span className="font-semibold tabular-nums">{money(r.lifetime)}</span> },
        ]}
      />
    </ListPage>
  );
}
