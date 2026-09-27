import { Drill } from "./bits-01";
import { mixValue } from "./bits-04";
import { useSalesDashboard2 } from "./useSalesDashboard2";
import { cn } from "@/lib/cn";
import { Tip } from "@/components/tip";
import { BookPick } from "@/features/book/pick";
import { markets, ranges } from "@/lib/sales-data";

export function useSalesDashboard3(bag: ReturnType<typeof useSalesDashboard2>) {
  const { range, setRange, market, setMarket, person, setPerson, sourceView, t, leftover, people, sourceRows } = bag;
const rates = [
    {
      key: "leads" as Drill,
      label: "Lead to set",
      a: t.appts,
      b: t.leads,
      priorA: t.priorAppts,
      priorB: t.priorLeads,
      drop: `${Math.max(t.leads - t.appts, 0).toLocaleString()} not set`,
    },
    {
      key: "appointments" as Drill,
      label: "Set to run",
      a: t.runs,
      b: t.appts,
      priorA: t.priorRuns,
      priorB: t.priorAppts,
      drop: `${leftover} no run`,
    },
    {
      key: "sold" as Drill,
      label: "Run to sold",
      a: t.deals,
      b: t.runs,
      priorA: t.priorDeals,
      priorB: t.priorRuns,
      drop: `${Math.max(t.runs - t.deals, 0)} no deal`,
    },
    {
      key: "projects" as Drill,
      label: "Sold to job",
      a: t.jobs,
      b: t.deals,
      priorA: t.priorJobs,
      priorB: t.priorDeals,
      drop: `${Math.max(t.deals - t.jobs, 0)} not booked`,
    },
  ];

const sourceMax = Math.max(...sourceRows.map((s) => mixValue(sourceView, s.amount, s.qty)), 1);

const filters = (
    <>
      {range === "day" ? (
        <Tip label="As of this hour" on>
          <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-muted">
            <i className="live-pip" />
            Live
          </span>
        </Tip>
      ) : null}
      <BookPick value={market} onChange={setMarket} items={markets.map((m) => ({ id: m.id, label: m.label, short: m.id === "all" ? "Markets" : m.label, hint: m.id === "all" ? "All markets" : undefined }))} className="max-md:w-full max-md:max-w-none max-md:flex-1 max-md:justify-between" />
      <BookPick value={person} onChange={setPerson} items={people.map((p) => ({ ...p, short: p.id === "all" ? "People" : p.label, hint: p.id === "all" ? "All people" : undefined }))} className="max-md:w-full max-md:max-w-none max-md:flex-1 max-md:justify-between" />
      <BookPick plain value={range} onChange={setRange} items={[...ranges]} className="max-md:w-full max-md:max-w-none max-md:flex-1 max-md:justify-between md:hidden" />
      <div className="ml-auto hidden shrink-0 rounded-md bg-page p-0.5 md:flex">
        {ranges.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRange(r.id)}
            className={cn("h-8 rounded-sm px-2.5 text-[12px] font-semibold", range === r.id ? "bg-card text-ink" : "text-muted")}
          >
            {r.label}
          </button>
        ))}
      </div>
    </>
  );
  return { ...bag, rates, sourceMax, filters };
}
