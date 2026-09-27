import { streetViewSrc } from "@/components/dispatch-map";
import { cn } from "@/lib/cn";
import { initials, behind } from "./part-01";
import { DispatchPageView4 } from "./part-04";

export function StreetPane({ lat, lng, name, city }: { lat: number; lng: number; name: string; city: string }) {
  return (
    <div className="mb-3 overflow-hidden rounded-md border border-line bg-page">
      <iframe title={`Street view ${name}`} src={streetViewSrc(lat, lng)} className="hidden h-48 w-full border-0 lg:block" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <p className="min-w-0 truncate text-[12px] font-semibold">
          {name}
          {city ? ` · ${city}` : ""}
        </p>
        <a href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`} target="_blank" rel="noreferrer" className="shrink-0 text-[11px] font-semibold text-navy">
          Open
        </a>
      </div>
    </div>
  );
}

export function DispatchPageView(props: { bag: { open: any; pickStop: any; here: any; dayJobs: any; hour: any; selected: any; pick: any; dropOnUnit: any; drive: any; live: any; lateCount: any; stopCount: any; office: any; view: any; peoplePins: any; houses: any; paths: any; selectedStopId: any; showAll: any; drawer: any; sheet: any; setSheet: any; selectedStops: any; setDrawer: any; street: any; sendTo: any; setToId: any; others: any; sendRest: any; optimize: any } }) {
  const { open, pickStop, here, dayJobs, hour, selected, pick, dropOnUnit, drive, live, lateCount, stopCount, office, view, peoplePins, houses, paths, selectedStopId, showAll, drawer, sheet, setSheet, selectedStops, setDrawer, street, sendTo, setToId, others, sendRest, optimize } = props.bag;
  return (
    <div className="grid min-h-0 min-w-0 flex-1 grid-rows-1 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="hidden min-h-0 overflow-auto border-b border-line bg-card lg:block lg:border-r lg:border-b-0">
          {open.length ? (
            <div className="border-b border-line">
              <p className="px-3 py-2 text-[11px] font-bold tracking-wide text-muted uppercase">Open</p>
              <ul>
                {open.map((s: any) => (
                  <li key={s.id} className="border-b border-line last:border-b-0">
                    <button
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/stop", s.id);
                        e.dataTransfer.setData("text/book-id", s.id);
                      }}
                      onClick={() => pickStop("", s.id)}
                      className="flex w-full items-start gap-2 border-l-4 border-l-transparent px-3 py-2.5 text-left"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-navy text-[10px] font-bold text-card">{s.title.slice(0, 1)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-semibold">{s.title}</span>
                          <span className="text-[11px] font-semibold text-muted">{s.type}</span>
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-muted">
                          {s.city || "No city"} · {s.status}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="px-3 py-2 text-[11px] font-bold tracking-wide text-muted uppercase">People</p>
          <ul>
            {here.map((u: any) => {
              const mine = dayJobs.filter((e: any) => e.resourceId === u.id);
              const late = behind(mine, hour);
              const on = selected?.id === u.id;
              return (
                <li key={u.id} className={cn("border-b border-line", on && "bg-page")}>
                  <button
                    type="button"
                    onClick={() => pick(u.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => dropOnUnit(u.id, e)}
                    className={cn("flex w-full items-start gap-2 border-l-4 px-3 py-2.5 text-left", on ? "border-l-navy" : "border-l-transparent")}
                  >
                    <span className="relative mt-0.5 grid size-9 shrink-0 place-items-center rounded-md bg-navy text-[10px] font-bold text-card">
                      {initials(u.name)}
                      {late ? <i className="absolute -top-1 -right-1 size-2.5 rounded-full border-2 border-card bg-stop" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-semibold">{u.name}</span>
                        <span className={cn("shrink-0 text-[11px] font-semibold", late ? "text-stop" : "text-muted")}>{late ? "Behind" : mine.length ? `${mine.length}` : "Open"}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-muted">
                        {mine.length ? `${mine.length} stop${mine.length === 1 ? "" : "s"}` : "No stops"}
                        {drive[u.id] ? ` · ${drive[u.id].mins} min` : ""}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <DispatchPageView2 bag={{ live, open, lateCount, stopCount, office, view, peoplePins, houses, paths, selected, selectedStopId, showAll, pick, pickStop, drawer, sheet, setSheet, selectedStops, hour, drive, setDrawer, street, sendTo, setToId, others, sendRest, optimize, dropOnUnit, here }} />
      </div>
  );
}

export function DispatchPageView2(props: { bag: { live: any; open: any; lateCount: any; stopCount: any; office: any; view: any; peoplePins: any; houses: any; paths: any; selected: any; selectedStopId: any; showAll: any; pick: any; pickStop: any; drawer: any; sheet: any; setSheet: any; selectedStops: any; hour: any; drive: any; setDrawer: any; street: any; sendTo: any; setToId: any; others: any; sendRest: any; optimize: any; dropOnUnit: any; here: any } }) {
  const { live, open, lateCount, stopCount, office, view, peoplePins, houses, paths, selected, selectedStopId, showAll, pick, pickStop, drawer, sheet, setSheet, selectedStops, hour, drive, setDrawer, street, sendTo, setToId, others, sendRest, optimize, dropOnUnit, here } = props.bag;
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col lg:min-h-[22rem]">
          <p className="hidden shrink-0 border-b border-line bg-card px-4 py-1.5 text-center text-[13px] tabular-nums lg:block">
            <span className="font-bold">{live}</span>
            <span className="text-muted"> moving</span>
            {open.length ? (
              <>
                <span className="text-muted"> · </span>
                <span className="font-bold">{open.length}</span>
                <span className="text-muted"> open</span>
              </>
            ) : null}
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
          <DispatchPageView4 bag={{ office, view, peoplePins, houses, paths, selected, selectedStopId, showAll, pick, pickStop, live, lateCount, stopCount, drawer, open, sheet, setSheet, selectedStops, hour, drive, setDrawer, street, sendTo, setToId, others, sendRest, optimize, dropOnUnit, here }} />
        </div>
  );
}
