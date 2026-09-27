import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, X } from "lucide-react";
import { DispatchMap } from "@/components/dispatch-map";
import { cn } from "@/lib/cn";
import { BookPick } from "@/features/book/pick";
import { setBookDay, shiftBookDay } from "@/features/book/day";
import { TODAY } from "@/features/book/time";
import { VIEWS, initials, behind } from "./part-01";
import { DispatchPageView6 } from "./part-06";

export function DispatchPageView3(props: { bag: { view: any; setView: any; office: any; setOffice: any; roster: any; setSelectedId: any; setSelectedStopId: any; setDrawer: any; setSheet: any; cursor: any; showAll: any; setShowAll: any } }) {
  const { view, setView, office, setOffice, roster, setSelectedId, setSelectedStopId, setDrawer, setSheet, cursor, showAll, setShowAll } = props.bag;
  return (
    <header className="shrink-0 border-b border-line bg-card px-3 py-2 md:hidden">
        <div className="flex items-center gap-2">
          <h1 className="text-[20px] font-bold tracking-tight">Map</h1>
          <div className="ml-auto flex rounded-md bg-page p-0.5">
            {VIEWS.map((v) => (
              <button key={v.id} type="button" className={cn("h-8 px-2.5 text-[13px] font-semibold", view === v.id ? "bg-navy text-card" : "text-muted")} onClick={() => setView(v.id)}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-2 flex flex-nowrap items-center gap-1.5 overflow-x-auto">
          <BookPick
            value={office}
            onChange={(v) => {
              setOffice(v);
              const first = roster.find((u: any) => v === "all" || u.office === v)?.id ?? null;
              setSelectedId(first);
              setSelectedStopId(null);
              setDrawer(true);
              setSheet("peek");
            }}
            items={[
              { id: "all", label: "All markets" },
              { id: "PHX", label: "Phoenix" },
              { id: "DFW", label: "Dallas" },
            ]}
          />
          <button type="button" aria-label="Previous day" className="grid size-8 shrink-0 place-items-center rounded-md border border-line" onClick={() => shiftBookDay(-1)}>
            <ChevronLeft className="size-4" />
          </button>
          <button type="button" className="h-8 shrink-0 rounded-md border border-line px-2 text-xs font-semibold" onClick={() => setBookDay(new Date(TODAY))}>
            Today
          </button>
          <button type="button" aria-label="Next day" className="grid size-8 shrink-0 place-items-center rounded-md border border-line" onClick={() => shiftBookDay(1)}>
            <ChevronRight className="size-4" />
          </button>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold">{cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
          <button
            type="button"
            className={cn("h-8 shrink-0 rounded-md border px-2.5 text-xs font-semibold", showAll ? "border-navy bg-navy text-card" : "border-line")}
            onClick={() => setShowAll(true)}
          >
            All routes
          </button>
        </div>
      </header>
  );
}

export function DispatchPageView4(props: { bag: { office: any; view: any; peoplePins: any; houses: any; paths: any; selected: any; selectedStopId: any; showAll: any; pick: any; pickStop: any; live: any; lateCount: any; stopCount: any; drawer: any; open: any; sheet: any; setSheet: any; selectedStops: any; hour: any; drive: any; setDrawer: any; street: any; sendTo: any; setToId: any; others: any; sendRest: any; optimize: any; dropOnUnit: any; here: any } }) {
  const { office, view, peoplePins, houses, paths, selected, selectedStopId, showAll, pick, pickStop, live, lateCount, stopCount, drawer, open, sheet, setSheet, selectedStops, hour, drive, setDrawer, street, sendTo, setToId, others, sendRest, optimize, dropOnUnit, here } = props.bag;
  return (
    <div className="relative min-h-0 min-w-0 flex-1">
          <DispatchMap office={office} view={view} people={peoplePins} houses={houses} paths={paths} selectedId={selected?.id ?? null} selectedStopId={selectedStopId} showAll={showAll} onSelect={pick} onPickStop={pickStop} />
          <p className="absolute top-2 left-2 z-10 max-w-[70%] rounded-md border border-line bg-card/95 px-2.5 py-1 text-[11px] font-semibold tabular-nums shadow-sm lg:hidden">
            <span className="font-bold">{live}</span>
            <span className="text-muted"> live</span>
            {lateCount ? (
              <>
                <span className="text-muted"> · </span>
                <span className="font-bold text-stop">{lateCount}</span>
                <span className="text-muted"> behind</span>
              </>
            ) : null}
            <span className="text-muted"> · </span>
            <span className="font-bold">{stopCount}</span>
            <span className="text-muted"> stops</span>
          </p>
          {drawer && (selected || open.length) ? (
            <aside
              className={cn(
                "absolute inset-x-0 bottom-0 z-10 flex flex-col border-t border-line bg-card shadow-sm",
                sheet === "open" ? "max-h-[70%] overflow-auto" : "overflow-hidden",
                "lg:inset-y-0 lg:left-auto lg:max-h-none lg:w-96 lg:overflow-auto lg:border-t-0 lg:border-l",
              )}
            >
              <button
                type="button"
                className="relative flex w-full items-center gap-3 px-4 pt-4 pb-3 text-left lg:hidden"
                onClick={() => setSheet((s: any) => (s === "peek" ? "open" : "peek"))}
                aria-expanded={sheet === "open"}
              >
                <i className="absolute top-1.5 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-line" />
                {selected ? (
                  <span className="relative grid size-10 shrink-0 place-items-center rounded-md bg-navy text-[11px] font-bold text-card">
                    {initials(selected.name)}
                    {behind(selectedStops, hour) ? <i className="absolute -top-1 -right-1 size-2.5 rounded-full border-2 border-card bg-stop" /> : null}
                  </span>
                ) : (
                  <span className="grid size-10 shrink-0 place-items-center rounded-md bg-page text-[11px] font-bold text-navy">{open.length}</span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{selected ? selected.name : "Open work"}</span>
                  <span className={cn("block truncate text-[12px]", selected && behind(selectedStops, hour) ? "font-semibold text-stop" : "text-muted")}>
                    {selected
                      ? [
                          behind(selectedStops, hour) ? "Behind" : selectedStops.length ? `${selectedStops.length} stops` : "Open",
                          drive[selected.id] ? `${drive[selected.id].mins} min` : "",
                        ]
                          .filter(Boolean)
                          .join(" · ")
                      : `${open.length} unassigned`}
                  </span>
                </span>
                {sheet === "open" ? <ChevronDown className="size-4 shrink-0 text-muted" /> : <ChevronUp className="size-4 shrink-0 text-muted" />}
              </button>
              <div className={cn("flex min-h-10 items-center justify-end px-2 max-lg:hidden")}>
                <button type="button" className="grid size-10 place-items-center" aria-label="Close" onClick={() => setDrawer(false)}>
                  <X className="size-4" />
                </button>
              </div>
              <DispatchPageView6 bag={{ sheet, selected, street, selectedStops, hour, drive, sendTo, setToId, others, sendRest, optimize, dropOnUnit, here, selectedStopId, pickStop, open }} />
            </aside>
          ) : null}
          </div>
  );
}
