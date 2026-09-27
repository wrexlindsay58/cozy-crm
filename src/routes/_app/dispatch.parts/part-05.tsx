import { cn } from "@/lib/cn";
import { PageTitle } from "@/components/ui-bits";
import { BookPick } from "@/features/book/pick";
import { setBookDay, shiftBookDay } from "@/features/book/day";
import { TODAY } from "@/features/book/time";
import { VIEWS } from "./part-01";
import { DispatchPageView } from "./part-03";
import { DispatchPageView3 } from "./part-04";

export function DispatchPageView5(props: { bag: { view: any; setView: any; office: any; setOffice: any; roster: any; setSelectedId: any; setSelectedStopId: any; setDrawer: any; setSheet: any; cursor: any; showAll: any; setShowAll: any; open: any; pickStop: any; here: any; dayJobs: any; hour: any; selected: any; pick: any; dropOnUnit: any; drive: any; live: any; lateCount: any; stopCount: any; peoplePins: any; houses: any; paths: any; selectedStopId: any; drawer: any; sheet: any; selectedStops: any; street: any; sendTo: any; setToId: any; others: any; sendRest: any; optimize: any } }) {
  const { view, setView, office, setOffice, roster, setSelectedId, setSelectedStopId, setDrawer, setSheet, cursor, showAll, setShowAll, open, pickStop, here, dayJobs, hour, selected, pick, dropOnUnit, drive, live, lateCount, stopCount, peoplePins, houses, paths, selectedStopId, drawer, sheet, selectedStops, street, sendTo, setToId, others, sendRest, optimize } = props.bag;
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden overscroll-none bg-page">
      <DispatchPageView3 bag={{ view, setView, office, setOffice, roster, setSelectedId, setSelectedStopId, setDrawer, setSheet, cursor, showAll, setShowAll }} />

      <header className="hidden min-h-14 shrink-0 items-center gap-2 overflow-x-auto border-b border-line bg-card px-4 md:flex">
        <PageTitle
          title="Map"
          flush
          actions={
            <>
              <div className="flex rounded-md bg-page p-0.5">
                {VIEWS.map((v) => (
                  <button key={v.id} type="button" className={cn("h-8 px-2.5 text-[13px] font-semibold", view === v.id ? "bg-navy text-card" : "text-muted")} onClick={() => setView(v.id)}>
                    {v.label}
                  </button>
                ))}
              </div>
              <BookPick
                value={office}
                onChange={(v) => {
                  setOffice(v);
                  const first = roster.find((u: any) => v === "all" || u.office === v)?.id ?? null;
                  setSelectedId(first);
                  setSelectedStopId(null);
                  setDrawer(true);
                }}
                items={[
                  { id: "all", label: "All markets" },
                  { id: "PHX", label: "Phoenix" },
                  { id: "DFW", label: "Dallas" },
                ]}
              />
            </>
          }
        />
      </header>

      <div className="hidden shrink-0 flex-nowrap items-center gap-2 overflow-x-auto border-b border-line bg-card px-4 py-2 md:flex">
        <button type="button" className="h-8 shrink-0 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => shiftBookDay(-1)}>
          Prev
        </button>
        <button type="button" className="h-8 shrink-0 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => setBookDay(new Date(TODAY))}>
          Today
        </button>
        <button type="button" className="h-8 shrink-0 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => shiftBookDay(1)}>
          Next
        </button>
        <p className="shrink-0 text-sm font-semibold">{cursor.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
        <button
          type="button"
          className={cn("ml-auto h-8 shrink-0 rounded-md border px-2.5 text-xs font-semibold", showAll ? "border-navy bg-navy text-card" : "border-line")}
          onClick={() => setShowAll(true)}
        >
          All routes
        </button>
      </div>

      <DispatchPageView bag={{ open, pickStop, here, dayJobs, hour, selected, pick, dropOnUnit, drive, live, lateCount, stopCount, office, view, peoplePins, houses, paths, selectedStopId, showAll, drawer, sheet, setSheet, selectedStops, setDrawer, street, sendTo, setToId, others, sendRest, optimize }} />
    </div>
  );
}
