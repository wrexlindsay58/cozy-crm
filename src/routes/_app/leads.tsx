import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, CalendarCheck, CircleAlert, CircleCheck, UserRound, UserX } from "lucide-react";
import { Empty, StatusPill } from "@/components/ui-bits";
import { RecordTable } from "@/components/record-table";
import { NewLeadSheet } from "@/features/lead/new-sheet";
import { ContactName, countsFor, QuietFilter, Reach, WhoStack } from "@/features/lists/bits";
import { ListPage } from "@/features/lists/list-page";
import { sortRows, type Sort } from "@/features/lists/sort";
import { setLeadStatus, useOps } from "@/features/ops/store";
import { useDoors } from "@/features/flow/door";
import type { Lead } from "@/lib/crm-data";

export const Route = createFileRoute("/_app/leads")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => {
    const q = typeof s.q === "string" ? s.q : "";
    return q ? { q } : {};
  },
  component: LeadsPage,
});

const DISPOSITIONS = ["New", "No answer", "Contacted", "Pending", "Confirmed", "Unmarked", "Ran", "One legger", "No run", "Missed", "Not qualified", "Cancelled", "Abandoned", "Sold"];
const RANK: Record<string, number> = { "No-show": 0, "Needs disposition": 1, "One legger": 2, Ran: 3, Confirmed: 4, Booked: 5, Other: 6 };

function queueOf(l: Lead) {
  if (l.status === "Missed" || l.status === "No run" || l.status === "No-show") return "No-show";
  if (l.status === "One legger") return "One legger";
  if (l.status === "Ran") return "Ran";
  if (l.status === "Confirmed") return "Confirmed";
  if (l.status === "Pending") return "Booked";
  if (l.status === "Unmarked") return "Needs disposition";
  return "Other";
}

function nextOf(l: Lead) {
  const q = queueOf(l);
  if (q === "Needs disposition") return "Set a disposition";
  if (q === "No-show") return "Reset the run";
  if (q === "One legger") return "Call the other owner";
  if (q === "Ran") return "Follow up on the run";
  if (l.next) return `Run · ${l.next}`;
  return "Book a run";
}

function LeadsPage() {
  const { q = "" } = Route.useSearch();
  const { leads, history, appointments } = useOps();
  const doors = useDoors();
  const [view, setView] = useState("All");
  const [query, setQuery] = useState(q);
  const [office, setOffice] = useState("");
  const [owner, setOwner] = useState("");
  const [sort, setSort] = useState<Sort>({ key: "rank", dir: "asc" });
  const [open, setOpen] = useState(false);

  const pool = useMemo(() => leads.filter((l) => !doors[l.id] || doors[l.id].place === "lead"), [leads, doors]);
  const offices = [...new Set(pool.map((l) => l.office))].sort();
  const owners = [...new Set(pool.map((l) => l.closer))].sort();
  const scoped = pool.filter((l) => (!office || l.office === office) && (!owner || l.closer === owner));
  const cards = countsFor(scoped, [
    { id: "Needs disposition", label: "Needs disposition", tone: "watch", icon: CircleAlert, match: (l) => queueOf(l) === "Needs disposition" },
    { id: "Booked", label: "Booked", icon: Calendar, match: (l) => queueOf(l) === "Booked" },
    { id: "Confirmed", label: "Confirmed", icon: CalendarCheck, match: (l) => queueOf(l) === "Confirmed" },
    { id: "Ran", label: "Ran", icon: CircleCheck, match: (l) => queueOf(l) === "Ran" },
    { id: "One legger", label: "One legger", tone: "watch", icon: UserRound, match: (l) => queueOf(l) === "One legger" },
    { id: "No-show", label: "No-show", tone: "alert", icon: UserX, match: (l) => queueOf(l) === "No-show" },
  ]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = scoped.filter((l) => {
      if (view !== "All" && queueOf(l) !== view) return false;
      if (!needle) return true;
      return [l.name, l.secondaryName, l.city, l.address, l.phone, l.email, l.closer, l.setter, l.source].join(" ").toLowerCase().includes(needle);
    });
    return sortRows(filtered, sort, (l, key) => {
      if (key === "name") return l.name;
      if (key === "status" || key === "result") return l.status;
      if (key === "who") return l.closer;
      if (key === "touch") return history[l.id]?.[0]?.at ?? l.created;
      if (key === "rank" || key === "next") return RANK[queueOf(l)] ?? 6;
      return nextOf(l);
    });
  }, [scoped, view, query, sort, history]);

  return (
    <>
      <ListPage
        title="Leads"
        count={`${rows.length} shown`}
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
        actions={
          <button type="button" onClick={() => setOpen(true)} className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">
            New lead
          </button>
        }
        empty={rows.length === 0 ? <Empty>Nothing in this queue.</Empty> : undefined}
      >
        <RecordTable
          rows={rows}
          href={(r) => `/leads/${r.id}`}
          sort={sort}
          onSort={(key) => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }))}
          columns={[
            { key: "name", label: "Name", render: (r) => <ContactName name={r.name} second={r.secondaryName} place={r.address || r.city} /> },
            { key: "reach", label: "Phone", render: (r) => <Reach phone={r.phone} email={r.email} /> },
            { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={r.tone} /> },
            { key: "next", label: "Next", render: (r) => <span>{nextOf(r)}</span> },
            {
              key: "result",
              label: "Result",
              interactive: true,
              render: (r) => (
                <select
                  aria-label={`Result for ${r.name}`}
                  value={r.status}
                  onChange={(e) => setLeadStatus(r.id, e.target.value)}
                  className="h-8 max-w-40 rounded-md border border-line bg-card px-2 text-[12px]"
                >
                  {[r.status, ...DISPOSITIONS].filter((v, i, all) => all.indexOf(v) === i).map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              ),
            },
            { key: "who", label: "Who", render: (r) => <WhoStack name={r.closer} /> },
            { key: "source", label: "Source", hide: "lg", render: (r) => <span className="text-muted">{r.source}</span> },
            { key: "touch", label: "Last touch", hide: "lg", render: (r) => <span className="text-muted">{history[r.id]?.[0]?.at ?? r.created}</span> },
          ]}
        />
      </ListPage>
      <NewLeadSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
